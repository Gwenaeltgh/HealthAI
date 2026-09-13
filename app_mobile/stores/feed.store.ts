import { create } from 'zustand';
import type { Comment, Post } from '@/types';
import { feedService } from '@/services/feed.service';

interface FeedState {
  posts: Post[];
  likedPosts: Post[];
  isLoading: boolean;
  activeFilter: string;
  localComments: Record<string, Comment[]>;


  loadPosts: (filter?: string) => Promise<void>;
  toggleLike: (postId: string) => Promise<void>;
  toggleSave: (postId: string) => Promise<void>;
  createPost: (body: string, tags: string[]) => Promise<void>;
  setFilter: (filter: string) => void;
  addComment: (postId: string, body: string, author: { name: string; initials: string; color: string }) => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  likedPosts: [],
  isLoading: false,
  activeFilter: 'Pour toi',
  localComments: {},

  loadPosts: async (filter) => {
    set({ isLoading: true });
    const posts = await feedService.getPosts(filter);
    set({ posts, isLoading: false });
  },

  toggleLike: async (postId) => {
  const post = get().posts.find(p => p.id === postId);

  if (!post) return;

  const updatedPosts = get().posts.map(p =>
    p.id === postId
      ? {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1
        }
      : p
  );

  let updatedLikedPosts = get().likedPosts;

  if (!post.liked) {
    // ajouter aux likes
    updatedLikedPosts = [...updatedLikedPosts, { ...post, liked: true }];
  } else {
    // retirer des likes
    updatedLikedPosts = updatedLikedPosts.filter(p => p.id !== postId);
  }

  set({
    posts: updatedPosts,
    likedPosts: updatedLikedPosts,
  });

  await feedService.likePost(postId);
},

  toggleSave: async (postId) => {
    set({
      posts: get().posts.map(p =>
        p.id === postId ? { ...p, saved: !p.saved } : p
      ),
    });
    await feedService.savePost(postId);
  },

  createPost: async (body, tags) => {
    const post = await feedService.createPost(body, tags);
    set({ posts: [post, ...get().posts] });
  },

  setFilter: (filter) => {
    set({ activeFilter: filter });
    get().loadPosts(filter);
  },

  addComment: (postId, body, author) => {
    const comment: Comment = {
      id: 'local_' + Date.now(),
      authorId: 'me',
      authorName: author.name,
      authorInitials: author.initials,
      authorAvatarColor: author.color,
      body,
      timeAgo: "à l'instant",
      likes: 0,
    };
    const existing = get().localComments[postId] ?? [];
    set({ localComments: { ...get().localComments, [postId]: [comment, ...existing] } });
    // Incrémenter le compteur de commentaires du post
    set({
      posts: get().posts.map(p =>
        p.id === postId ? { ...p, comments: p.comments + 1 } : p
      ),
    });
  },
}));
