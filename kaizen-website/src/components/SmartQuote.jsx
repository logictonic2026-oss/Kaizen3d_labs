import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Reveal } from './animations'

export default function SmartQuote() {
  const [audience, setAudience] = useState('B2B')
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState([])
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: '',
    quantity: '',
    material: '',
    deadline: '',
    notes: ''
  })
  
  const [status, setStatus] = useState('idle') // idle, submitting, success, error
  const [errorMsg, setErrorMsg] = useState('')

  const fileRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped].slice(0, 1)) // Limit to 1 file to prevent payload too large on free tier
  }

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files)
    setFiles(prev => [...prev, ...selected].slice(0, 1))
  }

  const removeFile = () => {
    setFiles([])
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    const key = id.replace('quote-', '')
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Convert file to Base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      let fileData = null
      let fileName = null

      if (files.length > 0) {
        fileData = await getBase64(files[0])
        fileName = files[0].name
      }

      const payload = {
        audience: audience,
        name: formData.name,
        email: formData.email,
        company: audience === 'B2B' ? formData.name : '',
        service: formData.service,
        quantity: formData.quantity,
        material: formData.material,
        deadline: formData.deadline,
        details: formData.notes,
        fileData: fileData,
        fileName: fileName
      }

      const scriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'YOUR_GOOGLE_SCRIPT_URL'
      
      if (scriptUrl === 'YOUR_GOOGLE_SCRIPT_URL') {
        throw new Error("Webhook URL is missing. Please add VITE_GOOGLE_SCRIPT_URL to your .env file.")
      }

      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      })

      const result = await response.json()
      
      if (result.result === 'success') {
        setStatus('success')
        setFormData({ name: '', email: '', service: '', quantity: '', material: '', deadline: '', notes: '' })
        setFiles([])
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        throw new Error(result.message || "Failed to submit.")
      }

    } catch (err) {
      console.error(err)
      setStatus('error')
      setErrorMsg(err.message)
    }
  }

  return (
    <section className="quote-section" id="quote">
      <div className="quote-inner">
        <div className="quote-header">
          <Reveal>
            <span className="tag">Smart Quote Request</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="quote-headline">
              Start Your Engineering Review
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="quote-sub">
              Get a detailed technical assessment within 48 hours.
            </p>
          </Reveal>
        </div>

        {/* Audience Switcher */}
        <Reveal delay={0.25}>
          <div className="quote-switcher" role="group" aria-label="Select audience type">
            {['B2B', 'B2C'].map((type) => (
              <button
                key={type}
                className={`quote-switcher__btn${audience === type ? ' active' : ''}`}
                onClick={() => setAudience(type)}
                id={`quote-switcher-${type.toLowerCase()}`}
              >
                {type === 'B2B' ? '🏭 Business' : '👤 Individual'}
              </button>
            ))}
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          <motion.form
            key={audience}
            className="quote-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            id="quote-form"
          >
            {status === 'success' && (
              <div style={{ padding: '1rem', background: 'rgba(76, 175, 80, 0.1)', border: '1px solid #4caf50', borderRadius: 8, color: '#4caf50', marginBottom: '1rem', textAlign: 'center' }}>
                <strong>Success!</strong> Your request has been sent. We'll be in touch within 48 hours.
              </div>
            )}
            
            {status === 'error' && (
              <div style={{ padding: '1rem', background: 'rgba(244, 67, 54, 0.1)', border: '1px solid #f44336', borderRadius: 8, color: '#f44336', marginBottom: '1rem', textAlign: 'center' }}>
                <strong>Error:</strong> {errorMsg}
              </div>
            )}

            {/* Row 1 */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="quote-name">
                  {audience === 'B2B' ? 'Company Name' : 'Full Name'}
                </label>
                <input
                  className="form-input"
                  type="text"
                  id="quote-name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder={audience === 'B2B' ? 'Acme Corp' : 'Your name'}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="quote-email">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  id="quote-email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="quote-service">Service Required</label>
                <select className="form-select" id="quote-service" value={formData.service} onChange={handleInputChange} required>
                  <option value="">Select a service...</option>
                  <option>3D Printing – FDM (Bambu Labs P1S)</option>
                  <option>Rapid Prototyping</option>
                  <option>Product Design Consultation</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="quote-quantity">
                  {audience === 'B2B' ? 'Batch Volume' : 'Quantity'}
                </label>
                <input
                  className="form-input"
                  type="number"
                  id="quote-quantity"
                  min="1"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  placeholder={audience === 'B2B' ? 'e.g. 500' : '1'}
                />
              </div>
            </div>

            {/* Material + Deadline */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="quote-material">Material Preference</label>
                <select className="form-select" id="quote-material" value={formData.material} onChange={handleInputChange}>
                  <option value="">Select material...</option>
                  <option>PLA</option>
                  <option>ABS</option>
                  <option>PETG</option>
                  <option>ASA (UV-resistant / outdoor)</option>
                  <option>TPU (Flexible)</option>
                  <option>Not sure – advise me</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="quote-deadline">Required By</label>
                <input
                  className="form-input"
                  type="date"
                  id="quote-deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* File Drop Zone */}
            <div className="form-group">
              <label className="form-label">Upload Files</label>
              <div
                className={`dropzone${dragOver ? ' drag-over' : ''}`}
                id="quote-dropzone"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileRef.current.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".stl,.step,.stp,.obj,.iges,.3mf,.pdf,.png,.jpg"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  id="quote-file-input"
                />
                <div className="dropzone__icon">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M20 25V13M20 13L15 18M20 13L25 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 27C7.2 27 5 24.8 5 22C5 19.4 6.9 17.2 9.5 16.9C9.2 16.3 9 15.6 9 14.9C9 12.2 11.2 10 14 10C15.1 10 16.2 10.4 17 11.1C17.9 8.7 20.2 7 23 7C27.4 7 31 10.6 31 15C31 15.3 30.9 15.7 30.9 16C33.3 16.6 35 18.8 35 21.5C35 24.5 32.5 27 30 27" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="dropzone__text">
                  <strong>Click or drag & drop</strong> your 3D files here<br />
                  <span style={{ fontSize: '0.75rem' }}>STL, STEP, OBJ, IGES, 3MF, PDF – Max 1 file (10MB limit for Webhooks)</span>
                </p>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  {files.map((file, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'var(--matte-black)', border: 'var(--border-subtle)',
                        borderRadius: 4, padding: '8px 12px',
                      }}
                    >
                      <span style={{ fontSize: '0.875rem', color: 'var(--silver-grey)' }}>
                        📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <button
                        type="button"
                        onClick={removeFile}
                        style={{ color: 'var(--steel-grey)', fontSize: '0.75rem', cursor: 'pointer', background: 'transparent', border: 'none' }}
                        id={`remove-file-${i}`}
                      >
                        ✕
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label" htmlFor="quote-notes">Project Brief / Notes</label>
              <textarea
                className="form-textarea"
                id="quote-notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Describe your project, requirements, surface finish, tolerances, or any special considerations..."
              />
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              className="form-submit"
              id="quote-submit-btn"
              disabled={status === 'submitting'}
              style={{ opacity: status === 'submitting' ? 0.7 : 1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit for Engineering Review →'}
            </motion.button>
          </motion.form>
        </AnimatePresence>
      </div>
    </section>
  )
}
