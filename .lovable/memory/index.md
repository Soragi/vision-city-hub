# Project Memory

## Core
- Brand: NVIDIA Partner Expert Program — "Masterclass VSS Review". NVIDIA palette (black `#000000`, NVIDIA green `#76B900`, off-white surface), Inter font only, sharp corners (`--radius: 0.25rem`). All colors via HSL semantic tokens.
- Layout: Sticky black NvHeader → black hero → single large Masterclass upload (16:9) → Summary/Search/Alerts workflow tabs → ProgramOverview 2026 → NvFooter.
- Workflow: Single long-form recording in (`STREAM_ID = 1`). TL;DR + timestamped chapters from `/api/summarize`, agentic search via `/api/chat/completions`, alerts polled from `/api/alerts/recent`.
- Backend: NVIDIA VSS via Nginx → `via-server:8100`. Summarisation requires `model: 'cosmos-reason1'`, video uploads use `purpose: 'vision'`, `media_type: 'video'`, `id` (not `file_id`).
- Reference docs: https://github.com/NVIDIA-AI-Blueprints/video-search-and-summarization and https://www.nvidia.com/en-gb/about-nvidia/partners/partner-expert-program/

## Memories
- [NVIDIA Masterclass App](mem://features/nvidia-partner-expert-masterclass) — Current product: single-video upload + Summary/Search/Alerts workflows + 2026 program schedule.
- [Custom Prompt Configuration](mem://features/custom-prompt-configuration) — Configurable summarization, caption, and aggregation prompts.
- [Backend Health Monitor](mem://features/backend-health-monitor) — UI component tracking /api/models connectivity status.
- [Docker Deployment Strategy](mem://infrastructure/docker-deployment-strategy) — Multi-stage Node.js + Nginx SPA deployment.
- [Nginx VSS Proxy](mem://infrastructure/nginx-vss-backend-proxy) — Nginx conf for API proxying to via-server:8100.
- [Integrated Deployment Files](mem://infrastructure/integrated-vss-deployment-files) — Details on nvidia-vss/ compose structure.
- [API Specifics Updated](mem://architecture/nvidia-vss-api-specifics-updated) — NVIDIA VSS API param requirements and supported models.
- [Video Aspect Ratio](mem://constraints/video-aspect-ratio) — 16:9 constraint for video frames.
