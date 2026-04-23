---
name: NVIDIA Partner Expert — Masterclass VSS Review
description: Complete UI brand and product pivot to NVIDIA Partner Expert Program 2026, single-video Masterclass review.
type: feature
---

The app is now NVIDIA Partner Expert Program — Masterclass VSS Review.

- Single long-form video upload ("Masterclass VSS Review") drives all workflows. Stream id is hardcoded to 1 in `src/pages/Index.tsx` (`STREAM_ID`).
- Three workflow tabs in `src/components/MasterclassWorkflows.tsx`: Summary, Search, Alerts.
  - Summary: streams `/api/summarize`, parses TL;DR + `[hh:mm:ss]` chapters from the aggregated text. Default prompts in `useVideoState.ts` instruct the backend to emit a `TL;DR` section followed by `Full Summary` with `[hh:mm:ss] Chapter title — description` lines. Default `chunkDuration` is 60s (long video).
  - Search: posts a structured agentic prompt to `/api/chat/completions` with the uploaded `fileId`, expects RANKED CLIPS / CRITIQUE / FINAL ANSWER sections.
  - Alerts: two sub-tabs (Verification, Real-time) polling `/api/alerts/recent` every 5s. Rule textareas are UI-only — the actual events list is configured server-side in `nvidia-vss/config.yaml` under `functions.notification.params.events`.
- NVIDIA visual system in `src/index.css` + `tailwind.config.ts`: black hero/footer, NVIDIA green `--primary` and `--nv-green` (HSL `80 100% 36%`), Inter only (no Fraunces), `--radius: 0.25rem`.
- Page sections in order: NvHeader (sticky black) → NvHero → Masterclass upload → Workflow tabs → ProgramOverview (2026 schedule) → NvFooter.
- `ProgramOverview.tsx` contains the hard-coded 2026 schedule (Apr/Jun/Jul/Sep/Nov events).
- Removed `/comparison` route and `ComparisonView.tsx`. Old multi-stream components (`VideoUploadCard`, `ChatInterface`, `ResponsePanel`, `AnalysisPanel`, `SyncedVideoPlayer`, `VideoTimeline`, `CrossStreamEvents`, `SummarizationSettings`) are no longer imported by `Index.tsx` but still exist on disk.
