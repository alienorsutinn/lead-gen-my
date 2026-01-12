import OpenAI from 'openai';
import { VerdictSchema, Verdict } from './schemas';
import { VERDICT_SYSTEM_PROMPT } from './prompts';
import { z } from 'zod';

export interface VerdictInput {
    mobileScreenshotBase64?: string;
    desktopScreenshotBase64?: string;
    websiteCheck: any;
    psi: any;
}

export interface LLMClient {
    generateVerdict(input: VerdictInput): Promise<{ verdict: Verdict; model: string; raw: any }>;
}

export class OpenAIClient implements LLMClient {
    private client: OpenAI;
    private model = 'gpt-4o'; // Use consistent version in prod

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey });
    }

    async generateVerdict(input: VerdictInput): Promise<{ verdict: Verdict; model: string; raw: any }> {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: VERDICT_SYSTEM_PROMPT
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Analyze this business website.\n\nContext:\nWebsite Check: ${JSON.stringify(input.websiteCheck)}\nPSI Metrics: ${JSON.stringify(input.psi)}`
                    }
                ]
            }
        ];

        // Add images if available
        if (input.mobileScreenshotBase64) {
            (messages[1].content as any[]).push({
                type: 'image_url',
                image_url: {
                    url: `data:image/png;base64,${input.mobileScreenshotBase64}`,
                    detail: 'high' // Necessary for text reading? 'low' might save tokens but 'high' is better for design auditing
                }
            });
        }
        if (input.desktopScreenshotBase64) {
            (messages[1].content as any[]).push({
                type: 'image_url',
                image_url: {
                    url: `data:image/png;base64,${input.desktopScreenshotBase64}`,
                    detail: 'low' // Desktop overview, low might suffice
                }
            });
        }

        try {
            const response = await this.client.chat.completions.create({
                model: this.model,
                messages: messages,
                max_tokens: 1000,
                response_format: { type: 'json_object' }
            });

            const rawContent = response.choices[0].message.content;
            if (!rawContent) throw new Error('Empty response from LLM');

            const parsed = JSON.parse(rawContent);
            const verdict = VerdictSchema.parse(parsed);

            return {
                verdict,
                model: this.model,
                raw: parsed
            };

        } catch (error) {
            console.error('LLM Verdict Generation Failed:', error);
            // Simple retry logic could be added here or in the caller
            throw error;
        }
    }
}

export const createLLMClient = (apiKey: string): LLMClient => {
    return new OpenAIClient(apiKey);
};
