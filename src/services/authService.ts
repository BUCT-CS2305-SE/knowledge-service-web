/**
 * 用户认证服务 — 对接平台真实 API
 *
 * 平台地址: https://api.yazs.top/
 * 登录: POST /api/user/auth/login
 * 注册: POST /api/user/auth/register
 */

import type { AuthResponse, LoginRequest, RegisterRequest, UserProfile } from '@/types/user';

// 认证 API 基础地址
// 开发环境走 Vite 代理（避免跨域），生产环境直接请求
const AUTH_API_BASE = import.meta.env.DEV ? '' : 'https://api.yazs.top';

// ===== 内部辅助 =====

interface RawUserData {
  id?: number | string;
  username?: string;
  email?: string;
  avatar?: string;
  nickname?: string;
  bio?: string;
  created_at?: string;
  createdAt?: string;
}

/**
 * 将后端返回的原始数据映射为前端的 AuthResponse 格式
 */
function mapAuthResponse(
  responseData: unknown,
  status: number,
): AuthResponse {
  if (status === 401) {
    return {
      code: 401,
      message: '用户名或密码错误',
      data: { token: '', user: null as unknown as UserProfile },
    };
  }

  if (status === 409) {
    return {
      code: 409,
      message: '用户名或邮箱已存在',
      data: { token: '', user: null as unknown as UserProfile },
    };
  }

  const data = responseData as Record<string, unknown> | undefined;
  if (!data) {
    return {
      code: 500,
      message: '服务器无响应',
      data: { token: '', user: null as unknown as UserProfile },
    };
  }

  // 尝试多种后端响应格式

  // 格式1: { code: 200, message: "...", data: { token: "...", user: {...} } }
  if (data.data && typeof data.data === 'object') {
    const inner = data.data as Record<string, unknown>;
    const token = (inner.token || inner.access_token || '') as string;
    const rawUser = (inner.user || data) as RawUserData;

    const user: UserProfile = {
      id: String(rawUser.id ?? ''),
      username: (rawUser.username || inner.username || '') as string,
      email: (rawUser.email || inner.email || '') as string,
      avatar: (rawUser.avatar || '') as string,
      nickname: (rawUser.nickname || rawUser.username || inner.username || '') as string,
      bio: (rawUser.bio || '') as string,
      createdAt: (rawUser.created_at || rawUser.createdAt || new Date().toISOString()) as string,
    };

    return {
      code: (data.code as number) || status || 200,
      message: (data.message || data.msg || '操作成功') as string,
      data: { token, user },
    };
  }

  // 格式2: { token: "...", user: {...} } (扁平结构)
  if (data.token || data.access_token) {
    const token = (data.token || data.access_token || '') as string;
    const rawUser = (data.user || data) as RawUserData;

    const user: UserProfile = {
      id: String(rawUser.id ?? ''),
      username: (rawUser.username || '') as string,
      email: (rawUser.email || '') as string,
      avatar: (rawUser.avatar || '') as string,
      nickname: (rawUser.nickname || rawUser.username || '') as string,
      bio: (rawUser.bio || '') as string,
      createdAt: (rawUser.created_at || rawUser.createdAt || new Date().toISOString()) as string,
    };

    return {
      code: 200,
      message: '操作成功',
      data: { token, user },
    };
  }

  // 格式3: { code: 4xx/5xx, message: "错误信息" }
  return {
    code: (data.code as number) || status || 500,
    message: (data.message || data.msg || data.error || data.detail || '未知错误') as string,
    data: { token: '', user: null as unknown as UserProfile },
  };
}

/**
 * 提取并标准化后端错误消息
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return '网络连接失败，请检查网络';
  }
  if (err instanceof Error) {
    if (err.name === 'AbortError') return '请求超时，请稍后重试';
    return err.message || fallback;
  }
  return fallback;
}

// ===== 公开 API =====

export const authApi = {
  /**
   * 用户登录
   * POST https://api.yazs.top/api/user/auth/login
   */
  async login(request: LoginRequest): Promise<AuthResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${AUTH_API_BASE}/api/user/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: request.username,
          password: request.password,
        }),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);
      return mapAuthResponse(data, response.status);
    } catch (err: unknown) {
      return {
        code: 500,
        message: extractErrorMessage(err, '登录失败，请检查网络连接'),
        data: { token: '', user: null as unknown as UserProfile },
      };
    } finally {
      clearTimeout(timeoutId);
    }
  },

  /**
   * 用户注册
   * POST https://api.yazs.top/api/user/auth/register
   */
  async register(request: RegisterRequest): Promise<AuthResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `${AUTH_API_BASE}/api/user/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: request.username,
            password: request.password,
            email: request.email,
            ...(request.nickname ? { nickname: request.nickname } : {}),
          }),
          signal: controller.signal,
        },
      );

      const data = await response.json().catch(() => null);
      return mapAuthResponse(data, response.status);
    } catch (err: unknown) {
      return {
        code: 500,
        message: extractErrorMessage(err, '注册失败，请检查网络连接'),
        data: { token: '', user: null as unknown as UserProfile },
      };
    } finally {
      clearTimeout(timeoutId);
    }
  },
};

export default authApi;
