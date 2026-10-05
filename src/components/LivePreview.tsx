import type { CSSProperties, ReactNode } from 'react'

/** A quiet browser viewport that hosts real, running React components. */
export function LivePreview({ children, url = 'localhost:5173', style, className }: { children: ReactNode; url?: string; style?: CSSProperties; className?: string }) {
  return (
    <div className={`live-preview ${className ?? ''}`} style={style}>
      <div className="live-preview-bar">
        <span className="live-preview-url">{url}</span>
      </div>
      <div className="live-preview-body">{children}</div>
    </div>
  )
}
