import { useState, type FormEvent } from 'react'
import { ArrowRight, Code2, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { credentialsSchema } from './lib/validation'
import { useAuth } from './context/AuthContext'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [attempted, setAttempted] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const returnLocation = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from
  const returnTo = returnLocation ? `${returnLocation.pathname ?? '/add-post'}${returnLocation.search ?? ''}${returnLocation.hash ?? ''}` : '/'

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAttempted(true)
    const validated = credentialsSchema.safeParse({ email, password })
    if (!validated.success) { setError(validated.error.issues[0]?.message ?? 'Enter a valid email and password.'); return }
    const normalizedEmail = validated.data.email
    login({ id: `demo-${normalizedEmail}`, name: normalizedEmail.split('@')[0] || 'Developer', email: normalizedEmail })
    navigate(returnTo, { replace: true })
  }

  return <main className="auth-page page-shell">
    <aside className="auth-story" aria-label="About DevDirectory">
      <div className="eyebrow"><span className="eyebrow-line" /> PEOPLE MAKE THE PRODUCT</div>
      <h2>Good work starts<br /><span>with good people.</span></h2>
      <p>A thoughtful space to discover the developers, ideas, and work shaping your team.</p>
      <div className="auth-art" aria-hidden="true"><span className="auth-art-ring auth-art-ring-one" /><span className="auth-art-ring auth-art-ring-two" /><span className="auth-art-ring auth-art-ring-three" /><span className="auth-art-core"><Code2 size={26} /></span><span className="auth-art-node auth-art-node-one"><Sparkles size={14} /></span><span className="auth-art-node auth-art-node-two" /><span className="auth-art-index">DD / 01</span></div>
      <div className="auth-story-caption"><span>DISCOVER</span><i /><span>CONNECT</span><i /><span>SHARE</span></div>
    </aside>
    <section className="auth-card" aria-labelledby="login-heading">
      <div className="eyebrow"><span className="eyebrow-line" /> THE PEOPLE BEHIND THE PRODUCT</div>
      <h1 id="login-heading">Good to see you.</h1>
      <p className="auth-intro">Sign in to continue to your engineering workspace. This lab project uses a simulated session.</p>
      <form className="auth-form" onSubmit={submit} noValidate>
        <label htmlFor="login-email">Email address<input id="login-email" type="email" autoComplete="email" value={email} onChange={event => { setEmail(event.target.value); setError('') }} aria-invalid={attempted && (!email.trim() || !email.includes('@'))} aria-describedby={error ? 'login-error' : undefined} placeholder="you@company.com" /></label>
        <label htmlFor="login-password">Password<div className="password-field"><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={event => { setPassword(event.target.value); setError('') }} aria-invalid={attempted && password.length < 8} aria-describedby={error ? 'login-error' : undefined} placeholder="At least 8 characters" /><button type="button" className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
        {error && <p className="form-feedback form-error" id="login-error" role="alert">{error}</p>}
        <button className="button auth-submit" type="submit">Sign in <ArrowRight size={16} /></button>
      </form>
      <p className="field-hint">Credentials are not verified by an authentication service.</p>
      <div className="auth-switch"><span>Want to look around first?</span><Link to="/developers">Browse the community</Link></div>
      <Link to="/" className="text-link auth-back">Back to home <ArrowRight size={14} /></Link>
    </section>
  </main>
}
