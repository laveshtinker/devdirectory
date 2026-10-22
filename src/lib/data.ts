import { supabase } from './supabase'
import type { ProfileInput, ProjectInput } from './validation'

export async function saveProfile(userId: string, values: ProfileInput) {
  if (!supabase) throw new Error('Add Supabase environment variables to save a profile.')
  const { skills, ...profile } = values
  const { error } = await supabase.from('profiles').upsert({ id: userId, ...profile }, { onConflict: 'id' })
  if (error) throw error
  const { error: skillError } = await supabase.from('profile_skills').delete().eq('profile_id', userId)
  if (skillError) throw skillError
  if (skills.length) {
    const { error: insertError } = await supabase.from('profile_skills').insert(skills.map(name => ({ profile_id: userId, name })))
    if (insertError) throw insertError
  }
}

export async function saveProject(userId: string, values: ProjectInput, id?: string) {
  if (!supabase) throw new Error('Add Supabase environment variables to save a project.')
  const { technologies, ...project } = values
  const result = id
    ? await supabase.from('projects').update(project).eq('id', id).eq('profile_id', userId).select('id').single()
    : await supabase.from('projects').insert({ ...project, profile_id: userId }).select('id').single()
  if (result.error) throw result.error
  await supabase.from('project_technologies').delete().eq('project_id', result.data.id)
  if (technologies.length) {
    const { error } = await supabase.from('project_technologies').insert(technologies.map(name => ({ project_id: result.data.id, name })))
    if (error) throw error
  }
  return result.data.id as string
}

export async function createConnectionRequest(recipientProfileId: string, message: string) {
  if (!supabase) throw new Error('Connection requests are available after account setup.')
  const { error } = await supabase.from('connection_requests').insert({ recipient_profile_id: recipientProfileId, message })
  if (error) throw error
}
