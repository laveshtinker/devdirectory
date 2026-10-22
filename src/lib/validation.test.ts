import { describe, expect, it } from 'vitest'
import { credentialsSchema, profileSchema, projectSchema } from './validation'

describe('form validation', () => {
  it('accepts valid account credentials and rejects weak passwords', () => {
    expect(credentialsSchema.safeParse({ email: 'dev@example.com', password: 'strong-pass-123' }).success).toBe(true)
    expect(credentialsSchema.safeParse({ email: 'not-an-email', password: 'short' }).success).toBe(false)
  })

  it('rejects unsafe or malformed profile links before saving', () => {
    const profile = { full_name: 'Dev Person', title: 'Engineer', bio: 'I build tools for the web.', location: 'Remote', company_name: '', contact_email: '', avatar_url: '', website_url: 'javascript:alert(1)', github_url: '', linkedin_url: '', years_experience: 4, available: true, skills: ['TypeScript'] }
    expect(profileSchema.safeParse(profile).success).toBe(false)
    expect(profileSchema.safeParse({ ...profile, website_url: 'https://example.com' }).success).toBe(true)
  })

  it('requires a useful project description and valid optional URLs', () => {
    expect(projectSchema.safeParse({ title: 'App', description: 'A small app.', technologies: ['React'], demo_url: 'broken' }).success).toBe(false)
    expect(projectSchema.safeParse({ title: 'Fieldnotes', description: 'A considered place to keep project notes.', technologies: ['React', 'Postgres'], demo_url: 'https://example.com' }).success).toBe(true)
  })
})
