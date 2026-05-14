// 用户相关类型定义

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar: string;
  nickname: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  nickname: string;
  bio: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface AuthResponse {
  code: number;
  message: string;
  data: {
    token: string;
    user: UserProfile;
  };
}

// 浏览记录
export interface BrowseHistory {
  id: string;
  artifactId: string;
  artifactName: string;
  artifactImage: string;
  artifactCategory: string;
  timestamp: string;
}

// 收藏分组
export interface CollectionGroup {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  createdAt: string;
}

// 收藏项
export interface CollectionItem {
  id: string;
  groupId: string;
  artifactId: string;
  artifactName: string;
  artifactImage: string;
  artifactCategory: string;
  artifactEra: string;
  artifactRegion: string;
  collectedAt: string;
}

// 评论
export interface Comment {
  id: string;
  artifactId: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
  // 回复
  replies: Reply[];
}

export interface Reply {
  id: string;
  commentId: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  createdAt: string;
}

export interface CommentRequest {
  artifactId: string;
  content: string;
}

export interface ReplyRequest {
  commentId: string;
  content: string;
}
