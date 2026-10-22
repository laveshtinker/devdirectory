import { z } from 'zod'

const httpUrl = z.string().url('Enter a valid URL').refine(value => {
  try {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
  } catch { return false }
}, 'Use an http or https URL')
const optionalUrl = z.union([z.literal(''), httpUrl]).optional()

export const credentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
})

export const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(80),
  title: z.string().trim().max(100),
  bio: z.string().trim().max(1200),
  location: z.string().trim().max(120),
  company_name: z.string().trim().max(120),
  contact_email: z.union([z.literal(''), z.string().trim().email('Enter a valid contact email')]),
  avatar_url: optionalUrl,
  website_url: optionalUrl,
  github_url: optionalUrl,
  linkedin_url: optionalUrl,
  years_experience: z.coerce.number().int().min(0).max(70),
  available: z.boolean(),
  skills: z.array(z.string().trim().min(1).max(40)).max(20),
})

export const projectSchema = z.object({
  title: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(800),
  technologies: z.array(z.string().trim().min(1).max(40)).max(12),
  image_url: optionalUrl,
  repository_url: optionalUrl,
  demo_url: optionalUrl,
})

export type ProfileInput = z.infer<typeof profileSchema>
export type ProjectInput = z.infer<typeof projectSchema>
