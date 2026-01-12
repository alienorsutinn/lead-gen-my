import { WebsiteAnalyzerPrompt } from './prompts';

export interface LLMClient {
    analyzeWebsite(content: string): Promise<string>;
}

export class MockLLMClient implements LLMClient {
    constructor(private apiKey: string) { }

    async analyzeWebsite(content: string): Promise<string> {
        console.log('Analyzing content with length:', content.length);
        // STUB: In real world, call OpenAI/Anthropic here
        return JSON.stringify({
            score: 85,
            summary: "Good website content",
            services: ["Consulting", "Development"]
        });
    }
}

export const createLLMClient = (apiKey: string): LLMClient => {
    return new MockLLMClient(apiKey);
};
