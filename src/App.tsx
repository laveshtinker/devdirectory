import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, Bookmark, Building2, Check, Code2, Github, Globe2, Mail, Search, Share2, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import Dashboard from './Dashboard'
import { supabase } from './lib/supabase'
import { createConnectionRequest } from './lib/data'
import InfoPage from './InfoPage'
import { SavedContext, type CommunityPost } from './lib/community'
import Header, { Brand } from './components/Navbar'
import HomeOverview from './pages/Home'
import LabLogin from './pages/Login'
import AddPost from './pages/AddPost'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import { publicDevelopers as people, type Developer } from './data/developers'
import HowItWorks from './pages/HowItWorks'
import ForTeams from './pages/ForTeams'

function MotionObserver() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('reveal-visible'); observer.unobserve(entry.target) }
    }), { threshold: 0.12, rootMargin: '0px 0px -36px 0px' })
    const watched = new WeakSet<Element>()
    const watch = () => document.querySelectorAll('[data-reveal]').forEach(element => {
      if (!watched.has(element)) { watched.add(element); element.classList.add('motion-ready'); observer.observe(element) }
    })
    watch()
    const mutation = new MutationObserver(watch)
    mutation.observe(document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); mutation.disconnect() }
  }, [])
  return null
}

function Portrait({ id, initials, className = '' }: { id: string; initials: string; className?: string }) { const src = !id ? '' : id.startsWith('http') ? id : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=160&h=160&q=80`; return <><img className={`portrait ${className} ${id ? '' : 'portrait-hidden'}`} src={src} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.add('initials-visible') }} /><span className={`portrait-fallback ${id ? '' : 'initials-visible'}`}>{initials}</span></> }

function PersonCard({ person, index }: { person: Developer; index: number }) {
  const id = person.id ?? person.name.toLowerCase().replace(/ /g, '-')
  const { savedIds, toggleSaved } = useContext(SavedContext)
  const saved = savedIds.includes(id)
  return <article className="person-card" style={{ animationDelay: `${index * 70}ms` }}><Link to={`/developers/${id}`} className="person-card-main"><div className="person-photo-wrap"><Portrait id={person.image} initials={person.initials} /><span className={person.publicProfile ? 'availability public-profile' : person.available ? 'availability' : 'availability unavailable'}>{person.publicProfile ? 'Public GitHub' : person.available ? 'Available' : 'Booked'}</span><span className="card-arrow" aria-hidden="true"><ArrowUpRight size={17} /></span></div><div className="person-info"><div className="person-name-row"><h3>{person.name}</h3><span className="verified">{person.publicProfile ? <Github size={13} /> : <ShieldCheck size={13} fill="currentColor" />}</span></div><p className="person-role">{person.role}</p><p className="person-bio-preview">{person.bio}</p><p className="person-location"><Globe2 size={13} />{person.location} <span>·</span> {person.publicProfile ? 'GitHub member' : person.experience}</p>{(person.company || person.email) && <div className="person-contact">{person.company && <span><Building2 size={12} />{person.company}</span>}{person.email && <span><Mail size={12} />{person.email}</span>}</div>}<div className="skill-list">{person.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div></Link>{person.github && <a className="github-card-link" href={person.github} target="_blank" rel="noreferrer" aria-label={`Open ${person.name} GitHub profile`}><Github size={14} /> GitHub <ArrowUpRight size={12} /></a>}<button type="button" className={`save-person ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Remove ${person.name} from saved developers` : `Save ${person.name}`} aria-pressed={saved} onClick={() => toggleSaved(id)}><Bookmark size={15} fill={saved ? 'currentColor' : 'none'} /></button></article>
}

function FloatingPortrait({ person, index }: { person: Developer; index: number }) {
  const slug = person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return <Link to={`/developers/${slug}`} className={`floating-portrait floating-portrait-${index + 1}`} aria-label={`View ${person.name}'s developer profile`}>
    <Portrait id={person.image} initials={person.initials} /><span>{person.name}</span>
  </Link>
}

