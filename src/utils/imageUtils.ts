/**
 * 图片 URL 工具函数
 * 统一处理文物图片 URL，支持多级降级
 *
 * 降级链：IIIF 原图 → API 代理缩略图 → Gem 图标占位
 *
 * 注意：文物 API 需要认证（Bearer token），而 <img> 标签无法发送
 * Authorization 头。对于需要认证的图片 URL，应使用 AuthImage 组件
 * 或调用 fetchImageWithAuth() 获取 blob URL。
 */

// 开发环境走 Vite 代理，生产环境用完整 URL
const API_BASE = import.meta.env.DEV ? '' : 'https://se-cs2305.yazs.top';

/** Token 存储 key（与 userStore 保持一致） */
const AUTH_TOKEN_KEY = 'auth_token';

/** 获取当前存储的认证 token */
function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * 判断 URL 是否需要附带认证信息才能访问
 * 相对路径（/api/...）和 API 服务器域名下的资源需要认证
 * 外部 IIIF / CDN 等公开资源不需要
 */
export function urlNeedsAuth(url: string): boolean {
  if (!url) return false;
  // 相对路径 → 走 API 代理，需要认证
  if (url.startsWith('/api/')) return true;
  // 本地静态资源 → 不需要
  if (url.startsWith('/images/') || url.startsWith('./')) return false;
  // API 服务器域名下的资源 → 需要认证
  if (url.includes('se-cs2305.yazs.top')) return true;
  // 外部 URL（IIIF、CDN 等）→ 不需要
  return false;
}

/**
 * 带认证信息获取图片，返回 blob URL
 * 适用于需要通过 API 认证才能访问的图片
 *
 * @param imageUrl 图片 URL
 * @returns blob URL 字符串，失败返回空字符串
 */
export async function fetchImageWithAuth(imageUrl: string): Promise<string> {
  if (!imageUrl) return '';

  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(imageUrl, {
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[imageUtils] 获取图片失败: ${imageUrl} (${response.status})`);
      return '';
    }

    const blob = await response.blob();
    if (blob.size === 0) return '';

    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn(`[imageUtils] 图片请求异常: ${imageUrl}`, err);
    return '';
  }
}

/**
 * 批量预加载图片（用于列表页优化）
 * 返回 URL → blob URL 的映射
 */
export async function preloadImages(urls: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const authUrls = urls.filter(urlNeedsAuth);
  const publicUrls = urls.filter(u => !urlNeedsAuth(u));

  // 公开 URL 不需要转换
  publicUrls.forEach(u => result.set(u, u));

  // 并行获取需要认证的图片
  const blobPromises = authUrls.map(async (url) => {
    const blobUrl = await fetchImageWithAuth(url);
    return { url, blobUrl };
  });

  const blobResults = await Promise.all(blobPromises);
  blobResults.forEach(({ url, blobUrl }) => {
    if (blobUrl) result.set(url, blobUrl);
  });

  return result;
}

/**
 * 撤销 blob URL（释放内存）
 */
export function revokeBlobUrl(blobUrl: string): void {
  if (blobUrl && blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * 解析文物图片 URL
 */
export function resolveImageUrl(
  imageUrl: string,
  options?: { width?: number }
): string {
  if (!imageUrl) return '';

  // 本地路径直接返回
  if (imageUrl.startsWith('/images/') || imageUrl.startsWith('./')) {
    return imageUrl;
  }

  // API 代理路径（相对路径）
  if (imageUrl.startsWith('/api/images/')) {
    return `${API_BASE}${imageUrl}`;
  }

  // 已经是完整 URL（IIIF 等）
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // IIIF URL 尺寸调整
    if (options?.width && imageUrl.includes('/full/')) {
      return imageUrl.replace(
        /\/full\/\d+,?\/0\//,
        `/full/${options.width},/0/`
      );
    }
    return imageUrl;
  }

  return imageUrl;
}

/**
 * 获取文物主图 URL（带尺寸优化）
 */
export function getArtifactImage(
  images: string[],
  artifactId?: string,
  options?: { width?: number }
): string {
  if (images && images.length > 0 && images[0]) {
    return resolveImageUrl(images[0], options);
  }
  // 使用 API 代理作为备用
  if (artifactId) {
    return `${API_BASE}/api/images/${artifactId}/thumbnail?size=${options?.width || 400}x${options?.width || 400}`;
  }
  return '';
}

/**
 * 获取 API 代理图片 URL（IIIF 加载失败时的降级方案）
 */
export function getApiProxyImage(artifactId: string, size: number = 400): string {
  return `${API_BASE}/api/images/${artifactId}/thumbnail?size=${size}x${size}`;
}

/**
 * 获取完整的降级图片列表
 * [主图, API代理, ...更多]
 */
export function getFallbackImageChain(
  images: string[],
  artifactId: string,
  width: number = 400
): string[] {
  const seen = new Set<string>();
  const chain: string[] = [];

  const add = (url: string) => {
    if (url && !seen.has(url)) {
      seen.add(url);
      chain.push(url);
    }
  };

  // 1. 主图（原始图片 URL）
  if (images && images.length > 0) {
    add(resolveImageUrl(images[0], { width }));
  }

  // 2. 第二张图（如有）
  if (images && images.length > 1) {
    add(resolveImageUrl(images[1], { width }));
  }

  // 3. API 代理缩略图
  add(getApiProxyImage(artifactId, width));

  return chain;
}
