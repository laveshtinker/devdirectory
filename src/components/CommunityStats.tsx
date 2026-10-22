import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { publicDirectoryStats } from '../data/developers'

export default function CommunityStats() {
  return <section className="metrics-band api-community-stats" aria-label="Public directory overview" data-reveal>
    <div className="metrics-inner page-shell">
      <div className="metrics-intro">
        <span className="eyebrow"><span className="eyebrow-line" /> PUBLIC PROFILE INDEX</span>
        <p>A growing reference for<br />people and their work.</p>
        <div className="api-stats-links"><Link to="/developers">Browse developers <ArrowUpRight size={14} /></Link><Link to="/saved">Open your shortlist <ArrowUpRight size={14} /></Link></div>
      </div>
      <Link className="metric api-stat-link" to="/developers"><strong>{publicDirectoryStats.profiles}</strong><small>PUBLIC PROFILES <ArrowUpRight size={12} /></small></Link>
      <Link className="metric api-stat-link" to="/developers"><strong>{publicDirectoryStats.githubLinks}</strong><small>GITHUB LINKS <ArrowUpRight size={12} /></small></Link>
      <Link className="metric api-stat-link" to="/developers"><strong>{publicDirectoryStats.organizations}</strong><small>ORGANIZATIONS LISTED <ArrowUpRight size={12} /></small></Link>
      <p className="metrics-note">Public examples for discovery. These are not DevDirectory members.</p>
    </div>
  </section>
}
