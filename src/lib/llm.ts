import { GoogleGenerativeAI } from '@google/generative-ai';

// --- Gemini config ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');
const GEMINI_MODEL = 'gemini-3-flash-preview';
const GEMINI_MODEL_2 = 'gemini-2.5-flash';

// Expose model constants so routes can pick which model to use
export { GEMINI_MODEL, GEMINI_MODEL_2 };

// ============================================================
// Text-only generation (e.g. outfit suggestions)
// ============================================================
export async function generateFromText(prompt: string, modelOverride?: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: modelOverride || GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

// ============================================================
// Vision generation — text + images (e.g. garment scanning)
// ============================================================
export async function generateFromImages(
    prompt: string,
    images: { base64: string; mimeType: string }[],
    modelOverride?: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: modelOverride || GEMINI_MODEL });
    const imageParts = images.map((img) => ({
        inlineData: { data: img.base64, mimeType: img.mimeType },
    }));
    const result = await model.generateContent([prompt, ...imageParts]);
    return result.response.text();
}
