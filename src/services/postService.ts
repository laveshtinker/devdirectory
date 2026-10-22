import apiClient from './api'
import { normalizePosts, type UserPost } from './userService'

export type NewPost = { title: string; body: string; userId: number }

export async function fetchAllPosts() {
  const { data } = await apiClient.get<unknown>('/posts')
  return normalizePosts(data)
}

export async function createPost(post: NewPost) {
  return apiClient.post<UserPost>('/posts', post)
}
