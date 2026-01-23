import { GoogleGenAI, Type } from "@google/genai";
import { Medication, VitalRecord, MedicalReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const parsePrescriptionImage = async (base64Image: string): Promise<Partial<Medication>[]> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key provided for Gemini");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this prescription image. Extract a list of medications. 
            Return a JSON array where each object has:
            - name (string)
            - dosage (string)
            - frequency (string, e.g. "Once a day", "Morning and Night")
            
            Strictly return JSON.`
          }
        ]
      },
    });

    const text = response.text;
    if (!text) return [];

    const jsonString = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString) as Partial<Medication>[];
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    return [];
  }
};

export const analyzeMedicalDocument = async (base64Image: string): Promise<Partial<MedicalReport> | null> => {
  if (!process.env.API_KEY) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          {
            text: `Analyze this medical document. 
            Identify the type (Lab Report, Radiology, Discharge Summary, Prescription, or Other).
            Extract the date of the report (YYYY-MM-DD format if possible, otherwise string).
            Generate a short, 1-sentence summary of the key finding or content.
            Suggest a Title for this document.

            Return JSON with keys: type, date, summary, title.
            Strictly return JSON.`
          }
        ]
      },
    });

    const text = response.text;
    if (!text) return null;

    const jsonString = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonString) as Partial<MedicalReport>;
  } catch (error) {
    console.error("Gemini Doc Analysis Error:", error);
    return null;
  }
};

export const getVitalInsights = async (vitals: VitalRecord[]): Promise<string> => {
  if (!process.env.API_KEY || vitals.length === 0) return "No data available for analysis.";

  try {
    const recentVitals = [...vitals].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
    const vitalsStr = JSON.stringify(recentVitals.map(v => ({
      type: v.type,
      value: v.value,
      date: new Date(v.timestamp).toLocaleDateString()
    })));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a helpful medical assistant for a senior. 
        Here are the recent vital signs logs: ${vitalsStr}.
        
        Analyze the trends. Provide a brief, encouraging, plain-English summary (max 2 sentences).
        If there are any concerning trends (like consistently high BP), mention it gently.
        Do not give medical advice, just observations.
      `,
    });

    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "AI Insights temporarily unavailable.";
  }
};