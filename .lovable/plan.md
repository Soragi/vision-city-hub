

# NVIDIA Partner Expert — Masterclass VSS Review

Replace the current dashcam UI with an NVIDIA-styled single-video Masterclass review tool. One large video upload ("Masterclass VSS Review") drives three agent workflows — **Summary**, **Search**, and **Alerts** — and the page also showcases the Partner Expert Program 2026 schedule.

## What you'll see on the page

```text
┌────────────────────────────────────────────────────────────────┐
│  NVIDIA bar (black) │ Partner Expert Program — Masterclass VSS │
├────────────────────────────────────────────────────────────────┤
│  HERO                                                          │
│  "Elevate your expertise. Unlock what's next."                 │
│  Subhead + green CTA "Upload Masterclass"                      │
├────────────────────────────────────────────────────────────────┤
│  MASTERCLASS VSS REVIEW  (single large dropzone, 16:9)         │
│  [ Drag & drop a long video (~1h) · MP4/MOV up to ~5GB ]       │
│  Upload progress · Filename · Duration · Status pill           │
├────────────────────────────────────────────────────────────────┤
│  WORKFLOW TABS:  [Summary] [Search] [Alerts]                   │
│                                                                │
│  ── Summary ──                                                 │
│     ▸ TL;DR card (bold, 3-5 bullets)                           │
│     ▸ Full Summary with [hh:mm:ss] timestamps (chapter list)   │
│     ▸ Chunk size selector + "Generate Summary" (NV green)      │
│     ▸ Download Markdown report                                 │
│                                                                │
│  ── Search ──                                                  │
│     ▸ Natural-language query box                               │
│     ▸ Ranked clip results: timestamp · thumbnail · rationale   │
│     ▸ "Critique & finalise" agent step indicator               │
│                                                                │
│  ── Alerts ──                                                  │
│     ▸ Two sub-tabs: Verification | Real-time                   │
│     ▸ Define alert rules (textarea, comma-separated events)    │
│     ▸ Live alert feed with severity, timestamp, VLM rationale  │
├────────────────────────────────────────────────────────────────┤
│  PROGRAM OVERVIEW 2026  (timeline, NVIDIA card grid)           │
│  Apr · Jun · Sep · Nov masterclasses + workshops + tech talks  │
├────────────────────────────────────────────────────────────────┤
│  Footer (NVIDIA-style, dark)                                   │
└────────────────────────────────────────────────────────────────┘
```

## Visual direction (NVIDIA styling)

- **Palette:** NVIDIA black `#000000`, NVIDIA green `#76B900`, off-white `#F7F7F7`, neutral greys. Light theme by default with a black hero bar.
- **Type:** Sans (Inter) for everything; large bold display headings, tight tracking, generous whitespace. Drop the Fraunces serif and the cream/forest theme.
- **Components:** Sharp 2-4 px radius, square-ish cards, thin separators, green accent buttons, NVIDIA-style tab underline.

## Build steps

1. **Re-skin the design system** (`src/index.css`, `tailwind.config.ts`)
   - Replace cream/forest tokens with NVIDIA palette (black bg variant for hero/footer, white surface, green primary `142 100% 36%`).
   - Remove Fraunces import; keep Inter only.

2. **New page layout** (`src/pages/Index.tsx`)
   - Strip the 4-camera dashcam grid, the "Implement" wordmark, and the Compare/dual-stream logic.
   - Add an NVIDIA-style top nav (logo + "Partner Expert Program 2026" + section links: Overview · Masterclass · Search · Alerts · Schedule).
   - Add hero block with headline, sub-copy, primary CTA scrolling to the upload card.

3. **Single Masterclass uploader** (`src/components/MasterclassUpload.tsx`, replaces `VideoUploadCard` usage)
   - One large 16:9 dropzone, accepts long video (label as ~1h, MP4/MOV).
   - Reuses existing `fileAPI.uploadFile` (multipart to `/api/files`, `purpose: vision`, `media_type: video`), shows upload progress, status pill, file metadata, replace/delete.
   - On success: `selectedStreamId = 1` (single stream model), enables the workflow tabs.

