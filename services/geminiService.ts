

import { GoogleGenAI, Type } from "@google/genai";
import type { DocuMentorResult, FunctionToDocument } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getReadmePrompt = (code: string, language: string): string => {
  if (language.startsWith('ru')) {
    return `
      Вы — Старший Технический Писатель и Евангелист Open Source. Ваша миссия — создать убедительный, понятный и профессиональный файл README.md для предоставленного Python-скрипта. Ваша цель — не просто задокументировать, а вдохновить разработчиков использовать этот инструмент.

      Ваш ответ должен содержать ТОЛЬКО содержимое файла README.md в формате Markdown на РУССКОМ ЯЗЫКЕ. Не включайте никакого разговорного текста, вроде "Вот ваш README".

      **Структура README.md:**

      1.  **Название проекта и Слоган:** Придумайте привлекательное название и однострочный слоган, который отражает суть скрипта.
      2.  **Обзор:** Напишите краткое описание в один абзац, объясняющее, что это за проект и какую проблему он решает. Цель — чтобы суть была понятна за 30 секунд.
      3.  **Ключевые Возможности:** Маркированный список, выделяющий наиболее важные функции. Сосредоточьтесь на пользе для пользователя.
      4.  **Зависимости:** Проанализируйте импорты в коде. Перечислите их. Если внешних зависимостей нет, укажите это.
      5.  **Быстрый старт:** Предоставьте четкое, пошаговое руководство по запуску скрипта. Предположим, что пользователь сохранил код как \`script.py\`. Включите конкретный пример использования.

      **Тон:** Профессиональный, ясный и немного восторженный. Язык должен быть доступен для разработчика среднего уровня.

      Вот код Python:
      \`\`\`python
      ${code}
      \`\`\`
    `;
  }

  // Fallback to English
  return `
    You are a Senior Technical Writer and Open Source Evangelist. Your mission is to create a compelling, clear, and professional README.md file for the provided Python script. The goal is not just to document, but to inspire developers to use this tool.

    Your response must be ONLY the raw Markdown content for the README.md file. Do not include any conversational text like "Here is your README."

    **README.md Structure:**

    1.  **Project Title & Slogan:** Create an engaging title and a one-line slogan that captures the essence of the script.
    2.  **Overview:** Write a concise, one-paragraph summary explaining what the project is and the problem it solves. Make it easy to understand in 30 seconds.
    3.  **Key Features:** A bulleted list highlighting the most important capabilities. Focus on the benefits for the user.
    4.  **Dependencies:** Analyze the imports in the code. List them. If there are no external dependencies, state that clearly.
    5.  **Quick Start Guide:** Provide a clear, step-by-step guide on how to get the script running. Assume the user saves the code as \`script.py\`. Include a concrete usage example.

    **Tone:** Professional, clear, and slightly enthusiastic. The language should be accessible to a mid-level developer.

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
    if (language.startsWith('ru')) {
        return `
            Вы — педантичный Senior Python Разработчик, одержимый чистым, читаемым и идеально задокументированным кодом. Ваша задача — написать докстринг в стиле Google для предоставленной Python-функции.

            **Ваш Процесс (на РУССКОМ ЯЗЫКЕ):**
            1.  **Глубокий Анализ:** Сначала проведите глубокий статический анализ кода функции. Поймите ее назначение, внутреннюю логику, параметры и возвращаемые значения.
            2.  **Выявление Крайних Случаев:** Рассмотрите потенциальные ошибки или исключения, которые может вызвать функция.
            3.  **Написание Докстринга:** На основе вашего анализа напишите исчерпывающий докстринг, соответствующий Google Python Style Guide. Он должен включать:
                *   Краткое описание в одну строку.
                *   Более детальное описание, если необходимо.
                *   Секцию \`Args:\` для всех параметров, с указанием их типа и назначения.
                *   Секцию \`Returns:\`, с указанием типа и значения возвращаемого результата.
                *   Секцию \`Raises:\`, если функция явно вызывает исключения (например, \`ValueError\`).

            **Ограничение:** Ваш ответ должен содержать ТОЛЬКО полный, обновленный Python-код функции, включая новый докстринг. НЕ оборачивайте его в Markdown-ограждения и не добавляйте никакого пояснительного текста.

            Теперь примените этот процесс к следующей функции:
            \`\`\`python
            ${functionCode}
            \`\`\`
        `;
    }

    // Fallback to English
    return `
        You are a meticulous Senior Python Developer with a passion for clean, readable, and perfectly documented code. Your task is to write a Google-style docstring for the given Python function.

        **Your Process:**
        1.  **Deep Analysis:** First, perform a deep static analysis of the function's code. Understand its purpose, internal logic, parameters, and return values.
        2.  **Identify Edge Cases:** Consider potential errors or exceptions the function might raise.
        3.  **Write the Docstring:** Based on your analysis, write a comprehensive docstring that follows the Google Python Style Guide. It must include:
            *   A concise one-line summary.
            *   A more detailed description if necessary.
            *   An \`Args:\` section for all parameters, detailing their type and purpose.
            *   A \`Returns:\` section, detailing the type and meaning of the return value.
            *   A \`Raises:\` section if the function explicitly raises exceptions (e.g., \`ValueError\`, \`TypeError\`).

        **Constraint:** Your response must be ONLY the full, updated Python code for the function, including the new docstring. Do NOT wrap it in Markdown fences (like \`\`\`python) or add any explanatory text.

        Now, apply this process to the following function:
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
          // Ensure we are replacing a valid piece of code to avoid errors.
          if(updatedCode.includes(func.function_code)) {
            const newFunctionCode = await addDocstringToFunction(func.function_code, language);
            updatedCode = updatedCode.replace(func.function_code, newFunctionCode);
          }
      }
  }

  return {
    readme,
    updatedCode: updatedCode,
  };
};
