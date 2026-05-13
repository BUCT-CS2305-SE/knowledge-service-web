import type { User, CollectionGroup, Comment } from '@/types/user';

// 预设用户数据（用于演示登录）
export const defaultUsers: User[] = [
  {
    id: 'user_001',
    username: 'admin',
    email: 'admin@artifacts.com',
    passwordHash: 'e10adc3949ba59abbe56e057f20f883e', // 123456
    avatar: '',
    nickname: '文物爱好者',
    bio: '热爱探索世界文化遗产的博物馆爱好者',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'user_002',
    username: 'zhangsan',
    email: 'zhangsan@example.com',
    passwordHash: 'e10adc3949ba59abbe56e057f20f883e', // 123456
    avatar: '',
    nickname: '张三',
    bio: '历史学研究生，专注于中国古代艺术研究',
    createdAt: '2026-02-20T10:30:00Z',
    updatedAt: '2026-02-20T10:30:00Z',
  },
  {
    id: 'user_003',
    username: 'lisi',
    email: 'lisi@example.com',
    passwordHash: 'e10adc3949ba59abbe56e057f20f883e', // 123456
    avatar: '',
    nickname: '李四',
    bio: '博物馆策展人',
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-03-10T14:00:00Z',
  },
];

// 默认收藏分组（每个用户都有一个默认分组）
export const generateDefaultGroup = (userId: string): CollectionGroup => ({
  id: `group_${userId}_default`,
  name: '默认收藏夹',
  description: '我的文物收藏',
  createdAt: new Date().toISOString(),
});

// 内存中的评论数据
export const commentsStore: Comment[] = [];
