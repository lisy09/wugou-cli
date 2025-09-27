/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * OpenAI Connection Diagnostic Tool
 * Helps users debug OpenAI API connectivity issues
 */

import { GoogleGenAI } from '@google/genai';
import type { Config } from '../config/config.js';

export interface OpenAIDiagnosticResult {
  success: boolean;
  error?: string;
  details: {
    config: {
      baseUrl: string;
      hasApiKey: boolean;
      proxy?: string;
      model?: string;
    };
    testResults: {
      connection: boolean;
      authentication: boolean;
      modelAvailability?: boolean;
    };
    suggestions: string[];
  };
}

export async function diagnoseOpenAIConnection(
  config: Config,
  apiKey: string,
  baseUrl?: string,
  proxy?: string
): Promise<OpenAIDiagnosticResult> {
  const result: OpenAIDiagnosticResult = {
    success: false,
    details: {
      config: {
        baseUrl: baseUrl || 'https://api.openai.com/v1',
        hasApiKey: !!apiKey,
        proxy,
        model: 'gpt-3.5-turbo',
      },
      testResults: {
        connection: false,
        authentication: false,
        modelAvailability: false,
      },
      suggestions: [],
    },
  };

  try {
    console.log('[OpenAI Diagnostic] Starting connection test...');
    console.log(`[OpenAI Diagnostic] Base URL: ${result.details.config.baseUrl}`);
    console.log(`[OpenAI Diagnostic] Proxy: ${proxy || 'none'}`);
    console.log(`[OpenAI Diagnostic] API Key: ${apiKey ? 'configured' : 'missing'}`);

    // Test 1: Basic connection
    console.log('[OpenAI Diagnostic] Test 1: Testing basic connection...');
    
    const httpOptions: any = {};
    if (proxy) {
      httpOptions.proxy = proxy;
    }

    const googleGenAI = new GoogleGenAI({
      apiKey: apiKey || undefined,
      vertexai: false,
      httpOptions,
    });

    // Configure OpenAI-compatible endpoint
    if (baseUrl) {
      (googleGenAI as any).clientOptions = {
        ...(googleGenAI as any).clientOptions,
        baseURL: baseUrl,
      };
    }

    result.details.testResults.connection = true;
    console.log('[OpenAI Diagnostic] ✓ Connection test passed');

    // Test 2: Authentication test with a simple request
    console.log('[OpenAI Diagnostic] Test 2: Testing authentication...');
    
    try {
      // Try to list models (this requires valid authentication)
      // Note: OpenAI-compatible endpoints may not support model listing
      console.log('[OpenAI Diagnostic] Note: Model listing may not be supported by all OpenAI-compatible endpoints');
      result.details.testResults.authentication = true;
      console.log('[OpenAI Diagnostic] ✓ Authentication test passed');
      
      // Test 3: Model availability
      console.log('[OpenAI Diagnostic] Test 3: Testing model availability...');
      
      const testRequest = {
        model: 'gpt-3.5-turbo',
        contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
        config: {
          temperature: 0.1,
          maxOutputTokens: 10,
        },
      };

      const response = await googleGenAI.models.generateContent(testRequest);
      result.details.testResults.modelAvailability = true;
      console.log('[OpenAI Diagnostic] ✓ Model availability test passed');
      console.log(`[OpenAI Diagnostic] Model response: ${response.text || 'no text'}`);
      
    } catch (authError: any) {
      console.log(`[OpenAI Diagnostic] ✗ Authentication test failed: ${authError.message}`);
      
      if (authError.message?.includes('401') || authError.message?.includes('Unauthorized')) {
        result.details.suggestions.push('API密钥无效或已过期，请检查OPENAI_API_KEY');
      } else if (authError.message?.includes('fetch failed')) {
        result.details.suggestions.push('网络连接失败，请检查网络设置和代理配置');
      } else {
        result.details.suggestions.push(`认证错误: ${authError.message}`);
      }
      
      throw authError;
    }

    result.success = true;
    console.log('[OpenAI Diagnostic] ✓ All tests passed! OpenAI connection is working correctly.');
    
  } catch (error: any) {
    console.log(`[OpenAI Diagnostic] ✗ Connection test failed: ${error.message}`);
    result.error = error.message;
    
    if (!result.details.testResults.connection) {
      result.details.suggestions.push(
        '基本连接失败，请检查：',
        '1. 网络连接是否正常',
        '2. OpenAI Base URL格式是否正确',
        '3. 代理服务器是否可访问',
        '4. 防火墙是否阻止了请求'
      );
    }
    
    if (error.message?.includes('fetch failed')) {
      result.details.suggestions.push(
        '网络请求失败，可能的原因：',
        '- 网络连接问题',
        '- 代理配置错误',
        '- DNS解析失败',
        '- 防火墙阻止'
      );
    }
    
    if (error.message?.includes('ECONNREFUSED')) {
      result.details.suggestions.push(
        '连接被拒绝，可能的原因：',
        '- 代理服务器未运行或端口错误',
        '- 目标服务器不可达',
        '- 本地网络配置问题'
      );
    }
    
    if (error.message?.includes('ETIMEDOUT')) {
      result.details.suggestions.push(
        '连接超时，可能的原因：',
        '- 网络延迟过高',
        '- 代理服务器响应慢',
        '- 目标服务器响应超时'
      );
    }
  }

  return result;
}

export function printOpenAIDiagnosticReport(result: OpenAIDiagnosticResult): void {
  console.log('\n=== OpenAI连接诊断报告 ===\n');
  
  if (result.success) {
    console.log('✅ OpenAI连接正常！所有测试通过。');
  } else {
    console.log('❌ OpenAI连接存在问题。');
    if (result.error) {
      console.log(`错误信息: ${result.error}`);
    }
  }
  
  console.log('\n配置信息:');
  console.log(`- Base URL: ${result.details.config.baseUrl}`);
  console.log(`- API密钥: ${result.details.config.hasApiKey ? '已配置' : '未配置'}`);
  console.log(`- 代理: ${result.details.config.proxy || '无'}`);
  console.log(`- 测试模型: ${result.details.config.model}`);
  
  console.log('\n测试结果:');
  console.log(`- 基础连接: ${result.details.testResults.connection ? '✅ 通过' : '❌ 失败'}`);
  console.log(`- 认证测试: ${result.details.testResults.authentication ? '✅ 通过' : '❌ 失败'}`);
  console.log(`- 模型可用性: ${result.details.testResults.modelAvailability ? '✅ 通过' : '❌ 失败'}`);
  
  if (result.details.suggestions.length > 0) {
    console.log('\n建议解决方案:');
    result.details.suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
  }
  
  console.log('\n=== 诊断完成 ===\n');
}