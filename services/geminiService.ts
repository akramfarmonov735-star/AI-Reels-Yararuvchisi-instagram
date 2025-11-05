import { GoogleGenAI, Type, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateScriptAndImagePrompt(topic: string): Promise<{ script: string; imagePrompt: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Mavzu uchun kontent yarating: ${topic}`,
      config: {
        systemInstruction: `Siz qisqa, 1 daqiqalik Instagram Reels uchun kontent yaratadigan ijodiy yordamchisiz.
Javobingiz ikkita maydondan iborat JSON ob'ekti bo'lishi kerak:
1. "script": O'ZBEK TILIDA yozilgan, 100-150 so'zdan iborat qiziqarli va ixcham ssenariy. Ssenariy tabiiy va ravon o'qilishi kerak.
2. "imagePrompt": Ssenariyni vizual tarzda ifodalovchi, rasm yaratish modeli uchun batafsil, yuqori sifatli, fotorealistik yoki kinematik tavsif. Bu tavsif ingliz tilida bo'lishi mumkin, chunki rasm modellari ingliz tilini yaxshiroq tushunadi.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            script: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
          },
          required: ["script", "imagePrompt"],
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result.script && result.imagePrompt) {
      return result;
    } else {
      throw new Error("API'dan noto'g'ri JSON strukturasi qabul qilindi.");
    }
  } catch (error) {
    console.error("Ssenariy va tavsif yaratishda xato:", error);
    throw new Error("Gemini'dan ssenariy va tavsif yaratib bo'lmadi.");
  }
}

export async function generateImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '9:16',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("Hech qanday rasm yaratilmadi.");
        }
    } catch (error) {
        console.error("Rasm yaratishda xato:", error);
        throw new Error("Imagen'dan rasm yaratib bo'lmadi.");
    }
}

export async function generateAudio(script: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: script }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            return audioData;
        } else {
            throw new Error("Javobda audio ma'lumotlar olinmadi.");
        }
    } catch(error) {
        console.error("Audio yaratishda xato:", error);
        throw new Error("TTS modelidan audio yaratib bo'lmadi.");
    }
}