function HeroCard() {
  return <div className="hero-visual" aria-label="A preview of the DevDirectory community">
    <span className="visual-orbit orbit-one" /><span className="visual-orbit orbit-two" /><span className="visual-cross cross-one">✳</span><span className="visual-cross cross-two">✳</span>
    <section className="profile-preview community-preview" aria-label="DevDirectory community preview"><div className="preview-cover community-cover"><div className="cover-grid" /><span className="community-cover-number" aria-hidden="true">{String(people.length).padStart(2, '0')}</span><div className="community-orbit-mark" aria-hidden="true"><Code2 size={27} /></div><span className="preview-issue">DEVDIRECTORY <b>COMMUNITY</b></span><span className="community-edition">FIELD NOTES <i>№ 001</i></span><span className="preview-badge"><Sparkles size={12} /> PEOPLE FIRST</span></div><div className="community-preview-content"><span className="community-preview-kicker">INDEPENDENT MINDS · SHARED CRAFT</span><h2>Good work happens<br /><em>together.</em></h2><p>Meet the people behind thoughtful products, useful tools, and ideas worth sharing.</p><div className="community-preview-members"><div className="community-avatar-stack">{people.slice(0, 4).map(person => <span key={person.name}><Portrait id={person.image} initials={person.initials} /></span>)}</div><span><b>{people.length} public profiles</b><small>and growing</small></span><span className="community-member-mark" aria-hidden="true">✳</span></div><div className="community-preview-tags"><span>Open source</span><span>Product teams</span><span>Ideas</span></div><span className="community-card-index" aria-hidden="true">01 — {String(people.length).padStart(2, '0')}</span></div></section>
    <div className="floating-portrait-group" aria-label="More developers in the community">{people.slice(1, 5).map((person, index) => <FloatingPortrait key={person.name} person={person} index={index} />)}</div>
  </div>
}

