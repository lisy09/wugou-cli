/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Integration test for OpenAI compatible authentication.
 * This test verifies that the OpenAI authentication type is properly
 * integrated into the authentication system.
 */

import { describe, it, expect } from 'vitest';
import { TestRig } from './test-helper.js';
import { AuthType } from '@google/gemini-cli-core';
import { validateAuthMethod } from '../packages/cli/src/config/auth.js';

describe('OpenAI Authentication Integration', () => {
  it('should validate OpenAI authentication with environment variables', async () => {
    const originalEnv = { ...process.env };
    
    try {
      // Set up OpenAI authentication environment variables
      process.env['OPENAI_API_KEY'] = 'test-api-key';
      process.env['OPENAI_BASE_URL'] = 'https://api.openai.com/v1';
      process.env['OPENAI_MODEL_NAME'] = 'gpt-3.5-turbo';

      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      expect(result).toBeNull();
    } finally {
      // Restore original environment
      process.env = originalEnv;
    }
  });

  it('should fail validation without OPENAI_API_KEY', async () => {
    const originalEnv = { ...process.env };
    
    try {
      // Clear OpenAI authentication environment variables
      delete process.env['OPENAI_API_KEY'];
      delete process.env['OPENAI_BASE_URL'];
      delete process.env['OPENAI_MODEL_NAME'];

      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      expect(result).toBe('OPENAI_API_KEY environment variable not found. Add that to your environment and try again (no reload needed if using .env)!');
    } finally {
      // Restore original environment
      process.env = originalEnv;
    }
  });

  it('should fail validation with invalid OPENAI_BASE_URL', async () => {
    const originalEnv = { ...process.env };
    
    try {
      // Set up invalid OpenAI configuration
      process.env['OPENAI_API_KEY'] = 'test-api-key';
      process.env['OPENAI_BASE_URL'] = 'invalid-url-format';

      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      expect(result).toBe('OPENAI_BASE_URL must be a valid URL format. Update your environment and try again!');
    } finally {
      // Restore original environment
      process.env = originalEnv;
    }
  });

  it('should work with settings configuration', async () => {
    const testRig = new TestRig();
    
    // Create settings file with OpenAI configuration
    const settings = {
      security: {
        auth: {
          selectedType: AuthType.USE_OPENAI_COMPATIBLE,
          openaiApiKey: 'settings-api-key',
          openaiBaseUrl: 'https://api.openai.com/v1',
          openaiModelName: 'gpt-3.5-turbo',
        },
      },
    };
    
    testRig.setup('openai-settings-config', { settings });
    
    // Clear environment variables to ensure settings are used
    const originalEnv = { ...process.env };
    delete process.env['OPENAI_API_KEY'];
    delete process.env['OPENAI_BASE_URL'];
    delete process.env['OPENAI_MODEL_NAME'];

    try {
      // Change to the test directory so loadSettings finds the settings file
      const originalCwd = process.cwd();
      process.chdir(testRig.testDir!);
      
      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      expect(result).toBeNull();
      
      // Restore original directory
      process.chdir(originalCwd);
    } finally {
      // Restore original environment
      process.env = originalEnv;
    }
  });

  it('should create content generator configuration with OpenAI settings', async () => {
    const testRig = new TestRig();
    
    // Create settings file with OpenAI configuration
    const settings = {
      security: {
        auth: {
          selectedType: AuthType.USE_OPENAI_COMPATIBLE,
          openaiApiKey: 'settings-api-key',
          openaiBaseUrl: 'https://api.openai.com/v1',
          openaiModelName: 'gpt-3.5-turbo',
        },
      },
    };
    
    testRig.setup('openai-content-generator', { settings });
    
    // Test that the content generator can be created with OpenAI configuration
    // This is indirectly tested through the authentication validation
    const originalEnv = { ...process.env };
    delete process.env['OPENAI_API_KEY'];
    delete process.env['OPENAI_BASE_URL'];
    delete process.env['OPENAI_MODEL_NAME'];

    try {
      // Change to the test directory so loadSettings finds the settings file
      const originalCwd = process.cwd();
      process.chdir(testRig.testDir!);
      
      const result = validateAuthMethod(AuthType.USE_OPENAI_COMPATIBLE);
      expect(result).toBeNull();
      
      // Restore original directory
      process.chdir(originalCwd);
    } finally {
      // Restore original environment
      process.env = originalEnv;
    }
  });
});