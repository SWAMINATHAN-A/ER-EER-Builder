import { GoogleGenAI } from '@google/genai';

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
];

export function formatGeminiError(err) {
  if (!err) return 'An unexpected error occurred.';
  const rawMsg = err.message || String(err);

  try {
    if (rawMsg.includes('{"error":') || rawMsg.startsWith('{')) {
      const jsonStart = rawMsg.indexOf('{');
      const jsonEnd = rawMsg.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(rawMsg.slice(jsonStart, jsonEnd + 1));
        if (parsed.error?.message) {
          if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
            return 'The AI model is currently experiencing high demand on Google servers. Spikes in demand are temporary. Please try again in a few seconds or use JSON specification.';
          }
          if (parsed.error.code === 429) {
            return 'API rate limit reached. Please wait a moment before trying again.';
          }
          return parsed.error.message;
        }
      }
    }
  } catch {}

  const lower = rawMsg.toLowerCase();
  if (lower.includes('503') || lower.includes('high demand') || lower.includes('unavailable')) {
    return 'The AI model is currently experiencing a temporary high demand spike. Please try again in a few seconds or use the JSON specification tab.';
  }
  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate limit')) {
    return 'API request rate limit reached. Please wait a few seconds and try again.';
  }

  return rawMsg;
}

export async function generateWithModelFallback(params) {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Please define VITE_GEMINI_API_KEY in your environment.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        ...params,
        model,
      });

      if (response && response.text) {
        return response;
      }
    } catch (err) {
      lastError = err;
      const msg = (err?.message || '').toLowerCase();
      const isDemandError =
        msg.includes('503') ||
        msg.includes('high demand') ||
        msg.includes('unavailable') ||
        msg.includes('429') ||
        msg.includes('rate') ||
        msg.includes('quota') ||
        msg.includes('resource_exhausted');

      if (!isDemandError && !msg.includes('not found') && !msg.includes('model')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('All candidate models are temporarily busy. Please retry in a few moments.');
}
