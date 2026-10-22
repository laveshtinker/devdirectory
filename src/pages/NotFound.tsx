import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return <main className="directory page-shell not-found" data-reveal><div className="not-found-code">404</div><h1>Page not <span>found.</span></h1><p>That address doesn’t lead anywhere in the directory.</p><Link to="/" className="button">Return home <ArrowRight size={15} /></Link></main>
}
