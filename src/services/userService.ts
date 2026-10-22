import apiClient from './api'

export type DirectoryUser = {
  id: number
  name: string
  username: string
  email: string
  address: { street: string; suite: string; city: string; zipcode: string; geo: { lat: string; lng: string } }
  phone: string
  website: string
  company: { name: string; catchPhrase: string; bs: string }
}

export type UserPost = { userId: number; id: number; title: string; body: string }

type UnknownRecord = Record<string, unknown>
const record = (value: unknown): UnknownRecord => value && typeof value === 'object' ? value as UnknownRecord : {}
const text = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback

function normalizeUser(value: unknown): DirectoryUser | null {
  const raw = record(value)
  const id = Number(raw.id)
  if (!Number.isFinite(id) || typeof raw.name !== 'string' || !raw.name.trim()) return null
  const address = record(raw.address)
  const geo = record(address.geo)
  const company = record(raw.company)
  return {
    id,
    name: raw.name.trim(),
    username: text(raw.username, 'user'),
    email: text(raw.email),
    address: { street: text(address.street), suite: text(address.suite), city: text(address.city, 'Location not listed'), zipcode: text(address.zipcode), geo: { lat: text(geo.lat), lng: text(geo.lng) } },
    phone: text(raw.phone),
    website: text(raw.website),
    company: { name: text(company.name, 'Company not listed'), catchPhrase: text(company.catchPhrase), bs: text(company.bs) },
  }
}

export function normalizePosts(value: unknown): UserPost[] {
  if (!Array.isArray(value)) return []
  return value.flatMap(item => {
    const raw = record(item)
    const id = Number(raw.id)
    const userId = Number(raw.userId)
    if (!Number.isFinite(id) || !Number.isFinite(userId) || typeof raw.title !== 'string' || typeof raw.body !== 'string') return []
    return [{ id, userId, title: raw.title, body: raw.body }]
  })
}

export async function fetchUsers() {
  const { data } = await apiClient.get<unknown>('/users')
  return Array.isArray(data) ? data.map(normalizeUser).filter((user): user is DirectoryUser => Boolean(user)) : []
}

export async function fetchUser(id: string | number) {
  const { data } = await apiClient.get<unknown>(`/users/${id}`)
  const user = normalizeUser(data)
  if (!user) throw new Error('The profile response was not valid.')
  return user
}

export async function fetchPostsByUser(userId: string | number) {
  const { data } = await apiClient.get<unknown>('/posts', { params: { userId } })
  return normalizePosts(data)
}