function Landing() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInputRef.current?.focus() }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])
  const tickerTopics = ['FRONTEND', 'BACKEND', 'OPEN SOURCE', 'DESIGN SYSTEMS', 'DATA & AI']
  return <><Header /><main>
    <section className="hero page-shell" data-reveal><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> PEOPLE MAKE THE PRODUCT</div><h1>Discover your<br /><span>engineering team.</span></h1><p className="hero-description">A thoughtful place to find the people behind great work, explore what they’re building, and share ideas across your team.</p><form className="hero-search" onSubmit={event => { event.preventDefault(); navigate(`/users${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`) }}><Search size={17} /><input ref={searchInputRef} value={search} onChange={event => setSearch(event.target.value)} placeholder="Search developers or companies" aria-label="Search developers or companies" /><span className="search-shortcut">Ctrl K</span><button type="submit">Explore <ArrowRight size={14} /></button></form><div className="hero-proof"><div className="proof-avatars">{people.slice(0, 4).map(person => <Portrait key={person.name} id={person.image} initials={person.initials} />)}</div><p><b>A team directory with context.</b><br /><span>Profiles, publications, and the work between.</span></p></div></div><HeroCard /></section>
    <div className="ticker-band"><div className="ticker-inner page-shell"><span className="ticker-label">BUILT FOR<br />ENGINEERING TEAMS</span><div className="ticker-marquee" role="group" aria-label="Engineering disciplines" aria-roledescription="Scrolling list"><div className="ticker-track"><div className="ticker-group">{tickerTopics.map(item => <span className="ticker-item" key={item}><span className="ticker-symbol">✳</span>{item}</span>)}</div><div className="ticker-group" aria-hidden="true">{tickerTopics.map(item => <span className="ticker-item" key={item}><span className="ticker-symbol">✳</span>{item}</span>)}</div></div></div><span className="ticker-trailing">PEOPLE FIRST</span></div></div>
    <section className="featured-section page-shell" id="featured" data-reveal><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> A FEW PEOPLE TO KNOW</div><h2>Good work has a <span>face.</span></h2></div><Link to="/developers" className="text-link">Explore the directory <ArrowUpRight size={15} /></Link></div><p className="section-subtitle">A small introduction to the builders shaping the tools we use every day.</p><div className="people-grid">{people.slice(0, 4).map((person, index) => <PersonCard key={person.name} person={person} index={index} />)}</div><div className="featured-foot"><span>PUBLIC PROFILES <b className="foot-dash">/</b> CURATED FOR DISCOVERY</span><Link to="/developers" className="button button-quiet featured-community-cta">Meet the community <ArrowUpRight size={13} /></Link></div></section>
    <HomeOverview />
    <section className="how-section page-shell" id="how-it-works" data-reveal><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> SIMPLE BY DESIGN</div><h2>Find the right <span>connection.</span></h2></div></div><p className="section-subtitle">A clear path from finding someone to keeping their work close.</p><div className="steps-grid">{[{ n: '01', icon: <Search size={17} />, title: 'Find a developer', text: 'Search public profiles by name, company, skill, or location.' }, { n: '02', icon: <Code2 size={17} />, title: 'Follow the work', text: 'Read each bio and open the developer’s linked GitHub or personal site.' }, { n: '03', icon: <Bookmark size={17} />, title: 'Build a shortlist', text: 'Bookmark profiles and community posts. Your shortlist stays in this browser.' }].map(step => <article className="step-card" key={step.n}><span className="step-number">{step.n}</span><span className="step-icon">{step.icon}</span><h3>{step.title}</h3><p>{step.text}</p><ArrowUpRight className="step-arrow" size={15} /></article>)}</div><Link to="/how-it-works" className="button button-quiet how-cta">Explore the workflow <ArrowRight size={14} /></Link></section>
    <section className="closing-section page-shell" id="about" data-reveal><div className="closing-card"><div className="eyebrow"><span className="eyebrow-line" /> FOR ENGINEERING TEAMS</div><h2>Make good people<br /><span>easier to find.</span></h2><p>Review a saved shortlist, add useful context, and export a brief for your team to discuss.</p><div className="closing-actions"><Link className="button" to="/teams">Open team tools <ArrowUpRight size={15} /></Link><Link className="button button-quiet" to="/saved">Open shortlist <Bookmark size={14} /></Link></div></div></section>
  </main><Footer /></>
}
function Directory() {
  const [query, setQuery] = useState(new URLSearchParams(location.search).get('q') ?? '')
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); searchInputRef.current?.focus() }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])
  const [skill, setSkill] = useState('All skills')
  const [savedOnly, setSavedOnly] = useState(new URLSearchParams(location.search).get('saved') === '1')
  const { savedIds } = useContext(SavedContext)
  const [locationFilter, setLocationFilter] = useState('Anywhere')
  const [experience, setExperience] = useState('Any experience')
  const [availability, setAvailability] = useState(false)
  const [company, setCompany] = useState('Any company')
  const [emailDomain, setEmailDomain] = useState('Any email domain')
  const [sort, setSort] = useState('Relevance')
  const [page, setPage] = useState(1)
  const [directoryPeople, setDirectoryPeople] = useState<Developer[]>(people)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [loadError, setLoadError] = useState('')
  useEffect(() => {
    let active = true
    if (!supabase) return
    Promise.resolve(supabase.from('profiles').select('id,full_name,title,location,bio,years_experience,available,company_name,contact_email,profile_skills(name)').order('full_name')).then(({ data, error }) => {
      if (!active) return
      if (error) setLoadError('We couldn’t load the directory. Please try again in a moment.')
      else setDirectoryPeople((data ?? []).map((row: any) => ({ id: row.id, name: row.full_name || 'Developer', role: row.title || 'Independent Developer', location: row.location || 'Location not listed', experience: `${row.years_experience} years`, years: row.years_experience, skills: (row.profile_skills ?? []).map((s: { name: string }) => s.name), image: '', initials: (row.full_name || 'D').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase(), available: row.available, bio: row.bio, company: row.company_name, email: row.contact_email })))
      setLoading(false)
    }).catch(() => { if (active) { setLoadError('We couldn’t load the directory. Please try again in a moment.'); setLoading(false) } })
    return () => { active = false }
  }, [])
  const filtered = directoryPeople.filter(p => (skill === 'All skills' || p.skills.includes(skill)) && (locationFilter === 'Anywhere' || p.location.toLowerCase().includes(locationFilter.toLowerCase())) && (experience === 'Any experience' || p.publicProfile || (experience === '0–3 years' ? p.years <= 3 : experience === '4–7 years' ? p.years >= 4 && p.years <= 7 : p.years >= 8)) && (!availability || p.available) && (company === 'Any company' || p.company === company) && (emailDomain === 'Any email domain' || p.email?.split('@')[1]?.toLowerCase() === emailDomain) && (!savedOnly || savedIds.includes(p.id ?? p.name.toLowerCase().replace(/ /g, '-'))) && `${p.name} ${p.role} ${p.location} ${p.company ?? ''} ${p.email ?? ''} ${p.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
  const visible = [...filtered].sort((a, b) => sort === 'Name' ? a.name.localeCompare(b.name) : sort === 'Most experience' ? b.years - a.years : sort === 'Company' ? (a.company ?? '').localeCompare(b.company ?? '') : Number(b.available) - Number(a.available)).slice(0, page * 6)
  const clearFilters = () => { setQuery(''); setSkill('All skills'); setLocationFilter('Anywhere'); setExperience('Any experience'); setAvailability(false); setCompany('Any company'); setEmailDomain('Any email domain'); setSavedOnly(false); setPage(1) }
  return <><Header /><main className="directory page-shell" data-reveal><div className="eyebrow"><span className="eyebrow-line" /> THE DEVELOPER COMMUNITY</div><h1>Find your <span>people.</span></h1><p className="directory-intro">{!supabase ? 'Explore real public GitHub profiles. These developers are examples, not DevDirectory members.' : 'A considered community of independent developers and product engineers.'}</p><div className="directory-tools"><label className="directory-search"><Search size={17} /><input ref={searchInputRef} value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Name, role, skill, or keyword" aria-label="Search developers" /><kbd>Ctrl K</kbd></label><label className="skill-filter"><span className="sr-only">Filter by skill</span><select value={skill} onChange={e => { setSkill(e.target.value); setPage(1) }}>{['All skills', ...new Set(directoryPeople.flatMap(p => p.skills))].map(s => <option key={s}>{s}</option>)}</select></label><label className="skill-filter"><span className="sr-only">Filter by location</span><select value={locationFilter} onChange={e => { setLocationFilter(e.target.value); setPage(1) }}>{['Anywhere', ...new Set(directoryPeople.map(p => p.location).filter(Boolean))].map(s => <option key={s}>{s}</option>)}</select></label>{supabase && <label className="skill-filter"><span className="sr-only">Filter by experience</span><select value={experience} onChange={e => { setExperience(e.target.value); setPage(1) }}>{['Any experience', '0–3 years', '4–7 years', '8+ years'].map(s => <option key={s}>{s}</option>)}</select></label>}<label className="skill-filter"><span className="sr-only">Filter by company</span><select value={company} onChange={e => { setCompany(e.target.value); setPage(1) }}>{['Any company', ...new Set(directoryPeople.map(p => p.company).filter(Boolean) as string[])].map(s => <option key={s}>{s}</option>)}</select></label>{supabase && <label className="skill-filter"><span className="sr-only">Filter by email domain</span><select value={emailDomain} onChange={e => { setEmailDomain(e.target.value); setPage(1) }}>{['Any email domain', ...new Set(directoryPeople.map(p => p.email?.split('@')[1]?.toLowerCase()).filter(Boolean) as string[])].map(s => <option key={s}>{s}</option>)}</select></label>}<label className="skill-filter"><span className="sr-only">Sort developers</span><select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}>{['Relevance', 'Name', 'Company', ...(supabase ? ['Most experience'] : [])].map(s => <option key={s}>{s}</option>)}</select></label>{supabase && <label className="availability-filter"><input type="checkbox" checked={availability} onChange={e => setAvailability(e.target.checked)} /> Available now</label>}<label className="availability-filter"><input type="checkbox" checked={savedOnly} onChange={e => setSavedOnly(e.target.checked)} /> Saved developers</label></div>{loadError && <p className="form-feedback form-error" role="alert">{loadError}</p>}<div className="directory-count"><span>{loading ? 'Finding your people…' : `${filtered.length} profiles to explore`}</span><span>{supabase ? 'HANDPICKED, ALWAYS HUMAN' : 'PUBLIC PROFILE EXAMPLES'}</span></div>{loading ? <div className="loading-state" role="status">Gathering good people…</div> : visible.length ? <><div className="people-grid">{visible.map((person, i) => <PersonCard person={person} index={i} key={person.id ?? person.name} />)}</div>{visible.length < filtered.length && <button className="button button-quiet load-more" onClick={() => setPage(p => p + 1)}>Meet more people <ArrowDown size={14} /></button>}</> : <div className="empty-state"><Search size={24} /><h2>{savedOnly ? 'Your saved list is waiting.' : 'No one here just yet.'}</h2><p>{savedOnly ? 'Save a developer profile to keep it close at hand.' : 'Try a different name or skill and see who you meet.'}</p><button className="text-link" onClick={clearFilters}>Clear filters <ArrowRight size={15} /></button></div>}</main><Footer /></>
}

function Profile() {
  const slug = location.pathname.split('/').pop() ?? ''
  const [person, setPerson] = useState<Developer | null>(null)
  const [projects, setProjects] = useState<{ id: string; title: string; description: string; image_url?: string; repository_url?: string; demo_url?: string; technologies: { name: string }[] }[]>([])
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'work' | 'posts'>('about')
  const [relatedPeople, setRelatedPeople] = useState<Developer[]>([])
  const { posts, savedPostIds, toggleSavedPost, mergePosts } = useContext(SavedContext)
  const [missing, setMissing] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    let active = true
    const sample = people.find(p => p.name.toLowerCase().replace(/ /g, '-') === slug)
    setPerson(sample ?? null); setProjects([]); setRelatedPeople([]); setActiveTab('about'); setMissing(false)
    if (sample) {
      const sameCompany = people.filter(p => p.company && p.company === sample.company && p.name !== sample.name)
      const sharedSkills = people.filter(p => p.name !== sample.name && p.skills.some(skill => sample.skills.includes(skill)))
      setRelatedPeople((sameCompany.length ? sameCompany : sharedSkills).slice(0, 3))
      return
    }
    if (!supabase) { setMissing(true); return }
    const client = supabase
    Promise.all([
      client.from('profiles').select('id,full_name,title,location,bio,years_experience,available,avatar_url,website_url,github_url,linkedin_url,company_name,contact_email,profile_skills(name)').eq('id', slug).maybeSingle(),
      client.from('projects').select('id,title,description,image_url,repository_url,demo_url,project_technologies(name)').eq('profile_id', slug).order('created_at', { ascending: false }),
      client.from('posts').select('id,profile_id,title,body,created_at').eq('profile_id', slug).order('created_at', { ascending: false }),
    ]).then(([profile, projectResult, postResult]) => {
      if (!active) return
      if (profile.data) {
        const row = profile.data
        setPerson({ id: row.id, name: row.full_name || 'Developer', role: row.title || 'Independent Developer', location: row.location || 'Location not listed', experience: `${row.years_experience} years`, years: row.years_experience, skills: (row.profile_skills ?? []).map((s: { name: string }) => s.name), image: row.avatar_url || '', initials: (row.full_name || 'D').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase(), available: row.available, bio: row.bio, website: row.website_url, github: row.github_url, linkedin: row.linkedin_url, company: row.company_name, email: row.contact_email })
        setProjects((projectResult.data ?? []).map((p: any) => ({ id: p.id, title: p.title, description: p.description, image_url: p.image_url, repository_url: p.repository_url, demo_url: p.demo_url, technologies: p.project_technologies ?? [] })))
        mergePosts((postResult.data ?? []).map((post: any) => ({ id: post.id, authorId: post.profile_id, authorName: row.full_name || 'Developer', title: post.title, body: post.body, createdAt: post.created_at })))
        if (row.company_name) client.from('profiles').select('id,full_name,title,location,bio,years_experience,available,avatar_url,company_name,contact_email,profile_skills(name)').eq('company_name', row.company_name).neq('id', slug).limit(3).then(({ data }) => { if (active) setRelatedPeople((data ?? []).map((related: any) => ({ id: related.id, name: related.full_name || 'Developer', role: related.title || 'Independent Developer', location: related.location || 'Location not listed', experience: `${related.years_experience} years`, years: related.years_experience, skills: (related.profile_skills ?? []).map((s: { name: string }) => s.name), image: related.avatar_url || '', initials: (related.full_name || 'D').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase(), available: related.available, bio: related.bio, company: related.company_name, email: related.contact_email }))) })
      } else setMissing(true)
    }).catch(() => { if (active) setMissing(true) })
    return () => { active = false }
  }, [slug, mergePosts])
  async function connect(e: React.FormEvent) {
    e.preventDefault(); setStatus(''); setError('')
    if (!person?.id) { setError('Connection requests are available for member profiles after accounts are enabled.'); return }
    const { data } = await supabase!.auth.getUser()
    if (!data.user) { navigate('/login'); return }
    if (message.trim().length < 5) { setError('Add a short note so they know why you’re reaching out.'); return }
    setBusy(true)
    try { await createConnectionRequest(person.id, message.trim()); setStatus('Your request is on its way.'); setMessage('') } catch (err) { setError(err instanceof Error ? err.message : 'Could not send your request.') }
    setBusy(false)
  }
  async function shareProfile() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: `${person?.name} — DevDirectory`, url })
      else { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 2200) }
    } catch { setError('Could not share this profile. You can copy its address from the browser.') }
  }
  if (!person) return <><Header /><main className="directory page-shell" data-reveal>{missing ? <><h1>We couldn’t find that profile.</h1><Link to="/developers" className="text-link">Back to the community <ArrowRight size={15} /></Link></> : <p className="directory-intro">Loading profile…</p>}</main><Footer /></>
  return <><Header /><main className="profile-page page-shell" data-reveal><Link to="/developers" className="text-link back-link"><ArrowDown size={14} /> Back to the community</Link><section className="profile-panel"><div className="profile-cover"><div className="cover-grid" /></div><div className="profile-main"><Portrait id={person.image} initials={person.initials} className="profile-photo" /><div className="profile-heading"><span className={person.publicProfile ? 'availability public-profile' : person.available ? 'availability' : 'availability unavailable'}>{person.publicProfile ? 'Public GitHub profile' : person.available ? 'Available for projects' : 'Currently booked'}</span><h1>{person.name}</h1><p>{person.role}</p><div className="person-location"><Globe2 size={14} />{person.location} <span>·</span> {person.publicProfile ? 'Public GitHub profile' : person.experience}</div></div><div className="profile-actions"><button className="share-profile" onClick={shareProfile}>{copied ? <Check size={15} /> : <Share2 size={15} />}{copied ? 'Copied' : 'Share profile'}</button>{person.publicProfile && person.github ? <a className="button github-profile-button" href={person.github} target="_blank" rel="noreferrer"><Github size={15} /> View GitHub profile <ArrowUpRight size={15} /></a> : <form className="connect-form" onSubmit={connect}><label className="sr-only" htmlFor="connect-message">Short introduction</label><input id="connect-message" maxLength={1000} value={message} onChange={e => setMessage(e.target.value)} placeholder="A short introduction…" /><button className="button" disabled={busy}>{busy ? 'Sending…' : 'Say hello'} <ArrowUpRight size={15} /></button></form>}</div></div>{(status || error) && <p className={`form-feedback ${error ? 'form-error' : 'form-success'}`} role={error ? 'alert' : 'status'}>{error || status}</p>}<nav className="profile-tabs" aria-label="Profile sections"><button className={activeTab === 'about' ? 'active' : ''} onClick={() => setActiveTab('about')}>About</button><button className={activeTab === 'work' ? 'active' : ''} onClick={() => setActiveTab('work')}>Selected work ({projects.length})</button><button className={activeTab === 'posts' ? 'active' : ''} onClick={() => setActiveTab('posts')}>Posts ({posts.filter(post => post.authorId === (person.id ?? slug)).length})</button></nav>{activeTab === 'about' ? <><div className="profile-body"><div><div className="eyebrow"><span className="eyebrow-line" /> A LITTLE ABOUT ME</div><p className="profile-bio">{person.bio || 'This developer is just getting started on their profile.'}</p><div className="eyebrow profile-skills-title"><span className="eyebrow-line" /> THINGS I WORK WITH</div><div className="skill-list">{person.skills.map(s => <span key={s}>{s}</span>)}</div></div><aside className="profile-aside"><span>CONTACT & LINKS</span>{person.company && <p className="profile-company">{person.company}</p>}{person.email && <a href={'mailto:' + person.email}>{person.email}</a>}{person.website && <a href={person.website} target="_blank" rel="noreferrer">Personal website ↗</a>}{person.github && <a href={person.github} target="_blank" rel="noreferrer">GitHub ↗</a>}{person.linkedin && <a href={person.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>}<span>LOCATION</span><p>{person.location}</p></aside></div>{relatedPeople.length > 0 && <section className="profile-related"><div className="eyebrow"><span className="eyebrow-line" /> {relatedPeople.some(related => related.company && related.company === person.company) ? `PEOPLE AT ${person.company?.toUpperCase()}` : 'DEVELOPERS WITH RELATED SKILLS'}</div><div className="people-grid">{relatedPeople.map((related, i) => <PersonCard key={related.id ?? related.name} person={related} index={i} />)}</div></section>}</> : activeTab === 'work' ? <div className="profile-projects"><span className="eyebrow"><span className="eyebrow-line" /> SELECTED WORK</span>{projects.length ? <div className="public-projects">{projects.map(p => <article className="public-project" key={p.id}>{p.image_url && <img className="project-image" src={p.image_url} alt="" loading="lazy" />}<h3>{p.title}</h3><p>{p.description}</p><div className="skill-list">{p.technologies.map(t => <span key={t.name}>{t.name}</span>)}</div><div className="project-links">{p.repository_url && <a href={p.repository_url} target="_blank" rel="noreferrer">Repository ↗</a>}{p.demo_url && <a href={p.demo_url} target="_blank" rel="noreferrer">Live demo ↗</a>}</div></article>)}</div> : <div className="empty-project"><Code2 size={20} /><p>Projects are coming soon.</p></div>}</div> : <div className="profile-posts">{posts.filter(post => post.authorId === (person.id ?? slug)).length ? posts.filter(post => post.authorId === (person.id ?? slug)).map(post => <article className="community-post" key={post.id}><div><span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span><h3>{post.title}</h3><p>{post.body}</p></div><button className={savedPostIds.includes(post.id) ? 'save-person is-saved' : 'save-person'} aria-label={savedPostIds.includes(post.id) ? 'Remove saved post' : 'Save post'} aria-pressed={savedPostIds.includes(post.id)} onClick={() => toggleSavedPost(post.id)}><Bookmark size={15} fill={savedPostIds.includes(post.id) ? 'currentColor' : 'none'} /></button></article>) : <div className="empty-project"><Sparkles size={20} /><p>No community posts yet.</p></div>}</div>}</section></main><Footer /></>
}

function Footer() { return <footer className="footer" data-reveal><div className="footer-inner page-shell"><div><Brand /><p>Good work starts with good people.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/how-it-works">Workflow guide</Link><Link to="/teams">Team tools</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link></nav><div className="footer-bottom"><span>© {new Date().getFullYear()} DEVDIRECTORY · ENGINEERING COMMUNITY</span><span><Link to="/privacy">Privacy</Link><i aria-hidden="true">·</i><Link to="/terms">Terms</Link></span></div></div></footer> }

function SavedItems() {
  const { savedIds, savedPostIds, posts, toggleSavedPost } = useContext(SavedContext)
  const [savedMembers, setSavedMembers] = useState<Developer[]>([])
  useEffect(() => {
    const demo = people.filter(person => savedIds.includes(person.id ?? person.name.toLowerCase().replace(/ /g, '-')))
    setSavedMembers(demo)
    const memberIds = savedIds.filter(id => !demo.some(person => (person.id ?? person.name.toLowerCase().replace(/ /g, '-')) === id))
    if (!supabase || !memberIds.length) return
    let active = true
    supabase.from('profiles').select('id,full_name,title,location,bio,years_experience,available,avatar_url,company_name,contact_email,profile_skills(name)').in('id', memberIds).then(({ data }) => {
      if (active) setSavedMembers([...demo, ...(data ?? []).map((row: any) => ({ id: row.id, name: row.full_name || 'Developer', role: row.title || 'Independent Developer', location: row.location || 'Location not listed', experience: `${row.years_experience} years`, years: row.years_experience, skills: (row.profile_skills ?? []).map((s: { name: string }) => s.name), image: row.avatar_url || '', initials: (row.full_name || 'D').split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase(), available: row.available, bio: row.bio, company: row.company_name, email: row.contact_email }))])
    })
    return () => { active = false }
  }, [savedIds])
  const savedPosts = posts.filter(post => savedPostIds.includes(post.id))
  return <><Header /><main className="directory page-shell saved-page" data-reveal><div className="eyebrow"><span className="eyebrow-line" /> YOUR SHORTLIST</div><h1>Keep the good <span>ones close.</span></h1><p className="directory-intro">Profiles and community posts you’ve bookmarked on this device.</p><h2 className="saved-heading">Developers <span>{savedMembers.length}</span></h2>{savedMembers.length ? <div className="people-grid">{savedMembers.map((person, i) => <PersonCard key={person.id ?? person.name} person={person} index={i} />)}</div> : <p className="muted-small">No saved developers yet. <Link to="/developers">Explore the directory.</Link></p>}<h2 className="saved-heading">Posts <span>{savedPosts.length}</span></h2>{savedPosts.length ? <div className="profile-posts">{savedPosts.map(post => <article className="community-post" key={post.id}><div><span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span><h3>{post.title}</h3><p>{post.body}</p><small>By {post.authorName}</small></div><button className="save-person is-saved" aria-label="Remove saved post" onClick={() => toggleSavedPost(post.id)}><Bookmark size={15} fill="currentColor" /></button></article>)}</div> : <p className="muted-small">No saved posts yet. Bookmark a post from a developer’s profile.</p>}</main><Footer /></>
}

export default function App() {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('devdirectory:saved') ?? '[]') as string[] } catch { return [] }
  })
  const [savedPostIds, setSavedPostIds] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('devdirectory:saved-posts') ?? '[]') as string[] } catch { return [] } })
  const [posts, setPosts] = useState<CommunityPost[]>(() => { try { return JSON.parse(localStorage.getItem('devdirectory:posts') ?? '[]') as CommunityPost[] } catch { return [] } })
  const toggleSaved = (id: string) => {
    const next = savedIds.includes(id) ? savedIds.filter(saved => saved !== id) : [...savedIds, id]
    setSavedIds(next)
    try { localStorage.setItem('devdirectory:saved', JSON.stringify(next)) } catch { /* Saved state remains available until this page closes. */ }
  }
  const toggleSavedPost = (id: string) => { const next = savedPostIds.includes(id) ? savedPostIds.filter(saved => saved !== id) : [...savedPostIds, id]; setSavedPostIds(next); try { localStorage.setItem('devdirectory:saved-posts', JSON.stringify(next)) } catch { /* Saved state remains for this session. */ } }
  const mergePosts = useCallback((incoming: CommunityPost[]) => { setPosts(current => { const merged = [...incoming, ...current.filter(post => !incoming.some(item => item.id === post.id))]; try { localStorage.setItem('devdirectory:posts', JSON.stringify(merged)) } catch { /* Posts remain available from this session. */ } return merged }) }, [])
  const createPost = (post: CommunityPost) => mergePosts([post])
  return <SavedContext.Provider value={{ savedIds, savedPostIds, posts, toggleSaved, toggleSavedPost, createPost, mergePosts }}><MotionObserver /><Routes><Route path="/" element={<Landing />} /><Route path="/users" element={<Directory />} /><Route path="/users/:id" element={<Profile />} /><Route path="/add-post" element={<ProtectedRoute><><Header /><AddPost /><Footer /></></ProtectedRoute>} /><Route path="/developers" element={<Directory />} /><Route path="/developers/:slug" element={<Profile />} /><Route path="/saved" element={<SavedItems />} /><Route path="/how-it-works" element={<><Header /><HowItWorks /><Footer /></>} /><Route path="/teams" element={<><Header /><ForTeams /><Footer /></>} /><Route path="/login" element={<><Header /><LabLogin /><Footer /></>} /><Route path="/dashboard" element={<><Header /><Dashboard /><Footer /></>} />{['about', 'contact', 'privacy', 'terms'].map(path => <Route key={path} path={`/${path}`} element={<><Header /><InfoPage /><Footer /></>} />)}<Route path="*" element={<><Header /><NotFound /><Footer /></>} /></Routes></SavedContext.Provider>
}
