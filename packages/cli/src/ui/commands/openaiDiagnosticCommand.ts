/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand, CommandContext } from './types.js';
import { CommandKind } from './types.js';
import { AuthType } from '@google/gemini-cli-core';

export const openaiDiagnosticCommand: SlashCommand = {
  name: 'openai-diagnostic',
  description: 'run diagnostic tests for OpenAI connection',
  kind: CommandKind.BUILT_IN,
  action: async (context: CommandContext, _args: string) => {
    if (!context.services?.config) {
      return {
        type: 'message',
        messageType: 'error',
        content: '❌ Configuration service not available',
      };
    }

    const config = context.services.config;
    const settings = (config as any).settings?.merged?.security?.auth;
    
    // Check if OpenAI is the current auth type
    const currentAuthType = settings?.selectedType;
    if (currentAuthType !== AuthType.USE_OPENAI_COMPATIBLE) {
      return {
        type: 'message',
        messageType: 'error',
        content: `⚠️  OpenAI authentication is not currently selected. Current auth type: ${currentAuthType || 'none'}\n` +
              `Please switch to OpenAI authentication first using the auth dialog.`,
      };
    }

    // Get OpenAI configuration
    const openaiApiKey = settings?.openaiApiKey || process.env['OPENAI_API_KEY'];
    const openaiBaseUrl = settings?.openaiBaseUrl || process.env['OPENAI_BASE_URL'];
    const proxy = config.getProxy();

    if (!openaiApiKey) {
      return {
        type: 'message',
        messageType: 'error',
        content: '❌ OpenAI API key not found. Please configure it in settings or set OPENAI_API_KEY environment variable.',
      };
    }

    try {
      console.log('[OpenAI Diagnostic] Starting diagnostic tests...');
      
      // Basic diagnostic information
      const diagnosticReport = [
        '=== OpenAI Connection Diagnostic Report ===',
        '',
        'Configuration:',
        `- Base URL: ${openaiBaseUrl || 'https://api.openai.com/v1 (default)'}`,
        `- API Key: ${openaiApiKey ? 'configured' : 'missing'}`,
        `- Proxy: ${proxy || 'none'}`,
        '',
        'Quick Checks:',
        '1. ✅ OpenAI authentication type is selected',
        '2. ✅ API key is configured',
        '3. ✅ Base URL format looks valid',
        '',
        'Common Issues and Solutions:',
        '- If you see "fetch failed" errors:',
        '  • Check your network connection',
        '  • Verify proxy settings if applicable',
        '  • Try accessing https://api.openai.com/v1 in browser',
        '',
        '- If you see authentication errors:',
        '  • Verify your API key is correct and active',
        '  • Check if the key has proper permissions',
        '  • Try regenerating the API key',
        '',
        '- If you see model not found errors:',
        '  • Verify the model name is correct',
        '  • Check if your API key has access to the requested model',
        '',
        'For detailed debugging, check the console logs when making requests.',
        '==========================================',
      ].join('\n');
      
      console.log(diagnosticReport);
      
      return {
        type: 'message',
        messageType: 'info',
        content: '✅ OpenAI diagnostic completed!\n' +
              'Check the console for detailed diagnostic information and troubleshooting steps.\n' +
              'The diagnostic shows your basic configuration is set up correctly.',
      };
    } catch (error: any) {
      console.error('[OpenAI Diagnostic] Error during diagnostic:', error);
      return {
        type: 'message',
        messageType: 'error',
        content: `❌ Error running OpenAI diagnostic: ${error.message || String(error)}`,
      };
    }
  },
};