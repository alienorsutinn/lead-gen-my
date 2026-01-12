import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { VerdictSchema, Verdict } from './schemas';
import { VERDICT_SYSTEM_PROMPT } from './prompts';
import { z } from 'zod';

export interface VerdictInput {
    mobileScreenshotBase64?: string;
    desktopScreenshotBase64?: string;
    websiteCheck: any;
    psi: any;
    reviews?: Array<{ text: string; rating: number; author: string }>;
}

export interface LLMClient {
    generateVerdict(input: VerdictInput): Promise<{ verdict: Verdict; model: string; raw: any }>;
}

export class GeminiClient implements LLMClient {
    private genAI: GoogleGenerativeAI;
    private model = 'gemini-2.0-flash';

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async generateVerdict(input: VerdictInput): Promise<{ verdict: Verdict; model: string; raw: any }> {
        const model = this.genAI.getGenerativeModel({
            model: this.model,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        needs_intervention: { type: SchemaType.BOOLEAN },
                        severity: { type: SchemaType.STRING },
                        reasons: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        quick_wins: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                        offer_angle: { type: SchemaType.STRING }
                    },
                    required: ["needs_intervention", "severity", "reasons", "quick_wins", "offer_angle"]
                }
            },
            systemInstruction: VERDICT_SYSTEM_PROMPT
        });

        const promptParts: any[] = [
            `Analyze this business website.\n\nContext:\nWebsite Check: ${JSON.stringify(input.websiteCheck)}\nPSI Metrics: ${JSON.stringify(input.psi)}`
        ];

        if (input.reviews && input.reviews.length > 0) {
            promptParts[0] += `\n\nRecent Customer Reviews:\n${JSON.stringify(input.reviews)}\nIMPORTANT: Analyze these reviews for recurring complaints or praise to inform the 'offer_angle' and 'reasons'.`;
        }

        // WhatsApp-First Strategy for No-Website Leads
        const isNoWebsite = !input.websiteCheck || input.websiteCheck.status === 'no_website' || input.websiteCheck.status === 'broken';
        if (isNoWebsite) {
            promptParts[0] += `\n\nCRITICAL CONTEXT: This business has NO functional website. 
DO NOT recommend "Build a generic website".
INSTEAD, recommend a "WhatsApp-First Lead Capture Funnel".
The angle must be: "Missed Call = Lost Revenue".
Sell the value of a simple 1-page mobile site that captures leads via WhatsApp when they can't answer the phone.
Key Benefits to highlight: 24/7 capture, simple quote form, immediate trust proof.`;
        }

        if (input.mobileScreenshotBase64) {
            promptParts.push({
                inlineData: {
                    data: input.mobileScreenshotBase64,
                    mimeType: "image/png"
                }
            });
        }

        if (input.desktopScreenshotBase64) {
            promptParts.push({
                inlineData: {
                    data: input.desktopScreenshotBase64,
                    mimeType: "image/png"
                }
            });
        }

        try {
            const result = await model.generateContent(promptParts);
            const response = result.response;
            const text = response.text();

            if (!text) throw new Error('Empty response from Gemini');

            const parsed = JSON.parse(text);
            const verdict = VerdictSchema.parse(parsed);

            return {
                verdict,
                model: this.model,
                raw: parsed
            };

        } catch (error) {
            console.error('Gemini Verdict Generation Failed:', error);
            throw error;
        }
    }
}

export const createLLMClient = (apiKey: string): LLMClient => {
    return new GeminiClient(apiKey);
};
