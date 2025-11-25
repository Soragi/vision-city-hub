# Docker Deployment Guide

This guide covers deploying the Municipal Video AI application with the integrated NVIDIA Video Search & Summarization backend.

## Prerequisites

- Docker Engine 20.10+ with Docker Compose
- NVIDIA GPU with Docker runtime support (for backend)
- At least 16GB RAM
- NVIDIA API key (get from [NVIDIA NGC](https://catalog.ngc.nvidia.com/))

## Quick Start

### 1. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the required values:

```bash
# REQUIRED: Database passwords
GRAPH_DB_PASSWORD=your-secure-password
ARANGO_DB_PASSWORD=your-secure-password

# REQUIRED: NVIDIA API Key
NVIDIA_API_KEY=your-nvidia-api-key
```

### 2. Production Deployment

Run the full stack (frontend + backend):

```bash
docker-compose up -d
```

Access the application:
- **Frontend UI**: http://localhost:3000
- **NVIDIA Backend API**: http://localhost:8001
- **NVIDIA Native UI**: http://localhost:8000

### 3. Development Mode

For frontend development with hot-reload:

```bash
docker-compose --profile dev up frontend-dev via-server
```

Access the development server at http://localhost:3000

## Architecture Overview

### Services

| Service | Description | Ports |
|---------|-------------|-------|
| `frontend` | React frontend (production) | 3000 |
| `frontend-dev` | React frontend (dev mode) | 3000 |
| `via-server` | NVIDIA VSS Engine | 8001, 8000 |
| `graph-db` | Neo4j graph database | 7474, 7687 |
| `arango-db` | ArangoDB vector database | 8529 |
| `minio` | Object storage | 9000, 9001 |
| `milvus-standalone` | Vector similarity search | 9091, 19530 |
| `elasticsearch` | Search engine | 9200, 9300 |

### Optional Services (Performance Profiling)

Use the `perf-profiling` profile to enable monitoring:

```bash
docker-compose --profile perf-profiling up
```

| Service | Description | Port |
|---------|-------------|------|
| `otel-collector` | OpenTelemetry collector | 4317, 4318 |
| `prometheus` | Metrics storage | 9090 |
| `jaeger` | Distributed tracing | 16686 |

## Common Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f via-server
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes

```bash
docker-compose down -v
```

### Rebuild Frontend

```bash
docker-compose build frontend
docker-compose up -d frontend
```

## Networking

All services communicate through the `municipal-ai-network` bridge network. The frontend connects to the backend via:

```
http://via-server:8001
```

## GPU Configuration

The NVIDIA backend requires GPU access. Configure GPU visibility:

```bash
# Use all GPUs (default)
NVIDIA_VISIBLE_DEVICES=all

# Use specific GPU
NVIDIA_VISIBLE_DEVICES=0

# Use multiple GPUs
NVIDIA_VISIBLE_DEVICES=0,1
```

## Storage Volumes

Persistent data is stored in Docker volumes:

- `via-hf-cache`: HuggingFace model cache
- `via-ngc-model-cache`: NVIDIA NGC model cache
- `minio-data`: Object storage data
- `prometheus-data`: Metrics data

## Troubleshooting

### Backend won't start

1. Check NVIDIA Docker runtime:
   ```bash
   docker run --rm --gpus all nvidia/cuda:12.0.0-base-ubuntu22.04 nvidia-smi
   ```

2. Verify environment variables:
   ```bash
   docker-compose config
   ```

### Frontend can't connect to backend

1. Check backend health:
   ```bash
   curl http://localhost:8001/health
   ```

2. Verify network:
   ```bash
   docker network inspect municipal-ai-network
   ```

### Port conflicts

If ports are already in use, modify them in `.env`:

```bash
BACKEND_PORT=8002
FRONTEND_PORT=8001
# Frontend exposed on port 3001 instead of 3000
```

Then update the frontend service ports in `docker-compose.yml`.

## Production Considerations

### Security

1. **Change default passwords** in `.env`
2. **Use secrets management** for production
3. **Enable HTTPS** with a reverse proxy (nginx/traefik)
4. **Restrict network access** to required services only

### Performance

1. **Scale backend workers**:
   ```bash
   NUM_VLM_PROCS=4
   NUM_GPUS=2
   ```

2. **Increase memory limits** if needed:
   ```bash
   ES_MEM_LIMIT=8589934592  # 8GB
   ```

3. **Optimize GPU memory**:
   ```bash
   VLLM_GPU_MEMORY_UTILIZATION=0.9
   ```

## Support

For NVIDIA backend issues, refer to:
- [NVIDIA VSS Documentation](https://docs.nvidia.com/ai-enterprise/video-search-summarization/)
- [GitHub Repository](https://github.com/NVIDIA-AI-Blueprints/video-search-and-summarization)

For frontend issues, check the main [README.md](README.md).
