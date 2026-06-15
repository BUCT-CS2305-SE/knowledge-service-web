import React, { useState, useEffect, useRef } from 'react';
import { urlNeedsAuth, fetchImageWithAuth, revokeBlobUrl } from '@/utils/imageUtils';

interface AuthImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** 图片源 URL */
  src: string;
  /** 加载中占位元素 */
  fallback?: React.ReactNode;
  /** 加载失败占位元素 */
  errorFallback?: React.ReactNode;
}

/**
 * 认证感知图片组件
 *
 * —— 替代原生 <img> 标签 ——
 * 对于需要 API 认证才能访问的图片（如 /api/images/...），
 * 使用 fetch + Authorization header 获取图片并转为 blob URL 显示。
 * 对于公开的外部 URL（IIIF、CDN），直接作为 <img src> 渲染。
 *
 * 使用方式：直接替换 <img> 即可，props 完全兼容。
 *   <AuthImage src={imageUrl} alt="..." className="..." />
 */
export const AuthImage: React.FC<AuthImageProps> = ({
  src,
  fallback,
  errorFallback,
  onError,
  onLoad,
  ...imgProps
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const mountedRef = useRef<boolean>(true);
  const previousBlobRef = useRef<string | null>(null);

  // 判断是否是需要认证的图片
  const needsAuth = urlNeedsAuth(src || '');

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // 重置状态
    setError(false);

    if (!src) {
      setBlobUrl(null);
      setLoading(false);
      return;
    }

    // 不需要认证的 URL（IIIF / CDN）—— 直接使用原始 URL
    if (!needsAuth) {
      setBlobUrl(null);  // null 表示使用原始 src
      setLoading(false);
      return;
    }

    // 需要认证的 URL —— fetch 并转为 blob URL
    let cancelled = false;
    setLoading(true);

    fetchImageWithAuth(src)
      .then((url) => {
        if (cancelled || !mountedRef.current) {
          // 组件已卸载，撤销刚创建的 blob URL
          revokeBlobUrl(url);
          return;
        }
        // 撤销前一个 blob URL
        if (previousBlobRef.current) {
          revokeBlobUrl(previousBlobRef.current);
        }
        previousBlobRef.current = url;
        setBlobUrl(url || null);
        setLoading(false);
        if (!url) setError(true);
      })
      .catch(() => {
        if (!cancelled && mountedRef.current) {
          setBlobUrl(null);
          setLoading(false);
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [src, needsAuth]);

  // 组件卸载时清理 blob URL
  useEffect(() => {
    return () => {
      if (previousBlobRef.current) {
        revokeBlobUrl(previousBlobRef.current);
        previousBlobRef.current = null;
      }
    };
  }, []);

  // 真正渲染的图片源：blob URL 优先，否则原始 src
  const displaySrc = needsAuth ? (blobUrl || '') : src;

  // 错误处理
  if (error && errorFallback) {
    return <>{errorFallback}</>;
  }

  // 加载中
  if (loading && fallback) {
    return <>{fallback}</>;
  }

  // 需要认证但没有 blob URL 时显示 loading/error 状态
  if (needsAuth && !blobUrl && !error && loading) {
    if (fallback) return <>{fallback}</>;
    // 无 fallback 时渲染一个隐藏占位
    return (
      <div
        {...(imgProps as React.HTMLAttributes<HTMLDivElement>)}
        className={imgProps.className}
        style={{ display: 'none' }}
      />
    );
  }

  if (needsAuth && !blobUrl && error) {
    if (errorFallback) return <>{errorFallback}</>;
    return null;
  }

  return (
    <img
      {...imgProps}
      src={displaySrc || ''}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        // 对于需要认证的图片，blob URL 失败时触发
        if (needsAuth) {
          setError(true);
        }
        onError?.(e);
      }}
      onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
        setLoading(false);
        onLoad?.(e);
      }}
    />
  );
};

export default AuthImage;
