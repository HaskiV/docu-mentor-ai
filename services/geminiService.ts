
import { GoogleGenAI, Type } from "@google/genai";
import type { DocuMentorResult, FunctionToDocument } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getReadmePrompt = (code: string, language: string): string => {
  if (language === 'ru') {
    return `
      Вы — эксперт-разработчик на Python, которому поручено создание документации. На основе следующего кода Python сгенерируйте исчерпывающий файл README.md. README должен быть хорошо структурирован и содержать следующие разделы в формате Markdown на РУССКОМ ЯЗЫКЕ:
      1.  **Обзор:** Краткий абзац, описывающий назначение скрипта.
      2.  **Функциональность:** Маркированный список, описывающий ключевые возможности и то, что делает код.
      3.  **Зависимости:** Список всех импортированных библиотек. Если внешних библиотек нет, укажите, что используются только стандартные библиотеки Python.
      4.  **Пример использования:** Четкий пример того, как запустить скрипт или использовать его основные функции. Предположим, что пользователь сохранит код в файле с именем \`script.py\`.

      Вот код Python:
      \`\`\`python
      ${code}
      \`\`\`
    `;
  }

  // Fallback to English
  return `
    You are an expert Python developer tasked with creating documentation. Based on the following Python code, generate a comprehensive README.md file. The README should be well-structured and include the following sections in Markdown format:
    1.  **Summary:** A brief, one-paragraph overview of the script's purpose.
    2.  **Functionality:** A bulleted list describing the key features and what the code does.
    3.  **Dependencies:** A list of all imported libraries. If there are no external libraries, state that only standard Python libraries are used.
    4.  **Usage Example:** A clear example of how to run the script or use its main functions. Assume the user will save the code in a file named \`script.py\`.

    Here is the Python code:
    \`\`\`python
    ${code}
    \`\`\`
  `;
};

const generateReadme = async (code: string, language: string): Promise<string> => {
  const prompt = getReadmePrompt(code, language);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
};

const findFunctionsWithoutDocstrings = async (code: string): Promise<FunctionToDocument[]> => {
  const prompt = `
    You are a code analysis tool. Analyze the following Python code and identify all functions that are missing a docstring.
    Return your response as a JSON object that strictly follows the provided schema. Do not include any explanatory text outside of the JSON object.

    Here is the Python code to analyze:
    \`\`\`python
    ${code}
    \`\`\`
  `;
  
  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              function_code: {
                type: Type.STRING,
                description: "The full source code of a function that lacks a docstring."
              }
            },
            required: ["function_code"]
          }
        },
      },
  });

  try {
    const jsonText = response.text.trim();
    const functions = JSON.parse(jsonText) as FunctionToDocument[];
    return functions.filter(f => f.function_code && typeof f.function_code === 'string');
  } catch (e) {
    console.error("Failed to parse JSON for functions without docstrings:", e);
    return [];
  }
};

const getDocstringPrompt = (functionCode: string, language: string): string => {
    if (language === 'ru') {
        return `
            Вы — эксперт-разработчик на Python, который пишет превосходную документацию.
            Возьмите следующую функцию Python и добавьте к ней лаконичный докстринг в стиле Google на РУССКОМ ЯЗЫКЕ.
            Докстринг должен объяснять назначение функции, ее аргументы (если есть) и что она возвращает (если что-то возвращает).
            Верните ТОЛЬКО полный, обновленный код функции, включая новый докстринг. Не добавляйте никаких объяснений или окружающего текста.

            Пример ввода:
            def add(a, b):
                return a + b
            
            Пример вывода:
            \`\`\`python
            def add(a, b):
                """Складывает два числа вместе.

                Args:
                    a (int): Первое число.
                    b (int): Второе число.

                Returns:
                    int: Сумма двух чисел.
                """
                return a + b
            \`\`\`

            Теперь сгенерируйте докстринг для этой функции:
            \`\`\`python
            ${functionCode}
            \`\`\`
        `;
    }

    // Fallback to English
    return `
        You are an expert Python developer who writes excellent documentation.
        Take the following Python function and add a concise, Google-style docstring to it.
        The docstring should explain the function's purpose, its arguments (if any), and what it returns (if anything).
        Return ONLY the complete, updated function code, including the new docstring. Do not add any explanations or surrounding text.

        Example input:
        def add(a, b):
            return a + b
        
        Example output:
        \`\`\`python
        def add(a, b):
            """Adds two numbers together.

            Args:
                a (int): The first number.
                b (int): The second number.

            Returns:
                int: The sum of the two numbers.
            """
            return a + b
        \`\`\`

        Now, generate the docstring for this function:
        \`\`\`python
        ${functionCode}
        \`\`\`
    `;
};


const addDocstringToFunction = async (functionCode: string, language: string): Promise<string> => {
  const prompt = getDocstringPrompt(functionCode, language);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  // Clean up the response to remove markdown fences if they exist
  return response.text.replace(/^```python\n|```$/g, '').trim();
};

export const analyzeCodeAndGenerateDocs = async (code: string, language: string): Promise<DocuMentorResult> => {
  // Run README generation and code analysis in parallel
  const [readme, functionsToDocument] = await Promise.all([
    generateReadme(code, language),
    findFunctionsWithoutDocstrings(code)
  ]);

  let updatedCode = code;

  if (functionsToDocument.length > 0) {
      // Use a sequential loop to avoid race conditions and overlapping replacements
      for (const func of functionsToDocument) {
          const newFunctionCode = await addDocstringToFunction(func.function_code, language);
          updatedCode = updatedCode.replace(func.function_code, newFunctionCode);
      }
  }

  return {
    readme,
    updatedCode: updatedCode,
  };
};