import { useState } from 'react'
import { ArrowUpRight, Code2, Menu, X } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Brand() {
  return <Link to="/" className="brand" aria-label="DevDirectory home"><span className="brand-mark"><Code2 size={17} strokeWidth={1.85} /><i className="brand-mark-dot" /></span><span className="brand-wordmark"><span className="brand-wordmark-dev">Dev</span><span className="brand-wordmark-directory">Directory</span><span className="brand-period">.</span></span></Link>
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, logout } = useAuth()
  return <header className="topbar"><div className="topbar-inner"><Brand /><nav className={open ? 'nav-links nav-open' : 'nav-links'} aria-label="Main navigation"><NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink><NavLink to="/developers" onClick={() => setOpen(false)}>Developers</NavLink><NavLink to="/saved" onClick={() => setOpen(false)}>Saved items</NavLink><NavLink to="/dashboard" onClick={() => setOpen(false)}>Dashboard</NavLink><NavLink to="/add-post" onClick={() => setOpen(false)}>New article</NavLink><NavLink to="/how-it-works" onClick={() => setOpen(false)}>Workflow guide</NavLink><NavLink to="/teams" onClick={() => setOpen(false)}>Team tools</NavLink></nav><div className="nav-actions">{isAuthenticated ? <button className="nav-login nav-logout" onClick={() => { logout(); navigate('/') }}>Log out</button> : <Link className="nav-login" to="/login">Log in</Link>}<Link to="/developers" className="button button-small">Browse developers <ArrowUpRight size={14} /></Link></div><button className="menu-toggle" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div></header>
}
