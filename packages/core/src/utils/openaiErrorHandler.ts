/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enhanced error handling for OpenAI-compatible API requests
 */

export interface OpenAIErrorDetails {
  message: string;
  statusCode?: number;
  errorType?: string;
  suggestions: string[];
  debugInfo: Record<string, any>;
}

export function analyzeOpenAIError(error: any, config: {
  baseUrl?: string;
  apiKey?: string;
  proxy?: string;
  model?: string;
}): OpenAIErrorDetails {
  const errorMessage = error.message || String(error);
  
  // Enhanced error details with more debugging information
  const details: OpenAIErrorDetails = {
    message: errorMessage,
    suggestions: [],
    debugInfo: {
      config: {
        baseUrl: config.baseUrl || 'default',
        hasApiKey: !!config.apiKey,
        proxy: config.proxy || 'none',
        model: config.model || 'default',
      },
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      // Add more detailed error information
      errorType: typeof error,
      errorConstructor: error.constructor?.name,
      errorStack: error.stack,
      // Add network-related debugging info
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    }
  };

  // Enhanced network error detection
  if (errorMessage.includes('fetch failed') || errorMessage.includes('TypeError: fetch failed')) {
    details.errorType = 'NETWORK_ERROR';
    
    // Try to extract more specific error information
    if ((error as any).cause) {
      details.debugInfo['cause'] = (error as any).cause.message || String((error as any).cause);
    }
    
    if (errorMessage.includes('ECONNREFUSED')) {
      details.debugInfo['connectionRefused'] = true;
    }
    
    if (errorMessage.includes('ETIMEDOUT')) {
      details.debugInfo['timeout'] = true;
    }
    
    if (errorMessage.includes('ENOTFOUND')) {
      details.debugInfo['dnsFailure'] = true;
    }
    
    if (errorMessage.includes('certificate') || errorMessage.includes('SSL') || errorMessage.includes('TLS')) {
      details.debugInfo['sslError'] = true;
    }

    details.suggestions = [
      '检查网络连接是否正常',
      '验证OpenAI API密钥是否正确配置',
      '确认OpenAI Base URL格式正确（例如：https://api.openai.com/v1）',
      '如果使用代理，确保代理服务器正常运行',
      '尝试使用其他网络环境（如手机热点）排除网络问题',
      '检查防火墙或安全软件是否阻止了请求',
    ];
    
    if (config.proxy) {
      details.suggestions.push(`检查代理配置：${config.proxy}`);
    }
    
    if (!config.baseUrl || config.baseUrl.includes('api.openai.com')) {
      details.suggestions.push('尝试访问 https://api.openai.com/v1 确认服务可达性');
    }
  }
  
  // Authentication errors
  else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    details.errorType = 'AUTHENTICATION_ERROR';
    details.statusCode = 401;
    details.suggestions = [
      '验证OpenAI API密钥是否正确且有效',
      '确认API密钥没有过期或被撤销',
      '检查是否使用了正确的API密钥格式',
      '如果使用Azure OpenAI，确保使用正确的API密钥类型',
    ];
  }
  
  // Rate limiting
  else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    details.errorType = 'RATE_LIMIT_ERROR';
    details.statusCode = 429;
    details.suggestions = [
      'API请求频率过高，请稍后再试',
      '考虑升级API套餐以获得更高配额',
      '在代码中添加请求间隔或重试逻辑',
    ];
  }
  
  // Service unavailable
  else if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
    details.errorType = 'SERVICE_UNAVAILABLE';
    details.statusCode = 503;
    details.suggestions = [
      'OpenAI服务可能暂时不可用，请稍后再试',
      '检查OpenAI服务状态页面了解是否有已知问题',
      '考虑使用备用模型或其他服务提供商',
    ];
  }
  
  // Model not found
  else if (errorMessage.includes('model_not_found') || errorMessage.includes('does not exist')) {
    details.errorType = 'MODEL_NOT_FOUND';
    details.suggestions = [
      `验证请求的模型是否存在：${config.model}`,
      '检查模型名称拼写是否正确',
      '确认您的API密钥是否有权限访问该模型',
      '尝试使用gpt-3.5-turbo等通用模型',
    ];
  }
  
  // Invalid request
  else if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
    details.errorType = 'INVALID_REQUEST';
    details.statusCode = 400;
    details.suggestions = [
      '检查请求参数格式是否正确',
      '验证请求体是否符合OpenAI API规范',
      '确认消息格式和角色定义正确',
      '如果使用自定义模型，确保其支持OpenAI兼容格式',
    ];
  }
  
  // Timeout errors
  else if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
    details.errorType = 'TIMEOUT_ERROR';
    details.suggestions = [
      '请求超时，可能是网络延迟或服务响应慢',
      '尝试增加超时时间设置',
      '检查网络连接质量',
      '考虑使用本地模型以减少延迟',
    ];
  }
  
  // Proxy errors
  else if (errorMessage.includes('proxy') || errorMessage.includes('ECONNREFUSED')) {
    details.errorType = 'PROXY_ERROR';
    details.suggestions = [
      '检查代理服务器是否正常运行',
      '验证代理配置是否正确',
      `确认代理地址可达：${config.proxy}`,
      '尝试临时禁用代理进行测试',
      '检查代理是否需要认证',
    ];
  }
  
  // Unknown errors
  else {
    details.errorType = 'UNKNOWN_ERROR';
    details.suggestions = [
      '这是一个未知错误，请检查完整的错误信息',
      '尝试重启Gemini CLI',
      '验证所有OpenAI配置参数',
      '检查网络连接和代理设置',
      '查看OpenAI API文档确认接口变更',
      '考虑使用其他认证方式（如Gemini API）进行测试',
    ];
  }

  return details;
}

export function formatOpenAIError(details: OpenAIErrorDetails): string {
  let message = `OpenAI API Error [${details.errorType || 'UNKNOWN'}]: ${details.message}\n\n`;
  
  if (details.suggestions.length > 0) {
    message += '建议解决方案:\n';
    details.suggestions.forEach((suggestion, index) => {
      message += `${index + 1}. ${suggestion}\n`;
    });
    message += '\n';
  }
  
  message += '调试信息:\n';
  message += `- 配置: ${JSON.stringify(details.debugInfo['config'], null, 2)}\n`;
  message += `- 时间: ${details.debugInfo['timestamp']}\n`;
  message += `- Node版本: ${details.debugInfo['nodeVersion']}\n`;
  message += `- 平台: ${details.debugInfo['platform']}\n`;
  message += `- 架构: ${details.debugInfo['arch']}\n`;
  
  // Add detailed error information
  if (details.debugInfo['errorType'] || details.debugInfo['errorConstructor']) {
    message += `- 错误类型: ${details.debugInfo['errorConstructor'] || details.debugInfo['errorType']}\n`;
  }
  
  if (details.debugInfo['cause']) {
    message += `- 错误原因: ${details.debugInfo['cause']}\n`;
  }
  
  if (details.debugInfo['connectionRefused']) {
    message += `- 连接被拒绝: 是\n`;
  }
  
  if (details.debugInfo['timeout']) {
    message += `- 超时: 是\n`;
  }
  
  if (details.debugInfo['dnsFailure']) {
    message += `- DNS解析失败: 是\n`;
  }
  
  if (details.debugInfo['sslError']) {
    message += `- SSL/TLS错误: 是\n`;
  }
  
  if (details.debugInfo['errorStack'] && (process.env as any)['DEBUG']) {
    message += `- 错误堆栈:\n${details.debugInfo['errorStack']}\n`;
  }
  
  return message;
}