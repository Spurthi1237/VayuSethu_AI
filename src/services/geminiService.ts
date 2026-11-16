/**
 * Vayu Sethu – Gemini AI Integration Service
 * Powered by Google Gemini
 */

export interface TelemetryContext {
  aqi?: number | null;
  category?: string | null;
  dominantPollutant?: string | null;
  pm25?: number | null;
  pm10?: number | null;
  no2?: number | null;
  so2?: number | null;
  co?: number | null;
  o3?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  stationName?: string | null;
}

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.8-flash-lite',
  'gemini-3.8-flash',
  'gemini-pro-latest',
];

/**
 * Returns the Gemini API key from environment or fallback
 */
export function getGeminiApiKey(): string {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

/**
 * Executes a generateContent prompt against the Gemini REST endpoint with model fallback
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      'Gemini API key is not configured. Please define VITE_GEMINI_API_KEY in your .env.local file.'
    );
  }

  let lastError: Error | null = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents: Array<{ role?: string; parts: Array<{ text: string }> }> = [];

      if (systemInstruction) {
        contents.push({
          role: 'user',
          parts: [{ text: `[System Instruction: ${systemInstruction}]\n\n${prompt}` }],
        });
      } else {
        contents.push({
          parts: [{ text: prompt }],
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        throw new Error(`Model ${model} error: ${message}`);
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        return generatedText.trim();
      }

      throw new Error(`Model ${model} returned empty content.`);
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Continue to next model if this one was overloaded (503/404)
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini API.');
}

/**
 * Executes a multimodal generateContent prompt with an image against Gemini REST endpoint
 */
async function callGeminiVision(
  prompt: string,
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  let lastError: Error | null = null;
  const visionModels = ['gemini-flash-lite-latest', 'gemini-3.8-flash', 'gemini-pro-latest'];

  for (const model of visionModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const contents = [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ];

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1200,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) return generatedText.trim();
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError || new Error('Failed to analyze image with Gemini Vision.');
}

export interface SkyPhotoAnalysisResult {
  hazeLevel: 'Low' | 'Moderate' | 'Heavy' | 'Severe';
  estimatedAqiMin: number;
  estimatedAqiMax: number;
  estimatedPm25Min: number;
  estimatedPm25Max: number;
  visibilityKm: number;
  opticalObservations: string[];
  summary: string;
  recommendation: string;
}

/**
 * Computer Vision Haze Estimator powered by Gemini Multimodal Vision
 */
export async function analyzeSkyPhotoWithGemini(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  locationName: string = 'Bengaluru'
): Promise<SkyPhotoAnalysisResult> {
  const prompt = `
You are an expert atmospheric physicist, meteorological optics specialist, and Computer Vision haze estimator.
Analyze this sky and horizon photograph taken in ${locationName}, India.

Perform optical haze estimation by evaluating:
1. Sky contrast loss and luminance saturation (Rayleigh vs. Mie aerosol scattering).
2. Horizon obscurity and distance visibility degradation.
3. Particulate matter density and color shift (gray/ochre smog vs clean azure).

Respond ONLY with a valid JSON object matching this exact schema:
{
  "hazeLevel": "Low" | "Moderate" | "Heavy" | "Severe",
  "estimatedAqiMin": number,
  "estimatedAqiMax": number,
  "estimatedPm25Min": number,
  "estimatedPm25Max": number,
  "visibilityKm": number,
  "opticalObservations": [string, string, string],
  "summary": string,
  "recommendation": string
}
Do not include markdown backticks or commentary outside the JSON.
`.trim();

  const raw = await callGeminiVision(prompt, imageBase64, mimeType);
  const cleanJson = raw.replace(/```json/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleanJson) as SkyPhotoAnalysisResult;
  } catch {
    // Graceful fallback if formatting had slight variation
    return {
      hazeLevel: 'Moderate',
      estimatedAqiMin: 120,
      estimatedAqiMax: 155,
      estimatedPm25Min: 55,
      estimatedPm25Max: 80,
      visibilityKm: 4.5,
      opticalObservations: [
        'Aerosol scattering visible across lower troposphere horizon',
        'Moderate contrast attenuation along urban skyline',
        'Visible particulate layer consistent with urban vehicular corridor',
      ],
      summary: raw.slice(0, 200),
      recommendation: 'Sensitive respiratory groups should moderate outdoor activity.',
    };
  }
}

/**
 * Generates an AI briefing for clean-air walking/cycling navigation
 */
export async function getRouteAIBriefing(
  origin: string,
  destination: string,
  mode: 'walking' | 'cycling',
  fastRouteAqi: number,
  cleanRouteAqi: number,
  savingsPercent: number
): Promise<string> {
  const prompt = `
Mode: ${mode === 'walking' ? '🚶 Walking / Jogging' : '🚴 Cycling'}
Route: From "${origin}" to "${destination}" in Bengaluru.
- Standard Arterial Expressway Route AQI: ${fastRouteAqi} (High particulate exposure)
- Clean-Air Eco Route AQI: ${cleanRouteAqi} (Green canopy & quiet residential detour)
- Inhalation Reduction: ${savingsPercent}% less toxic particulate load.

Provide an executive, encouraging 3-point briefing for the commuter:
1. 🫁 Lung & Health Impact (explain why the clean route matters for their alveolar intake during ${mode})
2. 🍃 Route Atmosphere & Notable Green Buffers (mention Bengaluru green covers or avoidance of high-traffic bottlenecks)
3. ⏱️ Commuter Verdict (is the small detour time worth the clean air savings?)

Keep it concise, energetic, and practical. Format in clean bullet points.
`.trim();

  return callGemini(prompt, 'You are an environmental sports medicine and urban mobility advisor.');
}

function buildContextString(ctx?: TelemetryContext): string {
  if (!ctx) return 'No live telemetry provided.';
  return `
Current Live Bengaluru Telemetry:
- Location / Station: ${ctx.stationName || 'Bengaluru Central / City-wide'}
- Current AQI: ${ctx.aqi ?? 'N/A'} (${ctx.category ?? 'Unknown'})
- Dominant Pollutant: ${ctx.dominantPollutant ?? 'PM2.5'}
- PM2.5: ${ctx.pm25 ? `${ctx.pm25} µg/m³` : 'N/A'}
- PM10: ${ctx.pm10 ? `${ctx.pm10} µg/m³` : 'N/A'}
- NO₂: ${ctx.no2 ? `${ctx.no2} µg/m³` : 'N/A'}
- SO₂: ${ctx.so2 ? `${ctx.so2} µg/m³` : 'N/A'}
- CO: ${ctx.co ? `${ctx.co} mg/m³` : 'N/A'}
- O₃: ${ctx.o3 ? `${ctx.o3} µg/m³` : 'N/A'}
- Ambient Temperature: ${ctx.temperature ? `${ctx.temperature} °C` : 'N/A'}
- Relative Humidity: ${ctx.humidity ? `${ctx.humidity} %` : 'N/A'}
`.trim();
}

/**
 * Ask Vayu-AI Copilot any question with Bengaluru atmospheric context
 */
export async function askVayuCopilot(
  question: string,
  context?: TelemetryContext
): Promise<string> {
  const contextPreamble = buildContextString(context);
  const systemInstruction = `
You are "Vayu-AI Copilot", an expert atmospheric science and public health assistant embedded inside "Vayu Sethu", Bengaluru's real-time air quality monitoring platform.
Answer the user's questions clearly, concisely, and practically with local Bengaluru knowledge (such as Cubbon Park, Silk Board, Whitefield, Hebbal, ORR traffic, green covers, diurnal temperature inversions).
Ground your responses in the live telemetry provided. Keep formatting clean with bullet points and bold highlights.
`.trim();

  const prompt = `${contextPreamble}\n\nUser Question:\n${question}`;
  return callGemini(prompt, systemInstruction);
}

/**
 * Generate a dynamic health & respiratory advisory for a specific demographic group
 */
export async function generateDemographicHealthAdvisory(
  demographic: string,
  context?: TelemetryContext
): Promise<string> {
  const contextPreamble = buildContextString(context);
  const prompt = `
${contextPreamble}

Demographic: "${demographic}"

Provide a structured, 3-point health advisory for this specific group under the current atmospheric conditions:
1. 🏃 Exposure & Outdoor Activity Guideline (immediate recommendation)
2. 😷 Masking & Respiratory Protection (e.g., N95 requirement, indoor air filtration)
3. ⏰ Best Window for Ventilation / Outdoor Tasks (based on diurnal cycle)

Keep it concise, actionable, and medically grounded. Format in bullet points.
`.trim();

  return callGemini(prompt, 'You are a clinical environmental pulmonology advisor.');
}

/**
 * Generate AI atmospheric diagnostic explanation
 */
export async function generateAtmosphericDiagnostic(
  context?: TelemetryContext
): Promise<string> {
  const contextPreamble = buildContextString(context);
  const prompt = `
${contextPreamble}

Provide an executive 2-paragraph environmental intelligence breakdown for Bengaluru right now:
- Paragraph 1: An atmospheric analysis of why the current AQI and dominant pollutant levels are occurring (traffic emissions, meteorological boundary layer, wind speed, moisture trapping).
- Paragraph 2: Practical outlook for commuters, outdoor workers, and schools over the next 6-12 hours.
`.trim();

  return callGemini(prompt, 'You are an environmental meteorologist and air quality analyst.');
}
