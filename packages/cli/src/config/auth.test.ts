/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateAuthMethod } from './auth.js';
import { AuthType } from '@google/gemini-cli-core';

// Mock the settings module
vi.mock('./settings.js', () => ({
  loadEnvironment: vi.fn(),
  loadSettings: vi.fn().mockReturnValue({
    merged: {
      security: {
        auth: {
          openaiBaseUrl: undefined,
          openaiApiKey: undefined,
          openaiModelName: undefined,
        },
      },
    },
  }),
}));

describe('validateAuthMethod', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    // Clear relevant environment variables
    delete process.env['GEMINI_API_KEY'];
    delete process.env['GOOGLE_API_KEY'];
    delete process.env['GOOGLE_CLOUD_PROJECT'];
    delete process.env['GOOGLE_CLOUD_LOCATION'];
    delete process.env['OPENAI_API_KEY'];
    delete process.env['OPENAI_BASE_URL'];
    delete process.env['OPENAI_MODEL_NAME'];
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('OpenAI Compatible Authentication', () => {
    it('should return null when OPENAI_API_KEY is set', () => {
      process.env['OPENAI_API_KEY'] = 'test-api-key';
      
      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      
      expect(result).toBeNull();
    });

    it('should return error when OPENAI_API_KEY is missing', () => {
      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      
      expect(result).toBe('OPENAI_API_KEY environment variable not found. Add that to your environment and try again (no reload needed if using .env)!');
    });

    it('should return null when OPENAI_API_KEY is set and OPENAI_BASE_URL is valid', () => {
      process.env['OPENAI_API_KEY'] = 'test-api-key';
      process.env['OPENAI_BASE_URL'] = 'https://api.openai.com/v1';
      
      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      
      expect(result).toBeNull();
    });

    it('should return error when OPENAI_BASE_URL is invalid', () => {
      process.env['OPENAI_API_KEY'] = 'test-api-key';
      process.env['OPENAI_BASE_URL'] = 'invalid-url';
      
      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      
      expect(result).toBe('OPENAI_BASE_URL must be a valid URL format. Update your environment and try again!');
    });

    it('should return null when OPENAI_BASE_URL is not provided', () => {
      process.env['OPENAI_API_KEY'] = 'test-api-key';
      // OPENAI_BASE_URL is not set, which should be acceptable
      
      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      
      expect(result).toBeNull();
    });

    it('should handle empty OPENAI_API_KEY as missing', () => {
      process.env['OPENAI_API_KEY'] = '';
      
      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      
      expect(result).toBe('OPENAI_API_KEY environment variable not found. Add that to your environment and try again (no reload needed if using .env)!');
    });
  });

  describe('Other Authentication Methods', () => {
    it('should return null for LOGIN_WITH_GOOGLE', () => {
      const result = validateAuthMethod(AuthType.LOGIN_WITH_GOOGLE);
      expect(result).toBeNull();
    });

    it('should return null for CLOUD_SHELL', () => {
      const result = validateAuthMethod(AuthType.CLOUD_SHELL);
      expect(result).toBeNull();
    });

    it('should return error for USE_GEMINI without GEMINI_API_KEY', () => {
      const result = validateAuthMethod(AuthType.USE_GEMINI);
      expect(result).toBe('GEMINI_API_KEY environment variable not found. Add that to your environment and try again (no reload needed if using .env)!');
    });

    it('should return null for USE_GEMINI with GEMINI_API_KEY', () => {
      process.env['GEMINI_API_KEY'] = 'test-key';
      const result = validateAuthMethod(AuthType.USE_GEMINI);
      expect(result).toBeNull();
    });

    it('should return error for invalid auth method', () => {
      const result = validateAuthMethod('invalid-auth-method' as AuthType);
      expect(result).toBe('Invalid auth method selected.');
    });
  });
});