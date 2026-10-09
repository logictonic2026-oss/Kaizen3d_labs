import { useEffect, useId, useRef, useState } from 'react'

export default function ModelPreview({ src, poster }) {
  const viewerRef = useRef(null)
  const viewerId = useId()
  const [viewerReady, setViewerReady] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('Loading 3D preview...')

  useEffect(() => {
    let active = true
    // Bundle the viewer with the site instead of relying on a CDN at runtime.
    import('@google/model-viewer').then(() => {
      if (active) setViewerReady(true)
    }).catch(() => {
      if (active) {
        setStatus('error')
        setMessage('The 3D viewer could not start. Please retry or download your model below.')
      }
    })
    return () => { active = false }
  }, [attempt])

  useEffect(() => {
    if (!src) {
      setStatus('error')
      setMessage('No GLB preview file was returned. You can still download the available formats below.')
      return
    }
    const viewer = viewerRef.current
    if (!viewerReady || !viewer) return

    setStatus('loading')
    setMessage('Loading 3D preview...')
    const timeout = window.setTimeout(() => {
      setStatus('error')
      setMessage('The preview is taking too long to load. Please retry or download your model below.')
    }, 60000)
    const onLoad = () => {
      window.clearTimeout(timeout)
      setStatus('ready')
    }
    const onError = (event) => {
      window.clearTimeout(timeout)
      setStatus('error')
      setMessage(event.detail?.type === 'webgl-context-lost'
        ? '3D rendering is unavailable in this browser. Try reloading or download your model below.'
        : 'The model could not be loaded. Its link may have expired or be blocked. Please retry or download a file below.')
    }
    viewer.addEventListener('load', onLoad)
    viewer.addEventListener('error', onError)
    // Attach listeners before starting the model request, including cached loads.
    const modelUrl = new URL(src, document.baseURI)
    // A new fragment bypasses the viewer's failed-load cache without changing
    // the signed query string or the URL requested from the file server.
    modelUrl.hash = `preview-${viewerId}-${attempt}`
    viewer.src = modelUrl.href

    return () => {
      window.clearTimeout(timeout)
      viewer.removeEventListener('load', onLoad)
      viewer.removeEventListener('error', onError)
    }
  }, [viewerReady, viewerId, src, attempt])

  const retry = () => {
    setStatus('loading')
    setMessage('Loading 3D preview...')
    setAttempt(value => value + 1)
  }

  return (
    <div style={{
      width: '100%', height: 400, background: '#e5e7eb', borderRadius: 16,
      overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
      marginBottom: '1.5rem', position: 'relative',
    }}>
      {viewerReady && src && (
        <model-viewer
          key={attempt}
          ref={viewerRef}
          alt="Your generated 3D model"
          poster={poster || undefined}
          camera-controls
          auto-rotate
          ar
          touch-action="pan-y"
          loading="eager"
          reveal="auto"
          environment-image="neutral"
          camera-target="auto auto auto"
          camera-orbit="0deg 75deg 105%"
          shadow-intensity="1"
          exposure="1"
          style={{ width: '100%', height: '100%', display: 'block', backgroundColor: '#e5e7eb' }}
        />
      )}
      {status !== 'ready' && (
        <div role={status === 'error' ? 'alert' : 'status'} aria-live="polite" style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16, padding: '1.5rem',
          color: '#111827', background: 'rgba(229,231,235,0.9)', textAlign: 'center',
        }}>
          <p style={{ margin: 0 }}>{message}</p>
          {status === 'error' && src && (
            <button type="button" onClick={retry} style={{
              padding: '0.65rem 1.25rem', borderRadius: 8, border: 'none',
              background: '#3A6FF7', color: '#fff', fontWeight: 600, cursor: 'pointer',
            }}>Retry preview</button>
          )}
        </div>
      )}
    </div>
  )
}
