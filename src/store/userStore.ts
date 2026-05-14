import { create } from 'zustand';
import type {
  UserProfile,
  LoginRequest,
  RegisterRequest,
  BrowseHistory,
  CollectionItem,
  CollectionGroup,
  Comment,
  Reply,
  CommentRequest,
  ReplyRequest,
} from '@/types/user';
import { userApi } from '@/mock/handlers';

// Token 在 localStorage 中的 key
const AUTH_TOKEN_KEY = 'auth_token';
const CURRENT_USER_KEY = 'current_user';

// 从 localStorage 读取持久化的数据
const loadPersistedState = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved) as T;
    }
  } catch {
    // ignore parse errors
  }
  return defaultValue;
};

const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore write errors
  }
};

interface UserStore {
  // === 认证状态 ===
  currentUser: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;

  // === 用户数据 ===
  browseHistory: BrowseHistory[];
  collectionGroups: CollectionGroup[];
  collectionItems: CollectionItem[];
  comments: Record<string, Comment[]>;

  // === 加载状态 ===
  loading: boolean;
  error: string | null;

  // === 认证操作 ===
  login: (request: LoginRequest) => Promise<boolean>;
  register: (request: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;

  // === 个人资料操作 ===
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;

  // === 浏览记录操作 ===
  fetchBrowseHistory: () => Promise<void>;
  addBrowseHistory: (artifactId: string, artifactName: string, artifactImage: string, artifactCategory: string) => void;
  clearBrowseHistory: () => void;

  // === 收藏分组操作 ===
  fetchCollectionGroups: () => Promise<void>;
  createCollectionGroup: (name: string, description: string) => Promise<void>;
  deleteCollectionGroup: (groupId: string) => Promise<void>;
  updateCollectionGroup: (groupId: string, name: string, description: string) => Promise<void>;

  // === 收藏操作 ===
  fetchCollectionItems: (groupId?: string) => Promise<void>;
  addToCollection: (groupId: string, artifactId: string, artifactName: string, artifactImage: string, artifactCategory: string, artifactEra: string, artifactRegion: string) => void;
  removeFromCollection: (itemId: string) => void;
  moveCollectionItem: (itemId: string, targetGroupId: string) => void;
  isArtifactCollected: (artifactId: string) => boolean;
  toggleCollectArtifact: (artifactId: string, artifactName: string, artifactImage: string, artifactCategory: string, artifactEra: string, artifactRegion: string) => boolean;

  // === 评论操作 ===
  fetchComments: (artifactId: string) => Promise<void>;
  addComment: (request: CommentRequest) => void;
  addReply: (request: ReplyRequest) => void;
  likeComment: (commentId: string) => void;
  getCommentsByArtifact: (artifactId: string) => Comment[];

  // === 初始化 ===
  initAuth: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  // === 初始状态 ===
  currentUser: loadPersistedState<UserProfile | null>(CURRENT_USER_KEY, null),
  token: localStorage.getItem(AUTH_TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(AUTH_TOKEN_KEY),
  authLoading: false,
  authError: null,

  browseHistory: loadPersistedState<BrowseHistory[]>('browse_history', []),
  collectionGroups: [],
  collectionItems: loadPersistedState<CollectionItem[]>('collection_items', []),
  comments: loadPersistedState<Record<string, Comment[]>>('comments', {}),

  loading: false,
  error: null,

  // === 认证操作 ===

  login: async (request: LoginRequest): Promise<boolean> => {
    set({ authLoading: true, authError: null });
    try {
      const response = await userApi.login(request);
      if (response.code === 200) {
        const { token, user } = response.data;
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        saveToStorage(CURRENT_USER_KEY, user);
        set({
          token,
          currentUser: user,
          isAuthenticated: true,
          authLoading: false,
        });
        return true;
      }
      set({
        authError: response.message || '登录失败',
        authLoading: false,
      });
      return false;
    } catch (err) {
      set({
        authError: '登录失败，请检查网络连接',
        authLoading: false,
      });
      console.error('Login failed:', err);
      return false;
    }
  },

  register: async (request: RegisterRequest): Promise<boolean> => {
    set({ authLoading: true, authError: null });
    try {
      const response = await userApi.register(request);
      if (response.code === 200) {
        const { token, user } = response.data;
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        saveToStorage(CURRENT_USER_KEY, user);
        set({
          token,
          currentUser: user,
          isAuthenticated: true,
          authLoading: false,
        });
        return true;
      }
      set({
        authError: response.message || '注册失败',
        authLoading: false,
      });
      return false;
    } catch (err) {
      set({
        authError: '注册失败，请检查网络连接',
        authLoading: false,
      });
      console.error('Register failed:', err);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    set({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      browseHistory: [],
      collectionItems: [],
      collectionGroups: [],
      comments: {},
    });
  },

  clearAuthError: () => {
    set({ authError: null });
  },

  // === 个人资料操作 ===

  updateProfile: async (data: Partial<UserProfile>): Promise<void> => {
    set({ loading: true, error: null });
    try {
      const { currentUser } = get();
      if (!currentUser) {
        throw new Error('未登录');
      }
      const updated = await userApi.updateProfile(currentUser.id, data);
      saveToStorage(CURRENT_USER_KEY, updated);
      set({ currentUser: updated, loading: false });
    } catch (err) {
      set({ error: '更新个人资料失败', loading: false });
      console.error('Update profile failed:', err);
    }
  },

  updateAvatar: async (avatar: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      const { currentUser } = get();
      if (!currentUser) {
        throw new Error('未登录');
      }
      const updated = await userApi.updateProfile(currentUser.id, { avatar });
      saveToStorage(CURRENT_USER_KEY, updated);
      set({ currentUser: updated, loading: false });
    } catch (err) {
      set({ error: '更新头像失败', loading: false });
      console.error('Update avatar failed:', err);
    }
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<boolean> => {
    set({ loading: true, error: null });
    try {
      const result = await userApi.changePassword(oldPassword, newPassword);
      set({ loading: false });
      return result;
    } catch (err) {
      set({ error: '修改密码失败', loading: false });
      console.error('Change password failed:', err);
      return false;
    }
  },

  // === 浏览记录操作 ===

  fetchBrowseHistory: async (): Promise<void> => {
    try {
      const { currentUser } = get();
      if (!currentUser) return;
      const history = await userApi.getBrowseHistory(currentUser.id);
      saveToStorage('browse_history', history);
      set({ browseHistory: history });
    } catch (err) {
      console.error('Fetch browse history failed:', err);
    }
  },

  addBrowseHistory: (artifactId: string, artifactName: string, artifactImage: string, artifactCategory: string): void => {
    const { currentUser, browseHistory } = get();
    if (!currentUser) return;

    // 去重：如果已存在相同文物记录，先移除旧的
    const filtered = browseHistory.filter((h) => h.artifactId !== artifactId);

    const newRecord: BrowseHistory = {
      id: `history_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      artifactId,
      artifactName,
      artifactImage,
      artifactCategory,
      timestamp: new Date().toISOString(),
    };

    // 保持最多50条记录
    const updated = [newRecord, ...filtered].slice(0, 50);
    saveToStorage('browse_history', updated);
    set({ browseHistory: updated });
  },

  clearBrowseHistory: (): void => {
    localStorage.removeItem('browse_history');
    set({ browseHistory: [] });
  },

  // === 收藏分组操作 ===

  fetchCollectionGroups: async (): Promise<void> => {
    try {
      const { currentUser } = get();
      if (!currentUser) return;
      const groups = await userApi.getCollectionGroups(currentUser.id);
      set({ collectionGroups: groups });
    } catch (err) {
      console.error('Fetch collection groups failed:', err);
    }
  },

  createCollectionGroup: async (name: string, description: string): Promise<void> => {
    try {
      const { currentUser } = get();
      if (!currentUser) return;
      const group = await userApi.createCollectionGroup(currentUser.id, name, description);
      set((state) => ({
        collectionGroups: [...state.collectionGroups, group],
      }));
    } catch (err) {
      console.error('Create collection group failed:', err);
    }
  },

  deleteCollectionGroup: async (groupId: string): Promise<void> => {
    try {
      await userApi.deleteCollectionGroup(groupId);
      set((state) => ({
        collectionGroups: state.collectionGroups.filter((g) => g.id !== groupId),
        collectionItems: state.collectionItems.filter((item) => item.groupId !== groupId),
      }));
      const updatedItems = get().collectionItems;
      saveToStorage('collection_items', updatedItems);
    } catch (err) {
      console.error('Delete collection group failed:', err);
    }
  },

  updateCollectionGroup: async (groupId: string, name: string, description: string): Promise<void> => {
    try {
      const updated = await userApi.updateCollectionGroup(groupId, name, description);
      set((state) => ({
        collectionGroups: state.collectionGroups.map((g) =>
          g.id === groupId ? updated : g
        ),
      }));
    } catch (err) {
      console.error('Update collection group failed:', err);
    }
  },

  // === 收藏操作 ===

  fetchCollectionItems: async (groupId?: string): Promise<void> => {
    try {
      const { currentUser } = get();
      if (!currentUser) return;
      const items = await userApi.getCollectionItems(currentUser.id, groupId);
      set({ collectionItems: items });
      saveToStorage('collection_items', items);
    } catch (err) {
      console.error('Fetch collection items failed:', err);
    }
  },

  addToCollection: (
    groupId: string,
    artifactId: string,
    artifactName: string,
    artifactImage: string,
    artifactCategory: string,
    artifactEra: string,
    artifactRegion: string
  ): void => {
    const { collectionItems } = get();
    // 检查是否已收藏
    if (collectionItems.some((item) => item.artifactId === artifactId && item.groupId === groupId)) {
      return;
    }

    const newItem: CollectionItem = {
      id: `col_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      groupId,
      artifactId,
      artifactName,
      artifactImage,
      artifactCategory,
      artifactEra,
      artifactRegion,
      collectedAt: new Date().toISOString(),
    };

    const updated = [...collectionItems, newItem];
    saveToStorage('collection_items', updated);
    set({ collectionItems: updated });
  },

  removeFromCollection: (itemId: string): void => {
    const updated = get().collectionItems.filter((item) => item.id !== itemId);
    saveToStorage('collection_items', updated);
    set({ collectionItems: updated });
  },

  moveCollectionItem: (itemId: string, targetGroupId: string): void => {
    const updated = get().collectionItems.map((item) =>
      item.id === itemId ? { ...item, groupId: targetGroupId } : item
    );
    saveToStorage('collection_items', updated);
    set({ collectionItems: updated });
  },

  isArtifactCollected: (artifactId: string): boolean => {
    return get().collectionItems.some((item) => item.artifactId === artifactId);
  },

  toggleCollectArtifact: (
    artifactId: string,
    artifactName: string,
    artifactImage: string,
    artifactCategory: string,
    artifactEra: string,
    artifactRegion: string
  ): boolean => {
    const { currentUser, collectionGroups, collectionItems, addToCollection, removeFromCollection } = get();
    if (!currentUser || collectionGroups.length === 0) return false;

    const existing = collectionItems.find((item) => item.artifactId === artifactId);
    if (existing) {
      removeFromCollection(existing.id);
      return false; // 已取消收藏
    }

    // 添加到默认（第一个）收藏夹
    const defaultGroup = collectionGroups[0];
    addToCollection(defaultGroup.id, artifactId, artifactName, artifactImage, artifactCategory, artifactEra, artifactRegion);
    return true; // 已收藏
  },

  // === 评论操作 ===

  fetchComments: async (artifactId: string): Promise<void> => {
    try {
      const comments = await userApi.getComments(artifactId);
      set((state) => ({
        comments: { ...state.comments, [artifactId]: comments },
      }));
      saveToStorage('comments', { ...get().comments });
    } catch (err) {
      console.error('Fetch comments failed:', err);
    }
  },

  addComment: (request: CommentRequest): void => {
    const { currentUser, comments } = get();
    if (!currentUser) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      artifactId: request.artifactId,
      userId: currentUser.id,
      username: currentUser.nickname || currentUser.username,
      avatar: currentUser.avatar,
      content: request.content,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      replies: [],
    };

    const artifactComments = comments[request.artifactId] || [];
    const updated = {
      ...comments,
      [request.artifactId]: [newComment, ...artifactComments],
    };
    saveToStorage('comments', updated);
    set({ comments: updated });
  },

  addReply: (request: ReplyRequest): void => {
    const { currentUser, comments } = get();
    if (!currentUser) return;

    const newReply: Reply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      commentId: request.commentId,
      userId: currentUser.id,
      username: currentUser.nickname || currentUser.username,
      avatar: currentUser.avatar,
      content: request.content,
      createdAt: new Date().toISOString(),
    };

    const updated = { ...comments };
    for (const artifactId of Object.keys(updated)) {
      const artifactComments = updated[artifactId];
      const commentIndex = artifactComments.findIndex((c) => c.id === request.commentId);
      if (commentIndex !== -1) {
        const updatedComments = [...artifactComments];
        updatedComments[commentIndex] = {
          ...updatedComments[commentIndex],
          replies: [...updatedComments[commentIndex].replies, newReply],
        };
        updated[artifactId] = updatedComments;
        break;
      }
    }

    saveToStorage('comments', updated);
    set({ comments: updated });
  },

  likeComment: (commentId: string): void => {
    const { currentUser, comments } = get();
    if (!currentUser) return;

    const updated = { ...comments };
    for (const artifactId of Object.keys(updated)) {
      const artifactComments = updated[artifactId];
      const commentIndex = artifactComments.findIndex((c) => c.id === commentId);
      if (commentIndex !== -1) {
        const comment = artifactComments[commentIndex];
        const updatedComments = [...artifactComments];

        if (comment.likedBy.includes(currentUser.id)) {
          // 取消点赞
          updatedComments[commentIndex] = {
            ...comment,
            likes: comment.likes - 1,
            likedBy: comment.likedBy.filter((uid) => uid !== currentUser.id),
          };
        } else {
          // 点赞
          updatedComments[commentIndex] = {
            ...comment,
            likes: comment.likes + 1,
            likedBy: [...comment.likedBy, currentUser.id],
          };
        }
        updated[artifactId] = updatedComments;
        break;
      }
    }

    saveToStorage('comments', updated);
    set({ comments: updated });
  },

  getCommentsByArtifact: (artifactId: string): Comment[] => {
    return get().comments[artifactId] || [];
  },

  // === 初始化 ===

  initAuth: (): void => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = loadPersistedState<UserProfile | null>(CURRENT_USER_KEY, null);
    if (token && user) {
      set({
        token,
        currentUser: user,
        isAuthenticated: true,
      });
    }
  },
}));
