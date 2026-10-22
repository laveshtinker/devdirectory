import { useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { ArrowRight, Bookmark, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { saveProfile, saveProject } from './lib/data'
import { profileSchema, projectSchema } from './lib/validation'
import { SavedContext } from './lib/community'
import { publicDirectoryStats } from './data/developers'

const initialProfile = { full_name: '', title: '', bio: '', location: '', company_name: '', contact_email: '', avatar_url: '', website_url: '', github_url: '', linkedin_url: '', years_experience: 0, available: true, skills: [] as string[] }

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState(initialProfile)
  const [projects, setProjects] = useState<{ id: string; title: string; description: string; image_url?: string; repository_url?: string; demo_url?: string; technologies: { name: string }[] }[]>([])
  const [connections, setConnections] = useState<{ id: string; status: string; message: string; sender_profile_id: string; recipient_profile_id: string }[]>([])
  const [skillText, setSkillText] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectTech, setProjectTech] = useState('')
  const [projectImage, setProjectImage] = useState('')
  const [projectRepository, setProjectRepository] = useState('')
  const [projectDemo, setProjectDemo] = useState('')
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(true)
  const [communityCounts, setCommunityCounts] = useState({ developers: 0, companies: 0, posts: 0 })
  const [postTitle, setPostTitle] = useState('')
  const [postBody, setPostBody] = useState('')
  const [draftRestored, setDraftRestored] = useState(false)
  const { posts, savedIds, savedPostIds, toggleSavedPost, createPost, mergePosts } = useContext(SavedContext)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    const client = supabase
    if (!client) { setBusy(false); return }
    client.auth.getUser().then(({ data }) => {
      if (!active) return
      if (!data.user) { navigate('/login'); return }
      setUser(data.user)
      try {
        const draft = JSON.parse(localStorage.getItem(`devdirectory:post-draft:${data.user.id}`) ?? 'null')
        if (draft) { setPostTitle(draft.title ?? ''); setPostBody(draft.body ?? ''); setDraftRestored(true) }
      } catch { /* Ignore an invalid local draft. */ }
      Promise.all([
        client.from('profiles').select('*,profile_skills(name)').eq('id', data.user.id).maybeSingle(),
        client.from('projects').select('id,title,description,image_url,repository_url,demo_url,project_technologies(name)').eq('profile_id', data.user.id).order('created_at', { ascending: false }),
        client.from('connection_requests').select('id,status,message,sender_profile_id,recipient_profile_id').or(`sender_profile_id.eq.${data.user.id},recipient_profile_id.eq.${data.user.id}`).order('created_at', { ascending: false }),
        client.from('posts').select('id,profile_id,title,body,created_at').eq('profile_id', data.user.id).order('created_at', { ascending: false }),
      ]).then(([p, pr, c, userPosts]) => {
        if (!active) return
        if (p.data) { const { profile_skills, ...fields } = p.data; setProfile({ ...initialProfile, ...fields, skills: (profile_skills ?? []).map((s: { name: string }) => s.name) }) }
        if (pr.data) setProjects(pr.data.map((item: any) => ({ id: item.id, title: item.title, description: item.description, image_url: item.image_url, repository_url: item.repository_url, demo_url: item.demo_url, technologies: item.project_technologies ?? [] })))
        if (c.data) setConnections(c.data)
        if (userPosts.data) mergePosts(userPosts.data.map((post: any) => ({ id: post.id, authorId: post.profile_id, authorName: p.data?.full_name || 'Developer', title: post.title, body: post.body, createdAt: post.created_at })))
        setBusy(false)
      }).catch((err: unknown) => { if (active) { setError(err instanceof Error ? err.message : 'Could not load your workspace.'); setBusy(false) } })
      Promise.all([client.from('profiles').select('id', { count: 'exact', head: true }), client.from('profiles').select('company_name').not('company_name', 'is', null), client.from('posts').select('id', { count: 'exact', head: true })]).then(([developers, companies, totalPosts]) => {
        if (!active) return
        setCommunityCounts({ developers: developers.count ?? 0, companies: new Set((companies.data ?? []).map((row: { company_name: string }) => row.company_name).filter(Boolean)).size, posts: totalPosts.count ?? 0 })
      })
    }).catch((err: unknown) => { if (active) { setError(err instanceof Error ? err.message : 'Could not check your account.'); setBusy(false) } })
    return () => { active = false }
  }, [navigate, mergePosts])

  useEffect(() => {
    if (!user) return
    const timer = window.setTimeout(() => { try { if (postTitle || postBody) localStorage.setItem(`devdirectory:post-draft:${user.id}`, JSON.stringify({ title: postTitle, body: postBody, savedAt: new Date().toISOString() })); else localStorage.removeItem(`devdirectory:post-draft:${user.id}`) } catch { /* Draft is kept in the form for this session. */ } }, 250)
    return () => window.clearTimeout(timer)
  }, [user, postTitle, postBody])

  async function save(e: React.FormEvent) {
    e.preventDefault(); setNotice(''); setError('')
    const checked = profileSchema.safeParse(profile)
    if (!checked.success) { setError(checked.error.issues[0]?.message ?? 'Check the profile fields.'); return }
    if (!user) return
    try { await saveProfile(user.id, checked.data); setNotice('Your profile has been saved.') } catch (err) { setError(err instanceof Error ? err.message : 'Could not save your profile.') }
  }
  async function publishPost(e: React.FormEvent) {
    e.preventDefault(); setNotice(''); setError('')
    if (!user) return
    if (postTitle.trim().length < 2 || postBody.trim().length < 10) { setError('Add a title and at least 10 characters to your post.'); return }
    const { data, error: postError } = await supabase!.from('posts').insert({ profile_id: user.id, title: postTitle.trim(), body: postBody.trim() }).select('id,created_at').single()
    if (postError || !data) { setError(postError?.message || 'Could not publish your post.'); return }
    createPost({ id: data.id, authorId: user.id, authorName: profile.full_name || user.email?.split('@')[0] || 'Developer', title: postTitle.trim(), body: postBody.trim(), createdAt: data.created_at })
    localStorage.removeItem(`devdirectory:post-draft:${user.id}`); setPostTitle(''); setPostBody(''); setDraftRestored(false); setNotice('Your post is live in the community.')
  }
  async function addProject(e: React.FormEvent) {
    e.preventDefault(); setNotice(''); setError('')
    const checked = projectSchema.safeParse({ title: projectTitle, description: projectDescription, technologies: projectTech.split(',').map(s => s.trim()).filter(Boolean), image_url: projectImage, repository_url: projectRepository, demo_url: projectDemo })
    if (!checked.success) { setError(checked.error.issues[0]?.message ?? 'Check the project fields.'); return }
    if (!user) return
    try {
      const id = await saveProject(user.id, checked.data, editingProject ?? undefined)
      const saved = { id, title: checked.data.title, description: checked.data.description, image_url: checked.data.image_url, repository_url: checked.data.repository_url, demo_url: checked.data.demo_url, technologies: checked.data.technologies.map(name => ({ name })) }
      setProjects(items => editingProject ? items.map(item => item.id === editingProject ? saved : item) : [saved, ...items])
      setNotice(editingProject ? 'Project updated.' : 'Project added.')
      setEditingProject(null); setProjectTitle(''); setProjectDescription(''); setProjectTech(''); setProjectImage(''); setProjectRepository(''); setProjectDemo('')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save the project.') }
  }
  async function removeProject(id: string) {
    if (!supabase) return
    const { error: deleteError } = await supabase.from('projects').delete().eq('id', id)
    if (deleteError) { setError(deleteError.message); return }
    setProjects(items => items.filter(p => p.id !== id)); setNotice('Project removed.')
  }
  async function answerRequest(id: string, status: 'accepted' | 'declined') {
    if (!supabase) return
    const { error: updateError } = await supabase.from('connection_requests').update({ status }).eq('id', id)
    if (updateError) { setError(updateError.message); return }
    setConnections(items => items.map(item => item.id === id ? { ...item, status } : item))
  }
  async function logout() { await supabase?.auth.signOut(); navigate('/login') }

  if (!supabase) return <main className="dashboard page-shell" data-reveal><div className="dashboard-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> TEAM OVERVIEW</div><h1>People, work, <span>in view.</span></h1><p className="directory-intro">A quick snapshot of the public directory and the shortlist saved in this browser.</p></div><Link to="/developers" className="button">Explore developers <ArrowRight size={15} /></Link></div><section className="dashboard-stats" aria-label="Directory overview"><Link to="/developers"><strong>{publicDirectoryStats.profiles}</strong><span>Public developer profiles</span></Link><Link to="/developers"><strong>{publicDirectoryStats.organizations}</strong><span>Organizations listed</span></Link><Link to="/saved"><strong>{savedIds.length + savedPostIds.length}</strong><span>Items in your shortlist</span></Link></section><section className="dashboard-card dashboard-welcome"><div className="dashboard-section-head"><div><span className="eyebrow">HOW THIS WORKSPACE WORKS</span><p>Use the directory to find people, then save profiles or posts for your team to revisit.</p></div><span className="completion-pill">LOCAL PREVIEW</span></div><div className="dashboard-quick-links"><Link to="/developers"><strong>Browse the directory</strong><span>Search profiles by name, company, location, or skills.</span><ArrowRight size={15} /></Link><Link to="/saved"><strong>Review your shortlist</strong><span>{savedIds.length} developers · {savedPostIds.length} posts saved on this device.</span><ArrowRight size={15} /></Link><Link to="/add-post"><strong>Write a team update</strong><span>Draft autosaves here; publishing is a simulated API request.</span><ArrowRight size={15} /></Link></div><p className="muted-small">Profile editing, projects, and connection requests need a configured Supabase workspace. The profile examples are public references, not your company’s internal roster.</p></section></main>
  if (busy) return <main className="directory page-shell"><p className="directory-intro">Loading your workspace…</p></main>
  return <main className="dashboard page-shell"><div className="dashboard-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR WORKSPACE</div><h1>Make it <span>yours.</span></h1><p className="directory-intro">A home for your work, your story, and the people you meet.</p></div><button onClick={logout} className="button button-quiet">Log out</button></div>{notice && <p className="form-feedback form-success" role="status">{notice}</p>}{error && <p className="form-feedback form-error" role="alert">{error}</p>}<section className="dashboard-stats" aria-label="Community overview"><Link to="/developers"><strong>{communityCounts.developers}</strong><span>Developers</span></Link><Link to="/developers"><strong>{communityCounts.posts}</strong><span>Community posts</span></Link><Link to="/developers"><strong>{communityCounts.companies}</strong><span>Companies</span></Link></section><section className="dashboard-card"><div className="dashboard-section-head"><div><span className="eyebrow">YOUR PROFILE</span><p>Let people know who you are.</p></div><span className="completion-pill">{profile.full_name && profile.title && profile.bio ? 'PROFILE IN GOOD SHAPE' : 'A FEW DETAILS TO ADD'}</span></div><form className="dashboard-form" onSubmit={save}><div className="form-grid"><label>Your name<input required value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></label><label>Professional title<input value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} /></label><label>Location<input value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} /></label><label>Company<input maxLength={120} value={profile.company_name} onChange={e => setProfile({ ...profile, company_name: e.target.value })} /></label><label>Public contact email<input type="email" value={profile.contact_email} onChange={e => setProfile({ ...profile, contact_email: e.target.value })} /></label><label>Years of experience<input type="number" min="0" max="70" value={profile.years_experience} onChange={e => setProfile({ ...profile, years_experience: Number(e.target.value) })} /></label><label>Profile photo URL<input type="url" value={profile.avatar_url} onChange={e => setProfile({ ...profile, avatar_url: e.target.value })} /></label><label>Personal website<input type="url" value={profile.website_url} onChange={e => setProfile({ ...profile, website_url: e.target.value })} /></label><label>GitHub profile<input type="url" value={profile.github_url} onChange={e => setProfile({ ...profile, github_url: e.target.value })} /></label><label>LinkedIn profile<input type="url" value={profile.linkedin_url} onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })} /></label><label>Skills <span className="field-hint">comma separated</span><div className="skill-input"><input value={skillText || profile.skills.join(', ')} onChange={e => setSkillText(e.target.value)} onBlur={() => setProfile({ ...profile, skills: skillText.split(',').map(s => s.trim()).filter(Boolean) })} /></div></label><label className="field-wide">A little about you<textarea rows={4} maxLength={1200} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} /></label><label className="checkbox-label"><input type="checkbox" checked={profile.available} onChange={e => setProfile({ ...profile, available: e.target.checked })} /> Open to new projects</label></div><button className="button">Save profile <ArrowRight size={14} /></button></form></section><section className="dashboard-card"><div className="dashboard-section-head"><div><span className="eyebrow">COMMUNITY POSTS</span><p>Share a thought, lesson, or question with the community.</p></div><span className="completion-pill">{posts.length} POSTS</span></div><form className="project-form post-compose" onSubmit={publishPost}><label>Post title<input maxLength={100} minLength={2} required value={postTitle} onChange={e => setPostTitle(e.target.value)} /></label><label>Your post<textarea maxLength={1600} minLength={10} required rows={4} value={postBody} onChange={e => setPostBody(e.target.value)} /></label><div className="project-form-actions"><button className="button">Publish post <ArrowRight size={14} /></button><span className="draft-status" role="status">{draftRestored ? "Draft restored from this device" : (postTitle || postBody) ? "Draft saves as you type" : "Draft autosave is on"}</span></div></form><div className="community-post-list">{posts.filter(post => post.authorId === user?.id).map(post => <article className="community-post" key={post.id}><div><h3>{post.title}</h3><p>{post.body}</p></div><button className="delete-button" aria-label={savedPostIds.includes(post.id) ? "Unsave post" : "Save post"} aria-pressed={savedPostIds.includes(post.id)} onClick={() => toggleSavedPost(post.id)}><Bookmark size={15} fill={savedPostIds.includes(post.id) ? "currentColor" : "none"} /></button></article>)}</div></section><section className="dashboard-card"><div className="dashboard-section-head"><div><span className="eyebrow">SELECTED WORK</span><p>Projects make your profile come to life.</p></div></div><div className="dashboard-projects">{projects.map(project => <article key={project.id} className="dashboard-project"><div><h3>{project.title}</h3><p>{project.description}</p><div className="skill-list">{project.technologies.map(t => <span key={t.name}>{t.name}</span>)}</div></div><div className="project-actions"><button aria-label={`Edit ${project.title}`} className="delete-button" onClick={() => { setEditingProject(project.id); setProjectTitle(project.title); setProjectDescription(project.description); setProjectTech(project.technologies.map(t => t.name).join(', ')); setProjectImage(project.image_url ?? ''); setProjectRepository(project.repository_url ?? ''); setProjectDemo(project.demo_url ?? '') }}>Edit</button><button aria-label={`Delete ${project.title}`} className="delete-button" onClick={() => removeProject(project.id)}><Trash2 size={15} /></button></div></article>)}{!projects.length && <p className="muted-small">No projects yet. Add the first one below.</p>}</div><form className="project-form" onSubmit={addProject}><h3><Plus size={16} /> {editingProject ? 'Edit project' : 'Add a project'}</h3><div className="form-grid"><label>Project title<input required minLength={2} value={projectTitle} onChange={e => setProjectTitle(e.target.value)} /></label><label>Technologies <span className="field-hint">comma separated</span><input value={projectTech} onChange={e => setProjectTech(e.target.value)} /></label><label className="field-wide">Description<textarea required minLength={10} maxLength={800} rows={3} value={projectDescription} onChange={e => setProjectDescription(e.target.value)} /></label><label>Screenshot URL<input type="url" value={projectImage} onChange={e => setProjectImage(e.target.value)} /></label><label>Repository URL<input type="url" value={projectRepository} onChange={e => setProjectRepository(e.target.value)} /></label><label>Live demo URL<input type="url" value={projectDemo} onChange={e => setProjectDemo(e.target.value)} /></label></div><div className="project-form-actions"><button className="button">{editingProject ? 'Save changes' : 'Add project'} <ArrowRight size={14} /></button>{editingProject && <button type="button" className="text-link" onClick={() => { setEditingProject(null); setProjectTitle(''); setProjectDescription(''); setProjectTech(''); setProjectImage(''); setProjectRepository(''); setProjectDemo('') }}>Cancel</button>}</div></form></section><section className="dashboard-card"><div className="dashboard-section-head"><div><span className="eyebrow">CONNECTIONS</span><p>Requests you’ve sent and received.</p></div><span className="completion-pill">{connections.filter(c => c.status === 'pending' && c.recipient_profile_id === user?.id).length} TO REVIEW</span></div>{connections.length ? <div className="connection-list">{connections.map(item => <article className="connection-row" key={item.id}><div><strong>{item.sender_profile_id === user?.id ? 'Request sent' : 'Incoming request'}</strong><p>{item.message}</p><span className="request-status">{item.status}</span></div>{item.recipient_profile_id === user?.id && item.status === 'pending' && <div className="connection-actions"><button onClick={() => answerRequest(item.id, 'accepted')}>Accept</button><button onClick={() => answerRequest(item.id, 'declined')}>Decline</button></div>}</article>)}</div> : <p className="muted-small">No connection requests yet.</p>}</section></main>
}
