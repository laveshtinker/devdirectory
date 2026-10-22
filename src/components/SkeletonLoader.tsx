export default function SkeletonLoader({ rows = 4, label = 'Loading content' }: { rows?: number; label?: string }) {
  return <div className="api-skeleton-list" role="status" aria-label={label}>
    {Array.from({ length: rows }, (_, index) => <div className="api-skeleton" key={index}><span /><div><i /><i /><i /></div></div>)}
  </div>
}
