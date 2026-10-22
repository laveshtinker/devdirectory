import { createContext } from 'react'

export type CommunityPost = { id: string; authorId: string; authorName: string; title: string; body: string; createdAt: string }

export const SavedContext = createContext<{
  savedIds: string[]
  savedPostIds: string[]
  posts: CommunityPost[]
  toggleSaved: (id: string) => void
  toggleSavedPost: (id: string) => void
  createPost: (post: CommunityPost) => void
  mergePosts: (posts: CommunityPost[]) => void
}>({ savedIds: [], savedPostIds: [], posts: [], toggleSaved: () => undefined, toggleSavedPost: () => undefined, createPost: () => undefined, mergePosts: () => undefined })
