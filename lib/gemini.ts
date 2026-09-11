// Google retires Gemini models regularly (gemini-2.0-flash now answers 404):
// override with GEMINI_MODEL instead of editing the API routes.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'
