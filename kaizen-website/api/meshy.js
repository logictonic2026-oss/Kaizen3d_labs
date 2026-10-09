import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

const API = 'https://api.meshy.ai/openapi/v1/image-to-3d'
const FORMATS = new Set(['glb', 'pre_remeshed_glb', 'obj', 'fbx', 'stl', 'usdz', 'mtl', '3mf', 'blend'])
const MAX_BODY_BYTES = 4_000_000

function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

async function readBody(req) {
  if (req.body !== undefined) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  const chunks = []
  let bytes = 0
  for await (const chunk of req) {
    bytes += chunk.length
    if (bytes > MAX_BODY_BYTES) throw new Error('Image is too large to upload.')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function createMeshyHandler({ apiKey, fetchImpl = fetch } = {}) {
  return async function handler(req, res) {
    if (!['GET', 'POST'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST')
      return json(res, 405, { message: 'Method not allowed' })
    }
    // The legacy name keeps existing Vercel environment settings compatible.
    // Neither variable is referenced by the browser bundle.
    const key = apiKey || process.env.MESHY_API_KEY || process.env.VITE_MESHY_API_KEY
    if (!key) {
      console.error('Meshy server API key is missing for this deployment environment.')
      return json(res, 503, { code: 'MESHY_NOT_CONFIGURED', message: '3D generation is temporarily unavailable. Please contact our team.' })
    }
    const headers = { Authorization: `Bearer ${key}` }

    try {
      if (req.method === 'POST') {
        let body
        try { body = await readBody(req) } catch {
          return json(res, 400, { message: 'Invalid or oversized image request.' })
        }
        if (typeof body?.image_url !== 'string' ||
            body.image_url.length > 3_800_000 ||
            !/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(body.image_url)) {
          return json(res, 400, { message: 'Please upload a valid reference image.' })
        }
        const upstream = await fetchImpl(API, {
          method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: body.image_url, enable_pbr: true }),
          signal: AbortSignal.timeout(30000),
        })
        const result = await upstream.json()
        return json(res, upstream.status, upstream.ok
          ? { result: result.result }
          : { message: result.message || 'Meshy could not start the generation.' })
      }

      const params = new URL(req.url, 'http://localhost').searchParams
      const task = params.get('task')
      const format = params.get('format')
      if (!task || !/^[A-Za-z0-9_-]{1,128}$/.test(task) || (format && !FORMATS.has(format))) {
        return json(res, 400, { message: 'Invalid model request.' })
      }
      const upstream = await fetchImpl(`${API}/${encodeURIComponent(task)}`, {
        headers, signal: AbortSignal.timeout(20000),
      })
      if (!upstream.ok) return json(res, upstream.status, { message: 'Unable to retrieve the Meshy task.' })
      const result = await upstream.json()
      if (!format) {
        const modelUrls = Object.fromEntries(Object.entries(result.model_urls || {})
          .filter(([type, url]) => FORMATS.has(type) && typeof url === 'string' && url)
          .map(([type]) => [type, `/api/meshy?task=${encodeURIComponent(task)}&format=${encodeURIComponent(type)}`]))
        return json(res, 200, {
          status: result.status, progress: result.progress, task_error: result.task_error,
          model_urls: modelUrls, thumbnail_url: result.thumbnail_url,
        })
      }

      const assetUrl = result.model_urls?.[format]
      if (result.status !== 'SUCCEEDED' || !assetUrl) {
        return json(res, 404, { message: 'This model format is not available.' })
      }
      const asset = new URL(assetUrl)
      // Resolve assets from a task, never from a browser-supplied URL.
      if (asset.protocol !== 'https:' || asset.hostname !== 'assets.meshy.ai') {
        return json(res, 502, { message: 'Meshy returned an unsupported asset location.' })
      }
      const file = await fetchImpl(asset.href, { redirect: 'error', signal: AbortSignal.timeout(45000) })
      if (!file.ok || !file.body) return json(res, 502, { message: 'The model file is unavailable or has expired.' })
      res.statusCode = 200
      res.setHeader('Content-Type', format.endsWith('glb') ? 'model/gltf-binary' : file.headers.get('content-type') || 'application/octet-stream')
      res.setHeader('Content-Disposition', `inline; filename="kaizen-model.${format === 'pre_remeshed_glb' ? 'glb' : format}"`)
      res.setHeader('Cache-Control', 'private, max-age=300')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      // Stream large GLBs instead of buffering a response beyond Vercel's limit.
      await pipeline(Readable.fromWeb(file.body), res)
    } catch {
      if (!res.headersSent) json(res, 502, { message: 'Unable to contact Meshy. Please try again.' })
      else res.destroy()
    }
  }
}

export default createMeshyHandler()
