
import { GoogleGenAI } from "@google/genai";
import { FileItem, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSmartInsights = async (query: string, files: FileItem[], lang: Language = 'pt') => {
  try {
    const fileList = files.map(f => `${f.name} (${f.type}, ${f.category || 'N/A'}, size: ${f.size} bytes)`).join('\n');
    const languageName = lang === 'pt' ? 'Portuguese (Brazil)' : 'English';
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User language: ${languageName}\nFile System Data:\n${fileList}\n\nUser query: ${query}`,
      config: {
        systemInstruction: `You are Aura Explorer's AI Assistant. You must respond in ${languageName}. Be helpful, concise, and professional. Analyze the provided file list to answer user queries.`,
      }
    });

    return response.text || (lang === 'pt' ? "Desculpe, não consegui processar isso." : "I'm sorry, I couldn't process that.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return lang === 'pt' ? "Erro ao conectar com a IA." : "Error connecting to AI service.";
  }
};
