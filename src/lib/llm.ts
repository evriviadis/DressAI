import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import https from 'https';

// ============================================================
// LLM PROVIDER TOGGLE
// Change this to 'gemini' or 'kimi' to switch providers.
// ============================================================
const LLM_PROVIDER: 'gemini' | 'kimi' = 'gemini';

// --- Gemini config ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');
const GEMINI_MODEL = 'gemini-3-flash-preview';

// --- Kimi config (via NVIDIA API) ---
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const KIMI_MODEL = 'moonshotai/kimi-k2.5';
const KIMI_TIMEOUT_MS = 300_000; // 10 minutes — Kimi is a reasoning model, responses take 60s+

// Keep-alive agent so the TCP socket stays open during long waits
const httpsAgent = new https.Agent({ keepAlive: true });

function getNvidiaHeaders(stream: boolean) {
    return {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY || ''}`,
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json',
    };
}

/** Log first 5 chars of the API key for debugging */
function logKimiDebug(label: string) {
    const key = process.env.NVIDIA_API_KEY || '';
    console.log(`[Kimi ${label}] Key: ${key.substring(0, 5)}...  Model: ${KIMI_MODEL}`);
}

/**
 * Collect SSE chunks from a streamed NVIDIA response and return the full text.
 * Streaming prevents NVIDIA's gateway proxy from returning 504 on long requests.
 */
async function collectKimiStream(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
        let fullText = '';
        let buffer = '';

        stream.on('data', (chunk: Buffer) => {
            buffer += chunk.toString();

            // Process complete SSE lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // keep incomplete line in buffer

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || !trimmed.startsWith('data:')) continue;

                const data = trimmed.slice(5).trim();
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                        fullText += delta;
                    }
                } catch {
                    // skip malformed chunks
                }
            }
        });

        stream.on('end', () => {
            console.log(`[Kimi stream] Complete — ${fullText.length} chars received`);
            resolve(fullText);
        });

        stream.on('error', (err: Error) => reject(err));
    });
}

// ============================================================
// Text-only generation (e.g. outfit suggestions)
// ============================================================
export async function generateFromText(prompt: string): Promise<string> {
    if (LLM_PROVIDER === 'gemini') {
        return geminiText(prompt);
    }
    return kimiText(prompt);
}

// ============================================================
// Vision generation — text + images (e.g. garment scanning)
// ============================================================
export async function generateFromImages(
    prompt: string,
    images: { base64: string; mimeType: string }[]
): Promise<string> {
    if (LLM_PROVIDER === 'gemini') {
        return geminiVision(prompt, images);
    }
    return kimiVision(prompt, images);
}

// -------------------------------------------------------
// Gemini implementations
// -------------------------------------------------------

async function geminiText(prompt: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function geminiVision(
    prompt: string,
    images: { base64: string; mimeType: string }[]
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const imageParts = images.map((img) => ({
        inlineData: { data: img.base64, mimeType: img.mimeType },
    }));
    const result = await model.generateContent([prompt, ...imageParts]);
    return result.response.text();
}

// -------------------------------------------------------
// Kimi (NVIDIA API) — streaming to avoid NVIDIA 504 gateway timeout
// -------------------------------------------------------

async function kimiText(prompt: string): Promise<string> {
    logKimiDebug('text');

    const response = await axios.post(
        NVIDIA_API_URL,
        {
            model: KIMI_MODEL,
            messages: [
                { role: 'user', content: prompt },
            ],
            max_tokens: 16384,
            temperature: 1.0,
            top_p: 1.0,
            stream: true,
        },
        {
            headers: getNvidiaHeaders(true),
            responseType: 'stream',
            timeout: KIMI_TIMEOUT_MS,
            httpsAgent,
        }
    );
    return collectKimiStream(response.data);
}

async function kimiVision(
    prompt: string,
    images: { base64: string; mimeType: string }[]
): Promise<string> {
    logKimiDebug('vision');

    // Build content array: text + image parts as data-URIs (standard OpenAI vision format)
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: 'text', text: prompt },
        ...images.map((img) => ({
            type: 'image_url' as const,
            image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
        })),
    ];

    const response = await axios.post(
        NVIDIA_API_URL,
        {
            model: KIMI_MODEL,
            messages: [
                { role: 'user', content },
            ],
            max_tokens: 16384,
            temperature: 1.0,
            top_p: 1.0,
            stream: true,
        },
        {
            headers: getNvidiaHeaders(true),
            responseType: 'stream',
            timeout: KIMI_TIMEOUT_MS,
            httpsAgent,
        }
    );
    return collectKimiStream(response.data);
}
