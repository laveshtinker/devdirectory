import { useCallback, useContext, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, Check, Clock3, Eye, FilePlus2, ListChecks, PenLine, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'
import AlertBanner from '../components/AlertBanner'
import SkeletonLoader from '../components/SkeletonLoader'
import { SavedContext } from '../lib/community'
import { fetchUsers, type DirectoryUser } from '../services/userService'
import { createPost as submitPost } from '../services/postService'

type FieldErrors = { authorId?: string; title?: string; body?: string }
type PostDraft = { authorId: string; title: string; body: string; savedAt?: string }
const DRAFT_KEY = 'devdirectory:bulletin-draft'

function readDraft(): PostDraft {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null') as Partial<PostDraft> | null
    const draft = { authorId: saved?.authorId ?? '', title: saved?.title ?? '', body: saved?.body ?? '', savedAt: saved?.savedAt }
    return draft.title || draft.body ? draft : { authorId: '', title: '', body: '' }
  } catch { return { authorId: '', title: '', body: '' } }
}

export default function AddPost() {
  const [initialDraft] = useState(readDraft)
  const [authors, setAuthors] = useState<DirectoryUser[]>([])
  const [authorId, setAuthorId] = useState(initialDraft.authorId)
  const [title, setTitle] = useState(initialDraft.title)
  const [body, setBody] = useState(initialDraft.body)
  const [authorsLoading, setAuthorsLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState(initialDraft.savedAt ? new Date(initialDraft.savedAt) : null)
  const [authorError, setAuthorError] = useState('')
  const [postError, setPostError] = useState('')
  const [success, setSuccess] = useState('')
  const [preview, setPreview] = useState(false)
  const [saveToBrief, setSaveToBrief] = useState(true)
  const { createPost, toggleSavedPost } = useContext(SavedContext)

  const loadAuthors = useCallback(async () => {
    setAuthorsLoading(true); setAuthorError('')
    try {
      const data = await fetchUsers()
      setAuthors(data)
      setAuthorId(current => current || String(data[0]?.id ?? ''))
    } catch { setAuthorError('Authors could not be loaded. Retry to populate the dropdown.') }
    finally { setAuthorsLoading(false) }
  }, [])
  useEffect(() => { void loadAuthors() }, [loadAuthors])

  useEffect(() => {
    const hasContent = Boolean(title || body)
    if (!hasContent) {
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* Ignore unavailable browser storage. */ }
      return
    }
    setIsDirty(true)
    const timer = window.setTimeout(() => {
      const savedAt = new Date()
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ authorId, title, body, savedAt: savedAt.toISOString() })) } catch { /* The form remains usable if storage is disabled. */ }
      setLastSavedAt(savedAt)
      setIsDirty(false)
    }, 350)
    return () => window.clearTimeout(timer)
  }, [authorId, title, body])

  const errors = useMemo<FieldErrors>(() => ({
    authorId: authorId ? undefined : 'Choose an author.',
    title: title.trim().length < 5 ? 'Title must be at least 5 characters.' : title.trim().length > 80 ? 'Title must be 80 characters or fewer.' : undefined,
    body: body.trim().length < 20 ? 'Body must be at least 20 characters.' : body.trim().length > 500 ? 'Body must be 500 characters or fewer.' : undefined,
  }), [authorId, title, body])
  const valid = !errors.authorId && !errors.title && !errors.body
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 220))
  const completion = [Boolean(authorId), title.trim().length >= 5 && title.trim().length <= 80, body.trim().length >= 20 && body.trim().length <= 500].filter(Boolean).length
  const savedLabel = isDirty ? 'Saving draft…' : lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Draft autosave is on'

  const publish = useCallback(async () => {
    if (!valid) { setAttempted(true); return }
    setPosting(true); setPostError(''); setSuccess('')
    try {
      const response = await submitPost({ title: title.trim(), body: body.trim(), userId: Number(authorId) })
      if (response.status !== 201) throw new Error(`Expected 201 Created; received ${response.status}.`)
      const selectedAuthor = authors.find(author => String(author.id) === authorId)
      const localId = `bulletin-${Date.now()}`
      createPost({ id: localId, authorId, authorName: selectedAuthor?.name ?? 'Community member', title: title.trim(), body: body.trim(), createdAt: new Date().toISOString() })
      if (saveToBrief) toggleSavedPost(localId)
      setSuccess(saveToBrief ? 'Update published and added to your team brief.' : 'Update published and saved in this browser.')
      setTitle(''); setBody(''); setAttempted(false); setIsDirty(false); setLastSavedAt(null)
      try { localStorage.removeItem(DRAFT_KEY) } catch { /* Ignore unavailable browser storage. */ }
    } catch { setPostError('The bulletin could not be published. Your form is still here so you can retry.') }
    finally { setPosting(false) }
  }, [authorId, authors, body, createPost, saveToBrief, title, toggleSavedPost, valid])

  function submit(event: FormEvent) { event.preventDefault(); setAttempted(true); void publish() }
  function clearDraft() {
    setAuthorId(''); setTitle(''); setBody(''); setAttempted(false); setPreview(false); setIsDirty(false); setLastSavedAt(null); setSuccess('Draft cleared.')
    try { localStorage.removeItem(DRAFT_KEY) } catch { /* Ignore unavailable browser storage. */ }
  }

  return <main className="lab-page page-shell add-post-page" data-reveal>
    <div className="eyebrow"><span className="eyebrow-line" /> TEAM BULLETIN</div>
    <h1>Share an <span>update.</span></h1>
    <p className="directory-intro">A place for useful ideas, small wins, and things worth passing along.</p>
    <section className="lab-form-card add-post-card">
      <div className="lab-form-heading"><span className="lab-form-icon"><FilePlus2 size={18} /></span><div><h2>New publication</h2><p>Your draft is saved automatically on this device.</p></div><span className="draft-save-state" role="status"><span className={isDirty ? 'save-indicator saving' : 'save-indicator'} />{savedLabel}</span></div>
      {authorError && <AlertBanner message={authorError} onRetry={() => void loadAuthors()} onDismiss={() => setAuthorError('')} />}
      {postError && <AlertBanner message={postError} onRetry={() => void publish()} onDismiss={() => setPostError('')} />}
      {success && <p className="form-feedback form-success" role="status">{success} {success.includes('published') && <Link to="/teams">View team brief <ArrowRight size={13} /></Link>}</p>}
      {authorsLoading ? <SkeletonLoader rows={2} label="Loading authors" /> : <>
        <div className="writer-tools"><div className="writer-progress"><span><ListChecks size={15} /> Ready to publish</span><b>{completion}/3</b><div className="writer-progress-track"><span style={{ width: `${completion / 3 * 100}%` }} /></div><small>Choose an author and meet the title and body length guidelines.</small></div><div className="writer-meta"><span><FilePlus2 size={14} /> {wordCount} words</span><span><Clock3 size={14} /> {wordCount ? `${readingMinutes} min read` : 'Reading time —'}</span></div></div>
        <form className="lab-post-form" onSubmit={submit} noValidate>
          <label htmlFor="post-author">Author <select id="post-author" value={authorId} onChange={event => { setAuthorId(event.target.value); setIsDirty(true) }} aria-invalid={attempted && Boolean(errors.authorId)} aria-describedby="post-author-help"><option value="">Choose an author</option>{authors.map(author => <option value={author.id} key={author.id}>{author.name} — {author.company.name}</option>)}</select><small className="lab-helper" id="post-author-help">Sample author from the JSONPlaceholder testing API.</small>{attempted && errors.authorId && <small className="lab-field-error">{errors.authorId}</small>}</label>
          <label htmlFor="post-title">Title <input id="post-title" value={title} onChange={event => { setTitle(event.target.value); setSuccess('') }} minLength={5} maxLength={80} aria-invalid={(attempted || title.length > 0) && Boolean(errors.title)} aria-describedby="post-title-count" placeholder="A clear title for your update" />{(attempted || title.length > 0) && errors.title && <small className="lab-field-error">{errors.title}</small>}<small className="lab-character-count" id="post-title-count">{title.length}/80 · minimum 5</small></label>
          <div className="writer-body-field"><div className="writer-field-top"><label htmlFor="post-body">Article body</label><div className="writer-tabs" role="tablist" aria-label="Editor view"><button type="button" role="tab" aria-selected={!preview} className={!preview ? 'active' : ''} onClick={() => setPreview(false)}><PenLine size={13} /> Write</button><button type="button" role="tab" aria-selected={preview} className={preview ? 'active' : ''} onClick={() => setPreview(true)}><Eye size={13} /> Preview</button></div></div>
            {preview ? <div className="post-live-preview" role="tabpanel"><span className="preview-label">LIVE PREVIEW</span><h2>{title.trim() || 'Your update title'}</h2><p>{body.trim() || 'Your article preview will appear here as you write.'}</p></div> : <textarea id="post-body" value={body} onChange={event => { setBody(event.target.value); setSuccess('') }} minLength={20} maxLength={500} rows={7} aria-invalid={(attempted || body.length > 0) && Boolean(errors.body)} aria-describedby="post-body-count" placeholder="Share a useful idea, update, or technical note…" />}
            {!preview && (attempted || body.length > 0) && errors.body && <small className="lab-field-error">{errors.body}</small>}{!preview && <small className="lab-character-count" id="post-body-count">{body.length}/500 · minimum 20</small>}
          </div>
          <label className="team-brief-option"><input type="checkbox" checked={saveToBrief} onChange={event => setSaveToBrief(event.target.checked)} /><span><b>Add this update to the team brief</b><small>Keep the published post in your saved list so it can be exported for your team.</small></span></label>
          <div className="lab-form-actions"><button className="button" disabled={posting || authorsLoading}>{posting ? 'Publishing…' : 'Publish bulletin'} <ArrowRight size={15} /></button><button type="button" className="clear-draft-button" onClick={clearDraft}><RotateCcw size={14} /> Clear draft</button><Link className="text-link" to="/developers">Back to developers</Link><span>JSONPlaceholder accepts this request but does not permanently store it. The post is kept in this browser.</span></div>
        </form>
      </>}
    </section>
    <p className="writer-privacy-note"><Check size={14} /> Drafts and locally published updates stay in this browser’s storage.</p>
  </main>
}
