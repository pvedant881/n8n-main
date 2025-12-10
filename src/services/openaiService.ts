import { OpenAI } from 'openai';
import { UserFile } from '../types';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const MAX_TOKENS_PER_REQUEST = parseInt(process.env.MAX_TOKENS_PER_REQUEST || '4000');

export const openaiService = {
  /**
   * Call OpenAI Chat Completions API with retry logic
   */
  async chat(
    prompt: string,
    userFiles: UserFile[],
    maxTokens: number = 1000,
    temperature: number = 0.7
  ): Promise<{ response: string; tokensUsed: number; filesReferenced: string[] }> {
    const client = getClient();

    // Prepare context from user files
    const fileContext = this.buildFileContext(userFiles);
    const filesReferenced = userFiles.map((f) => f.originalName);

    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(fileContext);

    // Prepare final message
    const finalPrompt = `${fileContext}\n\nUser Query: ${prompt}`;

    // Validate token count
    const estimatedTokens = this.estimateTokenCount(systemPrompt + finalPrompt);
    if (estimatedTokens > MAX_TOKENS_PER_REQUEST) {
      throw new Error(
        `Request exceeds maximum token limit (${estimatedTokens} > ${MAX_TOKENS_PER_REQUEST})`
      );
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await client.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: finalPrompt,
            },
          ],
          max_tokens: maxTokens,
          temperature,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('No response content from OpenAI');
        }

        const tokensUsed = response.usage?.total_tokens || estimatedTokens;

        return {
          response: content,
          tokensUsed,
          filesReferenced,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < MAX_RETRIES - 1) {
          await this.delay(RETRY_DELAY * (attempt + 1));
        }
      }
    }

    throw new Error(
      `Failed to get response from OpenAI after ${MAX_RETRIES} attempts: ${lastError?.message}`
    );
  },

  /**
   * Build context from uploaded files
   */
  buildFileContext(userFiles: UserFile[]): string {
    if (userFiles.length === 0) {
      return 'No files have been uploaded yet.';
    }

    const fileDescriptions = userFiles
      .map(
        (file) => `
File: ${file.originalName} (${new Date(file.uploadedAt).toLocaleDateString()})
Summary: ${file.summary}
---`
      )
      .join('\n');

    return `Available Documents:\n${fileDescriptions}`;
  },

  /**
   * Build system prompt with file descriptions
   */
  buildSystemPrompt(fileContext: string): string {
    return `You are a helpful assistant that analyzes documents and answers questions based on their content. 

${fileContext}

Please provide accurate answers based on the available documents. If information is not available in the documents, clearly state that. Always cite which file(s) you're referencing when providing information.`;
  },

  /**
   * Estimate token count (rough approximation)
   */
  estimateTokenCount(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  },

  /**
   * Check rate limiting
   */
  checkRateLimit(userId: string, requestCounts: Map<string, { count: number; timestamp: number }>): boolean {
    const limit = parseInt(process.env.RATE_LIMIT_REQUESTS || '100');
    const window = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000');

    const now = Date.now();
    const userRecord = requestCounts.get(userId);

    if (!userRecord) {
      requestCounts.set(userId, { count: 1, timestamp: now });
      return true;
    }

    if (now - userRecord.timestamp > window) {
      requestCounts.set(userId, { count: 1, timestamp: now });
      return true;
    }

    if (userRecord.count >= limit) {
      return false;
    }

    userRecord.count++;
    return true;
  },

  /**
   * Delay helper for retries
   */
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },
};
