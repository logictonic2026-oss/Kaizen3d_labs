export const PENDING_MODEL_KEY = 'kaizen_3d_pending_task'
export const SAVED_MODEL_KEY = 'kaizen_3d_saved_model'

export function readModelState(storage, key) {
  try { return JSON.parse(storage.getItem(key) || 'null') } catch { return null }
}

export function saveModelState(storage, key, value) {
  try {
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, JSON.stringify(value))
  } catch {
    // A storage restriction must not turn a completed generation into a failure.
  }
}

export async function requestModel(url, options) {
  const response = await fetch(url, options)
  let result
  try { result = await response.json() } catch {
    const error = new Error('The model server returned an invalid response. Please retry. If this continues, contact our team.')
    error.status = response.status
    throw error
  }
  if (!response.ok) {
    const error = new Error(result.message || 'The model server could not complete the request. Please retry.')
    error.status = response.status
    throw error
  }
  return result
}
