/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
} from '@google/genai';
import { GoogleGenAI } from '@google/genai';
import { createCodeAssistContentGenerator } from '../code_assist/codeAssist.js';
import type { Config } from '../config/config.js';

import type { UserTierId } from '../code_assist/types.js';
import { LoggingContentGenerator } from './loggingContentGenerator.js';
import { InstallationManager } from '../utils/installationManager.js';
import { analyzeOpenAIError, formatOpenAIError } from '../utils/openaiErrorHandler.js';

/**
 * Interface abstracting the core functionalities for generating content and counting tokens.
 */
export interface ContentGenerator {
  generateContent(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<GenerateContentResponse>;

  generateContentStream(
    request: GenerateContentParameters,
    userPromptId: string,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  countTokens(request: CountTokensParameters): Promise<CountTokensResponse>;

  embedContent(request: EmbedContentParameters): Promise<EmbedContentResponse>;

  userTier?: UserTierId;
}

export enum AuthType {
  LOGIN_WITH_GOOGLE = 'oauth-personal',
  USE_GEMINI = 'gemini-api-key',
  USE_VERTEX_AI = 'vertex-ai',
  CLOUD_SHELL = 'cloud-shell',
  USE_OPENAI_COMPATIBLE = 'openai-compatible',
}

export type ContentGeneratorConfig = {
  apiKey?: string;
  vertexai?: boolean;
  authType?: AuthType;
  proxy?: string;
};

export function createContentGeneratorConfig(
  config: Config,
  authType: AuthType | undefined,
): ContentGeneratorConfig {
  const geminiApiKey = process.env['GEMINI_API_KEY'] || undefined;
  const googleApiKey = process.env['GOOGLE_API_KEY'] || undefined;
  const googleCloudProject = process.env['GOOGLE_CLOUD_PROJECT'] || undefined;
  const googleCloudLocation = process.env['GOOGLE_CLOUD_LOCATION'] || undefined;
  
  // Check settings first for OpenAI, then fall back to environment variables
  const settings = (config as any).settings?.merged?.security?.auth;
  const openaiApiKey = settings?.openaiApiKey || process.env['OPENAI_API_KEY'] || undefined;

  const contentGeneratorConfig: ContentGeneratorConfig = {
    authType,
    proxy: config?.getProxy(),
  };

  // If we are using Google auth or we are in Cloud Shell, there is nothing else to validate for now
  if (
    authType === AuthType.LOGIN_WITH_GOOGLE ||
    authType === AuthType.CLOUD_SHELL
  ) {
    return contentGeneratorConfig;
  }

  if (authType === AuthType.USE_GEMINI && geminiApiKey) {
    contentGeneratorConfig.apiKey = geminiApiKey;
    contentGeneratorConfig.vertexai = false;

    return contentGeneratorConfig;
  }

  if (
    authType === AuthType.USE_VERTEX_AI &&
    (googleApiKey || (googleCloudProject && googleCloudLocation))
  ) {
    contentGeneratorConfig.apiKey = googleApiKey;
    contentGeneratorConfig.vertexai = true;

    return contentGeneratorConfig;
  }

  if (authType === AuthType.USE_OPENAI_COMPATIBLE && openaiApiKey) {
    contentGeneratorConfig.apiKey = openaiApiKey;
    contentGeneratorConfig.vertexai = false;

    return contentGeneratorConfig;
  }

  return contentGeneratorConfig;
}

export async function createContentGenerator(
  config: ContentGeneratorConfig,
  gcConfig: Config,
  sessionId?: string,
): Promise<ContentGenerator> {
  const version = process.env['CLI_VERSION'] || process.version;
  const userAgent = `GeminiCLI/${version} (${process.platform}; ${process.arch})`;
  const baseHeaders: Record<string, string> = {
    'User-Agent': userAgent,
  };

  if (
    config.authType === AuthType.LOGIN_WITH_GOOGLE ||
    config.authType === AuthType.CLOUD_SHELL
  ) {
    const httpOptions = { headers: baseHeaders };
    return new LoggingContentGenerator(
      await createCodeAssistContentGenerator(
        httpOptions,
        config.authType,
        gcConfig,
        sessionId,
      ),
      gcConfig,
    );
  }

  if (
    config.authType === AuthType.USE_GEMINI ||
    config.authType === AuthType.USE_VERTEX_AI
  ) {
    let headers: Record<string, string> = { ...baseHeaders };
    if (gcConfig?.getUsageStatisticsEnabled()) {
      const installationManager = new InstallationManager();
      const installationId = installationManager.getInstallationId();
      headers = {
        ...headers,
        'x-gemini-api-privileged-user-id': `${installationId}`,
      };
    }
    const httpOptions = { headers };

    const googleGenAI = new GoogleGenAI({
      apiKey: config.apiKey === '' ? undefined : config.apiKey,
      vertexai: config.vertexai,
      httpOptions,
    });
    return new LoggingContentGenerator(googleGenAI.models, gcConfig);
  }

  if (config.authType === AuthType.USE_OPENAI_COMPATIBLE) {
    let headers: Record<string, string> = { ...baseHeaders };
    if (gcConfig?.getUsageStatisticsEnabled()) {
      const installationManager = new InstallationManager();
      const installationId = installationManager.getInstallationId();
      headers = {
        ...headers,
        'x-gemini-api-privileged-user-id': `${installationId}`,
      };
    }
    
    // Add proxy support for OpenAI requests
    const httpOptions: any = { headers };
    if (config.proxy) {
      httpOptions.proxy = config.proxy;
    }

    // Check settings first, then fall back to environment variables
    const settings = (gcConfig as any).settings?.merged?.security?.auth;
    const openaiBaseUrl = settings?.openaiBaseUrl || process.env['OPENAI_BASE_URL'];
    const openaiModelName = settings?.openaiModelName || process.env['OPENAI_MODEL_NAME'];
    
    // Log OpenAI configuration for debugging (without exposing API key)
    console.error(`[OpenAI Config] Base URL: ${openaiBaseUrl || 'default (https://api.openai.com/v1)'}`);
    console.error(`[OpenAI Config] Model: ${openaiModelName || 'default (model specified in request)'}`);
    console.error(`[OpenAI Config] Proxy: ${config.proxy || 'none'}`);
    console.error(`[OpenAI Config] API Key: ${config.apiKey ? 'configured' : 'missing'}`);

    try {
      const googleGenAI = new GoogleGenAI({
        apiKey: config.apiKey === '' ? undefined : config.apiKey,
        vertexai: false,
        httpOptions,
      });

      // Configure for OpenAI-compatible endpoint
      if (openaiBaseUrl) {
        (googleGenAI as any).clientOptions = {
          ...(googleGenAI as any).clientOptions,
          baseURL: openaiBaseUrl,
        };
      }

      // Create a custom ContentGenerator implementation for OpenAI
      const openAIContentGenerator: ContentGenerator = {
        generateContent: async (params: any, userPromptId: string) => {
          try {
            console.error(`[OpenAI Request] Model: ${params.model || 'default'}, Contents: ${JSON.stringify(params.contents).substring(0, 200)}...`);
            const result = await googleGenAI.models.generateContent(params);
            console.error(`[OpenAI Response] Success: ${result.modelVersion || 'unknown model'}`);
            return result;
          } catch (error: any) {
            console.error(`[OpenAI Error] ${error.message || String(error)}`);
            if (error.stack) {
              console.error(`[OpenAI Error Stack] ${error.stack}`);
            }
            
            // Use the enhanced error analyzer
            const errorDetails = analyzeOpenAIError(error, {
              baseUrl: openaiBaseUrl,
              apiKey: config.apiKey,
              proxy: config.proxy,
              model: params.model,
            });
            
            console.error(formatOpenAIError(errorDetails));
            throw new Error(errorDetails.message);
          }
        },
        generateContentStream: async (params: any, userPromptId: string) => {
          try {
            console.error(`[OpenAI Stream Request] Model: ${params.model || 'default'}`);
            const stream = await googleGenAI.models.generateContentStream(params);
            console.error(`[OpenAI Stream Response] Stream created successfully`);
            return stream;
          } catch (error: any) {
            console.error(`[OpenAI Stream Error] ${error.message || String(error)}`);
            
            // Use the enhanced error analyzer
            const errorDetails = analyzeOpenAIError(error, {
              baseUrl: openaiBaseUrl,
              apiKey: config.apiKey,
              proxy: config.proxy,
              model: params.model,
            });
            
            console.error(formatOpenAIError(errorDetails));
            throw new Error(errorDetails.message);
          }
        },
        countTokens: async (params: any) => {
          try {
            console.error(`[OpenAI CountTokens Request] Model: ${params.model || 'default'}, Contents: ${JSON.stringify(params.contents || params).substring(0, 200)}...`);
            
            // Check if this is a Moonshot API which doesn't support countTokens endpoint
            if (openaiBaseUrl && openaiBaseUrl.includes('moonshot.cn')) {
              console.error('[OpenAI CountTokens] Moonshot API detected, using estimation fallback');
              // Fallback: estimate tokens based on text length (rough approximation)
              const text = params.contents?.[0]?.parts?.[0]?.text || params.text || JSON.stringify(params);
              const estimatedTokens = Math.ceil(text.length / 4); // Rough approximation: 1 token ≈ 4 chars
              console.error(`[OpenAI CountTokens Fallback] Estimated ${estimatedTokens} tokens for text length ${text.length}`);
              return { totalTokens: estimatedTokens };
            }
            
            const result = await googleGenAI.models.countTokens(params);
            console.error(`[OpenAI CountTokens Response] Success: ${result.totalTokens || 'unknown'} tokens`);
            return result;
          } catch (error: any) {
            console.error(`[OpenAI CountTokens Error] ${error.message || String(error)}`);
            if (error.stack) {
              console.error(`[OpenAI CountTokens Error Stack] ${error.stack}`);
            }
            
            // Use the enhanced error analyzer for countTokens errors
            const errorDetails = analyzeOpenAIError(error, {
              baseUrl: openaiBaseUrl,
              apiKey: config.apiKey,
              proxy: config.proxy,
              model: params.model,
            });
            
            console.error(formatOpenAIError(errorDetails));
            
            // For unsupported endpoints, provide a helpful fallback
            if (error.message?.includes('fetch failed') && openaiBaseUrl?.includes('moonshot.cn')) {
              console.error('[OpenAI CountTokens] Moonshot API may not support countTokens endpoint');
              console.error('[OpenAI CountTokens] Consider using chat completions with max_tokens=1 for token counting');
            }
            
            throw new Error(errorDetails.message);
          }
        },
        embedContent: async (params: any) => {
          try {
            console.error(`[OpenAI EmbedContent Request] Model: ${params.model || 'default'}, Content: ${JSON.stringify(params.content || params).substring(0, 200)}...`);
            
            // Check if this is a Moonshot API which doesn't support embedContent endpoint
            if (openaiBaseUrl && openaiBaseUrl.includes('moonshot.cn')) {
              console.error('[OpenAI EmbedContent] Moonshot API detected, embeddings not supported');
              // Provide a helpful error message for unsupported operation
              throw new Error(
                'Moonshot API does not support embeddings operations. ' +
                'Moonshot API only supports chat completions. ' +
                'Consider using a different OpenAI-compatible service that supports embeddings, ' +
                'or use only text generation features with Moonshot.'
              );
            }
            
            const result = await googleGenAI.models.embedContent(params);
            console.error(`[OpenAI EmbedContent Response] Success: ${result.embeddings ? 'embedding generated' : 'no embedding'}`);
            return result;
          } catch (error: any) {
            console.error(`[OpenAI EmbedContent Error] ${error.message || String(error)}`);
            if (error.stack) {
              console.error(`[OpenAI EmbedContent Error Stack] ${error.stack}`);
            }
            
            // Use the enhanced error analyzer for embedContent errors
            const errorDetails = analyzeOpenAIError(error, {
              baseUrl: openaiBaseUrl,
              apiKey: config.apiKey,
              proxy: config.proxy,
              model: params.model,
            });
            
            console.error(formatOpenAIError(errorDetails));
            throw new Error(errorDetails.message);
          }
        }
      };

      return new LoggingContentGenerator(openAIContentGenerator, gcConfig);
    } catch (error) {
      throw new Error(
        `Failed to create OpenAI-compatible content generator: ${error instanceof Error ? error.message : String(error)}. ` +
        `Please verify your OpenAI configuration: baseURL=${openaiBaseUrl || 'default'}, ` +
        `apiKey=${config.apiKey ? 'configured' : 'missing'}. ` +
        `If using a proxy, ensure it's properly configured.`
      );
    }
  }
  throw new Error(
    `Error creating contentGenerator: Unsupported authType: ${config.authType}`,
  );
}
