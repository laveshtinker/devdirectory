import { ArrowRight, Bookmark, Code2, Search, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const steps = [
  { number: '01', icon: Search, title: 'Find people by what they do', description: 'Search the directory by name, company, location, or skill. Sort the results and narrow the list until it fits your brief.', action: 'Open the directory', to: '/developers' },
  { number: '02', icon: Code2, title: 'Review their public work', description: 'Open a profile to read its bio, skills, contact links, and community posts. Follow the GitHub or personal website link to inspect work at its source.', action: 'Browse profiles', to: '/developers' },
  { number: '03', icon: Bookmark, title: 'Save a shortlist', description: 'Bookmark developers and posts as you go. Your saved list stays in this browser and is ready to review from the Saved page.', action: 'View saved items', to: '/saved' },
  { number: '04', icon: Share2, title: 'Share the brief with your team', description: 'The team page turns your saved items into a Markdown brief you can download and share in your team’s usual tools.', action: 'Open team tools', to: '/teams' },
]

export default function HowItWorks() {
  return <main className="directory page-shell workflow-page" data-reveal>
    <div className="eyebrow"><span className="eyebrow-line" /> A PRACTICAL GUIDE</div>
    <h1>From discovery to <span>shortlist.</span></h1>
    <p className="directory-intro">A simple workflow for finding people, checking their work, and bringing useful profiles back to your team.</p>
    <div className="workflow-steps">{steps.map(({ number, icon: Icon, title, description, action, to }) => <article className="workflow-step" key={number}>
      <span className="workflow-step-number">{number}</span><span className="workflow-step-icon"><Icon size={18} /></span>
      <div><h2>{title}</h2><p>{description}</p><Link className="text-link" to={to}>{action} <ArrowRight size={14} /></Link></div>
    </article>)}</div>
    <p className="workflow-note">Developer examples are public references. Saved items live in this browser unless you export them for your team.</p>
  </main>
}
