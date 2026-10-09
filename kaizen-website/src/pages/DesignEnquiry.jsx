import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../supabase'
import ModelPreview from '../components/ModelPreview'

/* ── helpers ────────────────────────────────────────────────── */
async function toGenerationImage(file) {
  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, 2048 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d')
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    // Keep the JSON upload below Vercel's request limit and normalize WEBP etc.
    for (const quality of [0.9, 0.8, 0.7, 0.6]) {
      const data = canvas.toDataURL('image/jpeg', quality)
      if (data.length <= 3_800_000) return data
    }
    throw new Error('Please use a smaller reference image for 3D generation.')
  } finally {
    bitmap.close()
  }
}

const INITIAL = {
  name: '', companyName: '', email: '', phone: '',
  address: '', city: '', pincode: '', country: '',
  description: '',
}

/* ── component ──────────────────────────────────────────────── */
export default function DesignEnquiry() {
  const [form,     setForm]     = useState(INITIAL)
  const [images,   setImages]   = useState([])   
  const [dragOver, setDragOver] = useState(false)
  
  // idle | submitting | polling | success | error
  const [status,   setStatus]   = useState('idle') 
  
  const [modal,    setModal]    = useState(null)    // null | '3d_model' | 'enquire'
  const [errMsg,   setErrMsg]   = useState('')
  const [pollingInfo, setPollingInfo] = useState(null)
  const [generatedModel, setGeneratedModel] = useState(null)
  const [modelThumbnail, setModelThumbnail] = useState(null)

  const fileRef = useRef()
  const pollRef = useRef(null)
  useEffect(() => () => clearInterval(pollRef.current), [])

  /* form change */
  const change = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  /* image handling */
  const addImages = useCallback((files) => {
    const allowed = Array.from(files)
      .filter(f => {
        if (!f.type.startsWith('image/')) return false;
        if (f.size > 5 * 1024 * 1024) {
          setErrMsg(`Image ${f.name} exceeds 5MB limit.`);
          setStatus('error');
          return false;
        }
        return true;
      })
      .slice(0, 5 - images.length)
    const previews = allowed.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setImages(p => [...p, ...previews].slice(0, 5))
  }, [images.length])

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    addImages(e.dataTransfer.files)
  }
  const handleFileChange = (e) => addImages(e.target.files)
  const removeImage = (idx) => {
    setImages(p => { URL.revokeObjectURL(p[idx].preview); return p.filter((_, i) => i !== idx) })
  }

  /* submit handler */
  const submit = async (type) => {
    if (!form.name || !form.email || !form.phone) return
    if (type === '3d_model' && images.length === 0) {
      setErrMsg("Please upload at least one reference image to generate a 3D model.");
      setStatus('error');
      return;
    }

    if (type === '3d_model') setModal('loading');
    setStatus('submitting'); setErrMsg(''); setPollingInfo(null); setGeneratedModel(null);
    setModelThumbnail(null)
    try {
      // 0. Prevent duplicate free generations based on Email, Phone, or Browser Memory
      if (type === '3d_model') {
        if (localStorage.getItem('kaizen_3d_generated')) {
          setErrMsg("You have already used your 1 free 3D generation from this browser. If you need a custom design, please click 'Enquire Only'.");
          setStatus('error');
          setModal(null);
          return;
        }

        const { data: hasUsed, error: checkErr } = await supabase.rpc('has_used_free_generation', {
          user_email: form.email,
          user_phone: form.phone
        });

        if (checkErr) {
          console.error("RPC Error:", checkErr);
          // Fallback if the RPC isn't created yet, we allow it but log error
        } else if (hasUsed) {
          localStorage.setItem('kaizen_3d_generated', 'true'); // Sync browser memory
          setErrMsg("You have already used your 1 free 3D generation. If you need a custom design, please click 'Enquire Only'.");
          setStatus('error');
          setModal(null);
          return;
        }
      }

      // 1. Save to Supabase
      const payload = {
        request_type: type === '3d_model' ? '3D Model Generation (Meshy)' : 'Design Enquiry',
        name:        form.name,
        company_name:form.companyName,
        email:       form.email,
        phone:       form.phone,
        address:     form.address,
        city:        form.city,
        pincode:     form.pincode,
        country:     form.country,
        description: form.description
      }

      const { error } = await supabase.from('design_enquiries').insert([payload])
      if (error) throw error

      // 2. Meshy Workflow
      if (type === '3d_model') {
        // Create Task using the FIRST image
        const createRes = await fetch('/api/meshy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image_url: await toGenerationImage(images[0].file),
          })
        })
        
        if (!createRes.ok) {
          const errData = await createRes.json()
          throw new Error(errData.message || 'Failed to start Meshy task')
        }
        
        const { result: taskId } = await createRes.json()
        
        setStatus('polling')
        setPollingInfo({ progress: 0, status: 'PENDING' })

        // Poll Task every 5 seconds
        const poll = setInterval(async () => {
          try {
            const pollRes = await fetch(`/api/meshy?task=${encodeURIComponent(taskId)}`)
            const pollData = await pollRes.json()
            if (!pollRes.ok) throw new Error(pollData.message || 'Unable to check model generation status')
            
            if (pollData.status === 'SUCCEEDED') {
              clearInterval(poll)
              setGeneratedModel(pollData.model_urls || {})
              setModelThumbnail(pollData.thumbnail_url || null)
              setStatus('success')
              setModal('3d_model')
              localStorage.setItem('kaizen_3d_generated', 'true') // Set browser memory flag
              setForm(INITIAL)
              setImages([])
            } else if (pollData.status === 'FAILED') {
              clearInterval(poll)
              throw new Error(pollData.task_error?.message || 'Meshy 3D generation failed')
            } else {
              setPollingInfo({ progress: pollData.progress || 0, status: pollData.status })
            }
          } catch (e) {
            clearInterval(poll)
            setStatus('error')
            setErrMsg(e.message)
            setModal(null)
          }
        }, 5000)
        pollRef.current = poll

      } else {
        // Regular Enquiry flow - Send Email Notification
        const web3Key = import.meta.env.VITE_WEB3FORMS_KEY;
        if (web3Key) {
          const formData = new FormData();
          formData.append('access_key', web3Key);
          formData.append('subject', `New Design Enquiry from ${form.name}`);
          formData.append('from_name', "Kaizen 3D Labs");
          formData.append('Name', form.name);
          formData.append('Company Name', form.companyName || 'N/A');
          formData.append('Email', form.email);
          formData.append('Phone', form.phone);
          formData.append('Address', form.address || 'N/A');
          formData.append('City', form.city || 'N/A');
          formData.append('Pincode', form.pincode || 'N/A');
          formData.append('Country', form.country || 'N/A');
          formData.append('Description', form.description || 'No description provided.');
          
          // Attach images
          images.forEach((img, i) => {
            formData.append(`Attachment_${i+1}`, img.file);
          });

          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
          }).catch(e => console.error("Email send failed:", e));
        }

        setStatus('success')
        setModal('enquire')
        setForm(INITIAL)
        setImages([])
      }
    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrMsg(err.message)
      setModal(null)
    }
  }

  const closeModal = () => { setModal(null); setStatus('idle') }

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--matte-black)', paddingTop: '100px', paddingBottom: '6rem' }}>

      {/* ── Success Modal ── */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
            }}
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#111', border: '1px solid rgba(58,111,247,0.3)',
                borderRadius: 20, padding: '2rem', maxWidth: modal === '3d_model' ? 800 : 460, width: '100%',
                textAlign: 'center', boxShadow: '0 0 80px rgba(58,111,247,0.2)',
                maxHeight: '90vh', overflowY: 'auto'
              }}
            >
              
              {/* If it's loading/polling */}
              {modal === 'loading' && (
                <>
                  <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 1.5rem' }}>
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(58,111,247,0.3) 0%, transparent 70%)',
                      animation: 'de-ping 1.5s ease-out infinite',
                    }}/>
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3A6FF7, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                    }}>
                      <Spinner size={32} />
                    </div>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F7F6F2', marginBottom: '0.75rem' }}>
                    {status === 'submitting' ? 'Starting AI...' : 'Generating 3D Model...'}
                  </h2>
                  <p style={{ color: '#A7ADB5', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                    {status === 'submitting' 
                      ? 'Uploading your image and creating task...'
                      : `Status: ${pollingInfo?.status || 'PENDING'} — Please don't close this window.`}
                  </p>
                  
                  {status === 'polling' && pollingInfo && (
                    <div style={{ width: '100%', maxWidth: 300, margin: '0 auto 2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>
                        <span>Progress</span>
                        <span style={{ color: '#3A6FF7' }}>{pollingInfo.progress}%</span>
                      </div>
                      <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${pollingInfo.progress}%` }} 
                          style={{ height: '100%', background: 'linear-gradient(90deg, #3A6FF7, #6366f1)', borderRadius: 10 }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* If it's just a regular enquiry */}
              {modal === 'enquire' && (
                <>
                  <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 1.5rem' }}>
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(58,111,247,0.3) 0%, transparent 70%)',
                      animation: 'de-ping 1.5s ease-out infinite',
                    }}/>
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3A6FF7, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                    }}>✉️</div>
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F7F6F2', marginBottom: '0.75rem' }}>
                    Enquiry Submitted!
                  </h2>
                  <p style={{ color: '#A7ADB5', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                    Thank you! Our team will review your design enquiry and get back to you at the provided email within 48 hours.
                  </p>
                </>
              )}

              {/* If it's a 3D model result */}
              {modal === '3d_model' && generatedModel && (
                <>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F7F6F2', marginBottom: '0.5rem' }}>
                    ✨ Your 3D Model is Ready!
                  </h2>
                  <p style={{ color: '#A7ADB5', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                    Interact with your generated model below. You can also download the files for 3D printing or rendering.
                  </p>
                  
                  {/* Model Viewer Container */}
                  <ModelPreview
                    src={generatedModel.glb || generatedModel.pre_remeshed_glb}
                    poster={modelThumbnail}
                  />

                  {/* Download Options */}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
                    {Object.entries(generatedModel).filter(([, url]) => typeof url === 'string' && url.trim()).map(([format, url]) => (
                      <a 
                        key={format} 
                        href={url} 
                        download={`kaizen-model.${format}`}
                        target="_blank" rel="noreferrer"
                        style={{
                          padding: '0.5rem 1rem', borderRadius: 8, background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem',
                          textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6,
                          textTransform: 'uppercase'
                        }}
                      >
                        ⬇ {format}
                      </a>
                    ))}
                  </div>
                </>
              )}

              {modal !== 'loading' && (
                <button
                  onClick={closeModal}
                  style={{
                    background: 'linear-gradient(135deg,#3A6FF7,#6366f1)',
                    color: '#fff', border: 'none', borderRadius: 10,
                    padding: '0.75rem 2.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                  }}
                >
                  Close
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 2rem' }}>
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '3rem' }}
        >
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', color: 'var(--cobalt-blue)', marginBottom: '1rem',
          }}>
            <span style={{ width: 20, height: 1, background: 'var(--cobalt-blue)', display: 'inline-block' }}/>
            Kaizen 3D Labs
          </span>
          <h1 style={{
            fontSize: 'clamp(2.2rem,5vw,3.5rem)', fontWeight: 900,
            color: '#F7F6F2', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1rem',
          }}>
            Design <span style={{ color: 'var(--cobalt-blue)' }}>Enquiry</span>
          </h1>
          <p style={{ color: '#A7ADB5', fontSize: '1.1rem', maxWidth: 520, lineHeight: 1.6 }}>
            Share your idea, reference images and location — we'll turn it into a precision 3D-printed product or instantly generate a 3D model using AI.
          </p>
        </motion.div>

        {/* ── Persistent Session Model Banner ── */}
        {generatedModel && !modal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '1rem 1.5rem', borderRadius: 12, marginBottom: '2rem',
              background: 'rgba(58,111,247,0.1)', border: '1px solid rgba(58,111,247,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
            }}
          >
            <div>
              <h3 style={{ color: '#F7F6F2', fontSize: '1rem', margin: '0 0 0.25rem 0' }}>✨ Your 3D Model is ready!</h3>
              <p style={{ color: '#A7ADB5', fontSize: '0.85rem', margin: 0 }}>You generated a model during this session.</p>
            </div>
            <button
              type="button"
              onClick={() => setModal('3d_model')}
              style={{
                background: '#3A6FF7', color: '#fff', border: 'none', borderRadius: 8,
                padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#6366f1'}
              onMouseLeave={e => e.currentTarget.style.background = '#3A6FF7'}
            >
              View Model Again
            </button>
          </motion.div>
        )}

        {/* ── Form Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            background: '#0e0e14', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
          }}
        >
          {/* Error banner */}
          {status === 'error' && (
            <div style={{
              padding: '0.875rem 1rem', borderRadius: 10, marginBottom: '1.5rem',
              background: 'rgba(244,67,54,0.08)', border: '1px solid rgba(244,67,54,0.25)',
              color: '#f87171', fontSize: '0.875rem',
            }}>
              ⚠ {errMsg}
            </div>
          )}
          


          {/* ── Personal Details ── */}
          <SectionLabel icon="👤" label="Personal Details" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <Field label="Company Name" name="companyName" type="text" placeholder="Your Company" value={form.companyName} onChange={change} />
            <Field label="User Name" name="name" type="text" placeholder="e.g. Arjun Sharma" value={form.name} onChange={change} required />
            <Field label="Personal / Organisation Mail" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={change} required />
            <Field label="Mobile Number" name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={change} required />
          </div>

          {/* ── Place Details ── */}
          <SectionLabel icon="📍" label="Place Details" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <Field label="Address / Landmark" name="address" type="text" placeholder="Street, area, building..." value={form.address} onChange={change} />
            </div>
            <Field label="City" name="city" type="text" placeholder="e.g. Hyderabad" value={form.city} onChange={change} />
            <Field label="Pincode" name="pincode" type="text" placeholder="500001" value={form.pincode} onChange={change} />
            <Field label="Country" name="country" type="text" placeholder="e.g. India" value={form.country} onChange={change} />
          </div>

          {/* ── Reference Images ── */}
          <SectionLabel icon="🖼" label="Reference Images" sub="Upload a clear photo to generate a 3D model. (PNG, JPG, WEBP)" />

          <div
            id="design-enquiry-dropzone"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--cobalt-blue)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 14, padding: '2rem', textAlign: 'center',
              cursor: 'pointer', transition: 'all 0.25s',
              background: dragOver ? 'rgba(58,111,247,0.05)' : 'rgba(255,255,255,0.02)',
              marginBottom: images.length ? '1rem' : '2rem',
              pointerEvents: (status === 'submitting' || status === 'polling') ? 'none' : 'auto',
              opacity: (status === 'submitting' || status === 'polling') ? 0.5 : 1
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={status === 'submitting' || status === 'polling'}
            />
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📸</div>
            <p style={{ color: '#A7ADB5', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <strong style={{ color: '#F7F6F2' }}>Click or drag & drop</strong> your reference image here<br />
              <span style={{ fontSize: '0.78rem', color: '#6B737C' }}>The FIRST image uploaded will be used for 3D Generation.</span>
            </p>
          </div>

          {/* Image preview grid */}
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '0.75rem', marginBottom: '2rem',
              }}
            >
              {images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ 
                    position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1',
                    border: i === 0 ? '2px solid #3A6FF7' : 'none'
                  }}
                >
                  <img src={img.preview} alt={`Ref ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: 4, left: 4, background: '#3A6FF7', color: '#fff', fontSize: '0.6rem', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>
                      3D AI Target
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                    disabled={status === 'submitting' || status === 'polling'}
                    style={{
                      position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%',
                      background: 'rgba(0,0,0,0.75)', border: 'none', color: '#fff', fontSize: '0.65rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >✕</button>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.3rem 0.4rem',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', fontSize: '0.6rem', color: '#ccc',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {img.file.name}
                  </div>
                </motion.div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileRef.current?.click() }}
                  disabled={status === 'submitting' || status === 'polling'}
                  style={{
                    borderRadius: 10, border: '2px dashed rgba(255,255,255,0.1)',
                    background: 'transparent', cursor: 'pointer', aspectRatio: '1',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', color: '#6B737C', fontSize: '0.75rem', gap: 4,
                  }}
                >
                  <span style={{ fontSize: '1.4rem' }}>+</span>
                  Add more
                </button>
              )}
            </motion.div>
          )}

          {/* ── Description ── */}
          <SectionLabel icon="✏️" label="Description" />
          <div style={{ marginBottom: '2rem' }}>
            <textarea
              name="description"
              value={form.description}
              onChange={change}
              rows={5}
              placeholder="Describe what you want designed — materials, dimensions, use-case, finish, any special requirements..."
              style={{
                width: '100%', padding: '0.875rem 1rem', borderRadius: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#F7F6F2', fontSize: '0.95rem', lineHeight: 1.6,
                fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(58,111,247,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* ── Action Buttons ── */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Generate 3D Model */}
            <motion.button
              type="button"
              onClick={() => submit('3d_model')}
              disabled={status === 'submitting' || status === 'polling' || !form.name || !form.email || !form.phone}
              whileHover={!(status === 'submitting' || status === 'polling') ? { y: -2, boxShadow: '0 8px 30px rgba(58,111,247,0.4)' } : {}}
              whileTap={!(status === 'submitting' || status === 'polling') ? { scale: 0.98 } : {}}
              style={{
                flex: 1, minWidth: 200, padding: '1rem 1.5rem', borderRadius: 12, border: 'none',
                background: (status === 'submitting' || status === 'polling')
                  ? 'rgba(58,111,247,0.4)'
                  : 'linear-gradient(135deg, #3A6FF7 0%, #6366f1 100%)',
                color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                cursor: (!form.name || !form.email || !form.phone || status === 'submitting' || status === 'polling') ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(58,111,247,0.25)',
              }}
            >
              {status === 'submitting' && modal === 'loading' ? (
                <><Spinner /> Starting AI...</>
              ) : status === 'polling' ? (
                <><Spinner /> Generating Model...</>
              ) : (
                <><span style={{ fontSize: '1.1rem' }}>✨</span> Generate 3D Model</>
              )}
            </motion.button>

            {/* Enquire */}
            <motion.button
              type="button"
              onClick={() => submit('enquire')}
              disabled={status === 'submitting' || status === 'polling' || !form.name || !form.email || !form.phone}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
              style={{
                flex: 1, minWidth: 160, padding: '1rem 1.5rem', borderRadius: 12,
                border: '1px solid rgba(58,111,247,0.35)', background: 'rgba(58,111,247,0.07)',
                color: '#A7ADB5', fontSize: '0.95rem', fontWeight: 600,
                cursor: (!form.name || !form.email || !form.phone || status === 'submitting' || status === 'polling') ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (form.name && form.email && form.phone && status==='idle') { e.currentTarget.style.color='#F7F6F2'; e.currentTarget.style.borderColor='rgba(58,111,247,0.7)' } }}
              onMouseLeave={e => { e.currentTarget.style.color='#A7ADB5'; e.currentTarget.style.borderColor='rgba(58,111,247,0.35)' }}
            >
              {status === 'submitting' && modal !== 'loading' ? (
                <><Spinner size={14} /> Sending Enquiry...</>
              ) : (
                <><span style={{ fontSize: '1.1rem' }}>✉️</span> Enquire Only</>
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes de-ping { 0% { transform: scale(0.9); opacity: 0.8; } 70% { transform: scale(1.6); opacity: 0; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes de-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */
function SectionLabel({ icon, label, sub }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B737C' }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)', marginLeft: '0.5rem' }} />
      </div>
      {sub && <p style={{ fontSize: '0.78rem', color: '#4B5563', marginLeft: '1.5rem', marginTop: '0.25rem' }}>{sub}</p>}
    </div>
  )
}

function Field({ label, name, type, placeholder, value, onChange, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label htmlFor={`de-${name}`} style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B737C', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#3A6FF7', marginLeft: 2 }}>*</span>}
      </label>
      <input
        id={`de-${name}`} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
        style={{
          padding: '0.75rem 1rem', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: '#F7F6F2', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(58,111,247,0.5)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
      />
    </div>
  )
}

function Spinner({ size = 16 }) {
  return (
    <span style={{
      width: size, height: size, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff',
      borderRadius: '50%', display: 'inline-block', animation: 'de-spin 0.7s linear infinite',
    }}/>
  )
}
