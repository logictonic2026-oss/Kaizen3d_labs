import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../supabase'

const BUCKET = 'product-images'

const CATEGORIES = [
  { slug: 'car-dashboard-idol', label: 'Car Dashboard Idol' },
  { slug: 'divine-idols',       label: 'Divine Idols'       },
  { slug: 'gifting-elements',   label: 'Gifting Elements'   },
  { slug: 'custom-products',    label: 'Custom Products'    },
]

const DEFAULT_FORM = {
  slug: '', name: '', subtitle: '', description: '',
  price: '', original_price: '', discount_label: '',
  category: 'divine-idols', tag: '', is_active: true,
  images: [], image_labels: [],
}

// Bucket check removed — bucket must be created manually in Supabase Dashboard

// ── Image Uploader ────────────────────────────────────────────────────────────
function ImageUploader({ images, imageLabels, onChange, onLabelChange, onRemove, onReorder }) {
  const [uploading,  setUploading]  = useState(false)
  const [uploadErr,  setUploadErr]  = useState('')
  const [dragging,   setDragging]   = useState(false)
  // localPreviews: { file, localUrl, status: 'pending'|'uploading'|'done'|'error', remoteUrl?, error? }
  const [previews,   setPreviews]   = useState([])
  const inputRef = useRef()

  const uploadFiles = async (files) => {
    setUploadErr('')
    const validFiles = Array.from(files).filter(f => {
      if (!f.type.startsWith('image/')) { setUploadErr('Only image files allowed.'); return false }
      if (f.size > 5 * 1024 * 1024)    { setUploadErr('Max file size is 5 MB.');    return false }
      return true
    })
    if (!validFiles.length) return

    // 1. Instantly add local previews
    const newPreviews = validFiles.map(f => ({
      file: f,
      localUrl: URL.createObjectURL(f),
      status: 'pending',
    }))
    setPreviews(prev => [...prev, ...newPreviews])
    setUploading(true)

    // 2. Upload each file
    const newUrls   = []
    const newLabels = []

    for (const preview of newPreviews) {
      // Mark as uploading
      setPreviews(prev => prev.map(p => p.localUrl === preview.localUrl ? { ...p, status: 'uploading' } : p))

      const ext      = preview.file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, preview.file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setPreviews(prev => prev.map(p =>
          p.localUrl === preview.localUrl ? { ...p, status: 'error', error: uploadError.message } : p
        ))
        setUploadErr(`Upload failed: ${uploadError.message}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName)

      // Mark as done
      setPreviews(prev => prev.map(p =>
        p.localUrl === preview.localUrl ? { ...p, status: 'done', remoteUrl: publicUrl } : p
      ))
      newUrls.push(publicUrl)
      newLabels.push('Product')
    }

    onChange([...images, ...newUrls])
    onLabelChange([...imageLabels, ...newLabels])
    setUploading(false)
  }

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); uploadFiles(e.dataTransfer.files) }
  const handleFileInput = (e) => { uploadFiles(e.target.files); e.target.value = '' }

  const moveLeft  = (i) => {
    if (i === 0) return
    const imgs = [...images]; const lbls = [...imageLabels]
    ;[imgs[i-1], imgs[i]] = [imgs[i], imgs[i-1]]; [lbls[i-1], lbls[i]] = [lbls[i], lbls[i-1]]
    onReorder(imgs, lbls)
  }
  const moveRight = (i) => {
    if (i === images.length - 1) return
    const imgs = [...images]; const lbls = [...imageLabels]
    ;[imgs[i+1], imgs[i]] = [imgs[i], imgs[i+1]]; [lbls[i+1], lbls[i]] = [lbls[i], lbls[i+1]]
    onReorder(imgs, lbls)
  }

  // Pending local previews (not yet uploaded or errored) shown separately
  const pendingPreviews = previews.filter(p => p.status === 'pending' || p.status === 'uploading' || p.status === 'error')

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 14, padding: '2rem', textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragging ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s', marginBottom: '1.25rem',
        }}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFileInput} style={{ display: 'none' }} />
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📁</div>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
          <strong style={{ color: '#818cf8' }}>Click to upload</strong> or drag & drop images here
        </p>
        <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          PNG, JPG, WEBP — max 5 MB each — multiple files supported
        </p>
      </div>

      {/* Error */}
      {uploadErr && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem',
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
          color: '#ef4444', fontSize: '0.8rem', lineHeight: 1.6,
        }}>
          ⚠ {uploadErr}
        </div>
      )}

      {/* Pending / Uploading / Error previews (local blobs) */}
      {pendingPreviews.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
            Uploading…
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {pendingPreviews.map((p, i) => (
              <div key={i} style={{
                width: 110, borderRadius: 12, overflow: 'hidden',
                background: '#1e1e2e', border: `1px solid ${p.status === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.3)'}`,
                position: 'relative',
              }}>
                <div style={{ height: 90, overflow: 'hidden', position: 'relative' }}>
                  <img src={p.localUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: p.status === 'uploading' ? 0.5 : 1 }} />
                  {p.status === 'uploading' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                      <div style={{ width: 22, height: 22, border: '2px solid rgba(255,255,255,0.2)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    </div>
                  )}
                  {p.status === 'error' && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.6)' }}>
                      <span style={{ color: '#fff', fontSize: '1.25rem' }}>✕</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: '0.35rem 0.5rem', fontSize: '0.65rem', color: p.status === 'error' ? '#ef4444' : '#818cf8', textAlign: 'center' }}>
                  {p.status === 'error' ? (p.error || 'Failed') : 'Uploading…'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded images grid */}
      {images.length > 0 && (
        <div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Uploaded — {images.length} image{images.length !== 1 ? 's' : ''} &nbsp;
            <span style={{ color: '#475569', textTransform: 'none', letterSpacing: 'normal' }}>· First image = main thumbnail</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {images.map((url, i) => (
              <div key={i} style={{
                width: 130, borderRadius: 12, overflow: 'hidden',
                background: '#1e1e2e',
                border: i === 0 ? '2px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.08)',
                position: 'relative',
              }}>
                {/* Main badge */}
                {i === 0 && (
                  <div style={{
                    position: 'absolute', top: 6, left: 6, zIndex: 2,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', fontSize: '0.6rem', fontWeight: 800,
                    padding: '2px 7px', borderRadius: 4, letterSpacing: '0.06em',
                  }}>MAIN</div>
                )}

                {/* Image */}
                <div style={{ height: 100, overflow: 'hidden' }}>
                  <img
                    src={url}
                    alt={`Product image ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Label */}
                <input
                  type="text"
                  value={imageLabels[i] || ''}
                  onChange={e => { const l = [...imageLabels]; l[i] = e.target.value; onLabelChange(l) }}
                  placeholder="Label (optional)"
                  style={{
                    width: '100%', padding: '0.35rem 0.5rem', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.03)', border: 'none',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    color: '#94a3b8', fontSize: '0.7rem', outline: 'none',
                  }}
                />

                {/* Reorder + Remove */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
                  <button onClick={() => moveLeft(i)}  disabled={i === 0}                 style={iconBtn(i === 0)}                  title="Move left">←</button>
                  <button onClick={() => onRemove(i)}                                      style={{ ...iconBtn(false), color: '#ef4444' }} title="Remove">✕</button>
                  <button onClick={() => moveRight(i)} disabled={i === images.length - 1} style={iconBtn(i === images.length - 1)} title="Move right">→</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && pendingPreviews.length === 0 && (
        <p style={{ color: '#334155', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          💡 You can upload multiple images at once. Drag to reorder — first image becomes the main thumbnail.
        </p>
      )}
    </div>
  )
}

const iconBtn = (disabled) => ({
  background: 'none', border: 'none',
  color: disabled ? '#1e293b' : '#64748b',
  cursor: disabled ? 'default' : 'pointer',
  fontSize: '0.85rem', padding: '2px 6px', borderRadius: 4,
  transition: 'color 0.15s',
})

// ── Field wrapper ─────────────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.8rem', fontWeight: 700,
        color: '#94a3b8', marginBottom: '0.4rem',
        letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {label}
        {hint && (
          <span style={{ fontWeight: 400, textTransform: 'none', color: '#475569', marginLeft: '0.5rem', letterSpacing: 'normal' }}>
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: 10, boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
  color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
}

const onFocusIn  = e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'
const onFocusOut = e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function AdminProductForm() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const isEdit   = Boolean(id)

  const [form,    setForm]    = useState(DEFAULT_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  // Auto slug from name (only in create mode)
  const handleNameChange = (val) => {
    setForm(f => ({
      ...f,
      name: val,
      slug: isEdit ? f.slug : val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    }))
  }

  // Load existing product for edit
  useEffect(() => {
    if (!isEdit) return
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          slug:           data.slug || '',
          name:           data.name || '',
          subtitle:       data.subtitle || '',
          description:    data.description || '',
          price:          String(data.price || ''),
          original_price: String(data.original_price || ''),
          discount_label: data.discount_label || '',
          category:       data.category || 'divine-idols',
          tag:            data.tag || '',
          is_active:      data.is_active ?? true,
          images:         Array.isArray(data.images) ? data.images : [],
          image_labels:   Array.isArray(data.image_labels) ? data.image_labels : [],
        })
      }
      setLoading(false)
    })
  }, [id])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target?.value ?? e }))

  const handleSave = async () => {
    setError('')
    if (!form.name.trim())  return setError('Product name is required.')
    if (!form.slug.trim())  return setError('Slug is required.')
    if (!form.price)        return setError('Sale price is required.')

    const origPrice = form.original_price ? parseFloat(form.original_price) : null
    const salePrice = parseFloat(form.price)

    if (origPrice && origPrice <= salePrice) {
      return setError('Original price (MRP) must be higher than the sale price for a valid discount.')
    }

    setSaving(true)
    const payload = {
      slug:           form.slug.trim(),
      name:           form.name.trim(),
      subtitle:       form.subtitle.trim(),
      description:    form.description.trim(),
      price:          salePrice,
      original_price: origPrice,
      discount_label: form.discount_label.trim() || null,
      category:       form.category,
      tag:            form.tag.trim(),
      is_active:      form.is_active,
      images:         form.images,
      image_labels:   form.image_labels,
    }

    let err
    if (isEdit) {
      ({ error: err } = await supabase.from('products').update(payload).eq('id', id))
    } else {
      ({ error: err } = await supabase.from('products').insert([payload]))
    }

    setSaving(false)
    if (err) { setError(err.message); return }
    navigate('/admin/products')
  }

  // Computed discount % for live preview
  const discountPct = form.original_price && form.price && parseFloat(form.original_price) > parseFloat(form.price)
    ? Math.round((1 - parseFloat(form.price) / parseFloat(form.original_price)) * 100)
    : null

  if (loading) {
    return (
      <AdminLayout title={isEdit ? 'Edit Product' : 'Add New Product'}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(99,102,241,0.2)', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Product' : 'Add New Product'}>
      <div style={{ maxWidth: 780, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/admin/products')}
          style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          ← Back to Products
        </button>

        {/* ── Basic Info ── */}
        <section style={card}>
          <SectionTitle>Basic Information</SectionTitle>
          <div style={grid2}>
            <Field label="Product Name">
              <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="Lord Ganesha" style={inputStyle} onFocus={onFocusIn} onBlur={onFocusOut} />
            </Field>
            <Field label="Slug" hint="(URL key — auto-generated)">
              <input type="text" value={form.slug} onChange={set('slug')} placeholder="lord-ganesha" style={inputStyle} onFocus={onFocusIn} onBlur={onFocusOut} />
            </Field>
          </div>
          <div style={grid2}>
            <Field label="Subtitle" hint="(shown under name)">
              <input type="text" value={form.subtitle} onChange={set('subtitle')} placeholder="Car Dashboard Idol" style={inputStyle} onFocus={onFocusIn} onBlur={onFocusOut} />
            </Field>
            <Field label="Tag" hint="(badge on card)">
              <input type="text" value={form.tag} onChange={set('tag')} placeholder="Best Seller" style={inputStyle} onFocus={onFocusIn} onBlur={onFocusOut} />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={set('description')} placeholder="Describe the product — material, size, features…" rows={4} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={onFocusIn} onBlur={onFocusOut} />
          </Field>
        </section>

        {/* ── Pricing & Category ── */}
        <section style={card}>
          <SectionTitle>Pricing & Category</SectionTitle>

          <div style={grid2}>
            <Field label="Sale Price (₹)" hint="— what the customer pays">
              <input type="number" value={form.price} onChange={set('price')} placeholder="999" min="0" style={inputStyle} onFocus={onFocusIn} onBlur={onFocusOut} />
            </Field>
            <Field label="Original MRP (₹)" hint="— optional, for strike-through">
              <input type="number" value={form.original_price} onChange={set('original_price')} placeholder="1499 (optional)" min="0" style={inputStyle} onFocus={onFocusIn} onBlur={onFocusOut} />
            </Field>
          </div>

          {/* Discount label */}
          <div style={grid2}>
            <Field label="Discount Label" hint="— shown as badge (e.g. 20% OFF)">
              <input
                type="text"
                value={form.discount_label}
                onChange={set('discount_label')}
                placeholder={discountPct ? `${discountPct}% OFF` : 'e.g. 20% OFF or SALE'}
                style={inputStyle}
                onFocus={onFocusIn}
                onBlur={onFocusOut}
              />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={set('category')} style={{ ...inputStyle, cursor: 'pointer' }}>
                {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Live discount preview */}
          {discountPct && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem',
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 12,
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', textDecoration: 'line-through' }}>₹{parseFloat(form.original_price).toLocaleString('en-IN')}</span>
                {'  '}
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0' }}>₹{parseFloat(form.price).toLocaleString('en-IN')}</span>
              </div>
              <span style={{
                background: '#22c55e', color: '#fff', fontWeight: 800,
                fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6,
              }}>
                {form.discount_label || `${discountPct}% OFF`}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#4ade80' }}>← how it will look in the shop</span>
            </div>
          )}

          {/* Visibility toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none',
                background: form.is_active ? '#22c55e' : '#374151',
                cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: form.is_active ? 22 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.25s', display: 'block',
              }} />
            </button>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e2e8f0' }}>
                {form.is_active ? 'Visible in Shop' : 'Hidden from Shop'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Toggle to show or hide this product
              </div>
            </div>
          </div>
        </section>

        {/* ── Images ── */}
        <section style={card}>
          <SectionTitle>Product Images</SectionTitle>
          <ImageUploader
            images={form.images}
            imageLabels={form.image_labels}
            onChange={imgs  => setForm(f => ({ ...f, images: imgs }))}
            onLabelChange={lbls => setForm(f => ({ ...f, image_labels: lbls }))}
            onRemove={idx  => setForm(f => ({
              ...f,
              images:       f.images.filter((_,i) => i !== idx),
              image_labels: f.image_labels.filter((_,i) => i !== idx),
            }))}
            onReorder={(imgs, lbls) => setForm(f => ({ ...f, images: imgs, image_labels: lbls }))}
          />
        </section>

        {/* Error */}
        {error && (
          <div style={{ padding: '0.875rem 1rem', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.875rem', lineHeight: 1.5 }}>
            ⚠ {error}
          </div>
        )}

        {/* Save */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.875rem 2rem', borderRadius: 12, border: 'none',
              background: saving ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontSize: '0.9rem', fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 20px rgba(99,102,241,0.3)', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}
          >
            {saving ? (
              <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />Saving…</>
            ) : (isEdit ? '✓ Save Changes' : '+ Create Product')}
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            style={{ padding: '0.875rem 1.5rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  )
}

// ── Tiny style helpers ────────────────────────────────────────────────────────
const card = {
  background: '#111118', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem',
}
const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }

function SectionTitle({ children }) {
  return (
    <h2 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {children}
    </h2>
  )
}
