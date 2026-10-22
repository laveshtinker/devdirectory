import { AlertCircle, RotateCw, X } from 'lucide-react'

export default function AlertBanner({ message, onRetry, onDismiss }: { message: string; onRetry?: () => void; onDismiss?: () => void }) {
  return <div className="api-alert" role="alert"><AlertCircle size={18} /><p>{message}</p>{onRetry && <button className="api-alert-retry" onClick={onRetry}><RotateCw size={14} /> Retry</button>}{onDismiss && <button className="api-alert-dismiss" aria-label="Dismiss error" onClick={onDismiss}><X size={16} /></button>}</div>
}
