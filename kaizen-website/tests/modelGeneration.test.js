import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requestModel, readModelState, saveModelState } from '../src/lib/modelGeneration.js'

test('request errors preserve the visible message and HTTP status', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async () => Response.json({ message: 'Meshy server key is missing.' }, { status: 503 })
    await assert.rejects(requestModel('/api/meshy'), error => error.status === 503 && error.message === 'Meshy server key is missing.')
    globalThis.fetch = async () => new Response('<html>Login</html>', { headers: { 'Content-Type': 'text/html' } })
    await assert.rejects(requestModel('/api/meshy'), /invalid response/)
  } finally { globalThis.fetch = original }
})

test('a valid task response can be resumed', async () => {
  const original = globalThis.fetch
  try {
    globalThis.fetch = async () => Response.json({ status: 'IN_PROGRESS', progress: 40 })
    assert.deepEqual(await requestModel('/api/meshy?task=existing-task'), { status: 'IN_PROGRESS', progress: 40 })
  } finally { globalThis.fetch = original }
})

test('corrupt or unavailable browser storage does not fail generation', () => {
  const unavailable = { getItem() { throw new Error('Disabled') }, setItem() { throw new Error('Full') }, removeItem() { throw new Error('Disabled') } }
  assert.equal(readModelState(unavailable, 'task'), null)
  assert.doesNotThrow(() => saveModelState(unavailable, 'task', { taskId: 'existing-task' }))
  assert.doesNotThrow(() => saveModelState(unavailable, 'task', null))
  assert.equal(readModelState({ getItem: () => '{broken' }, 'task'), null)
})
