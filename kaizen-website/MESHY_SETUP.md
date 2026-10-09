# Meshy model preview

Meshy model files may download successfully but fail in a browser viewer because
the asset response does not allow cross-origin requests. The site now uses
`/api/meshy` to start generation, poll tasks, and stream files from the same origin
as the viewer. The Meshy API key stays on the server.

## Deploy on Vercel

1. Set `MESHY_API_KEY` in the Vercel project's environment variables to your Meshy
   API key. The existing `VITE_MESHY_API_KEY` setting also works as a server-side
   fallback, so an existing deployment can keep its current settings.
2. Deploy the updated `kaizen-website` directory, including `api/meshy.js` and
   `vercel.json`. The API function is deployed along with the Vite application.
3. Open Design Services and verify the preview and downloads. The function
   streams large model files and retrieves current asset URLs from Meshy.

For local development, put `MESHY_API_KEY` in `.env` and run `npm run dev`.
The Vite development server includes the same API handler. The previous
`VITE_MESHY_API_KEY` name remains supported locally too.

Reference images are converted to JPEG and resized to at most 2048 pixels on
their longest side so generation uploads fit the hosting request limit. The
original attachments used for regular enquiries are preserved.

Meshy's own asset retention still applies. The proxy cannot restore a model that
Meshy has deleted. Downloads remain available for formats returned by the task.

The viewer changes and API route require a new deployment; an older deployment
continues using direct Meshy requests.

## Failed attempts and recovery

Errors remain visible in a dialog. If a status check fails, **Resume generation**
checks the existing task again; it does not create another task. Pending task
information stays in session storage for page reloads in the same tab. Completed
model links stay in local storage and can be reopened after a refresh.

Generation enquiries are now inserted only after Meshy returns `SUCCEEDED`.
Earlier versions inserted enquiries before generation and could incorrectly
count a failed attempt toward the free-generation limit.

To repair an existing affected account, run `supabase/recover-failed-generation.sql`
in the Supabase SQL Editor. Its active statements update the quota function to
ignore records marked `generation_failed`. Review the affected user's records
against Meshy's task history, then use the commented UPDATE example with the
exact ID of a confirmed failed attempt. Successful attempts continue to count.
The browser rechecks older quota flags against this function when no saved model
is available, so clearing browser storage is not required after the account reset.