4. **Workflow tabs** (`src/components/MasterclassWorkflows.tsx`)
   - **Summary tab**
     - Calls `summarizationAPI.summarizeVideo` (existing `/api/summarize` SSE).
     - New default prompts tuned for an NVIDIA Masterclass: speakers, topics, demos, key takeaways.
     - Post-process the streamed text into two views: a TL;DR (first paragraph or bulletised highlights) and a Full Summary parsed from `start:end: caption` lines into `[hh:mm:ss] heading` chapters.
     - "Download Markdown report" reuses current download pattern.
   - **Search tab**
     - Query input + submit, shows result cards (timestamp, snippet, agent critique).
     - Wires to `chatAPI.sendMessage` with the uploaded `fileId` (the VSS Q&A endpoint `/api/chat/completions` is the same path the blueprint uses for retrieval; the prompt instructs the agent to return ranked clips with timestamps and a critique step).
   - **Alerts tab**
     - Two sub-tabs (Verification, Real-time) using `Tabs`.
     - Rule editor (comma-separated events) + Start/Stop controls.
     - Live feed polls `alertsAPI.getAlerts` (existing `/api/alerts/recent`) every 5 s while active; renders severity badge, timestamp, type, VLM rationale. Verification view shows the last verified clip with the same data shape.

5. **Program Overview section** (`src/components/ProgramOverview.tsx`)
   - Hard-coded data array transcribed from the NVIDIA page:
     - Apr 8-10 Deep Dive · AI Factory Training
     - Apr 22-23 Masterclass · Industry Solutions
     - Apr 30 Tech Talk · Physics NeMo
     - Jun 2-4 Workshop · AI Factory Training
     - Jun 9-10 Masterclass · Agentic AI
     - Jun 25 Tech Talk
     - Jul 7-9 Workshop · AI Factory Training
     - Sep 8-10 Workshop · AI Factory Training
     - Sep 16-17 Masterclass · Physical AI
     - Sep 30 Tech Talk
     - Nov 3-5 Workshop · AI Factory Training
     - Nov 11-12 Masterclass · AI Factory
     - Nov 26 Tech Talk
   - Rendered as a horizontal month strip plus NVIDIA-style cards (image placeholder, date, type chip, title, description, "Register" link where applicable).

6. **Cleanup**
   - Remove `USE_CASES`, `STREAM_INDUSTRIES`, comparison route + `src/pages/ComparisonView.tsx` if still routed.
   - Update `useVideoState` to a single-stream model (`videos.get(1)`) with new default summarisation prompts focused on Masterclass content.
   - Update `BackendHealthCheck` copy and `ChatInterface` placeholder to "Ask the Masterclass".
   - Refresh memory: brand → NVIDIA Partner Expert; replace the multi-stream / Implement-Consulting / dashcam memories.

## Technical notes

- **Backend ports/endpoints (unchanged, already proxied by nginx to `via-server:8100`)**
  - Upload: `POST /api/files` (multipart, `purpose: vision`, `media_type: video`)
  - Summarise (SSE): `POST /api/summarize` with `id`, `model: cosmos-reason1`, `chunk_duration`, `prompt`, `caption_summarization_prompt`, `summary_aggregation_prompt`
  - Search / chat Q&A: `POST /api/chat/completions` with `id` = uploaded fileId
  - Alerts: `GET /api/alerts/recent` (polled). The blueprint's real-time alert config (events list, chunk duration) is configured in `nvidia-vss/config.yaml` under `functions.notification.params.events`; the UI sends rule text the user can later sync into config.
- TL;DR is derived client-side from the streamed summary (split on the `summary_aggregation_prompt` "TL;DR" header we add to the default prompt) so it works without any backend change.
- Long uploads (~1h, multi-GB) keep using `XMLHttpRequest` so progress events still fire.

## Files touched

- Edit: `src/index.css`, `tailwind.config.ts`, `src/pages/Index.tsx`, `src/hooks/useVideoState.ts`, `src/services/api.ts` (small Search wrapper), `src/components/ChatInterface.tsx`, `src/components/BackendHealthCheck.tsx`, `src/components/ResponsePanel.tsx` (or remove if replaced), `src/App.tsx` (drop comparison route).
- Add: `src/components/MasterclassUpload.tsx`, `src/components/MasterclassWorkflows.tsx`, `src/components/workflows/SummaryWorkflow.tsx`, `src/components/workflows/SearchWorkflow.tsx`, `src/components/workflows/AlertsWorkflow.tsx`, `src/components/ProgramOverview.tsx`, `src/components/NvHeader.tsx`, `src/components/NvHero.tsx`, `src/components/NvFooter.tsx`.
- Remove: `src/pages/ComparisonView.tsx` and its route, multi-stream constants, `VideoUploadCard` if no longer used.

