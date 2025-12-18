# NVIDIA Video Search & Summarization - Engine Production Line Analysis

This directory contains the NVIDIA VSS deployment configuration for the custom Engine Production Line Analysis frontend.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Engine Production Line AI                     │
├─────────────────────────────────────────────────────────────────┤
│  Custom React Frontend (Port 3000)                              │
│  - Production camera monitoring                                  │
│  - Quality inspection results                                    │
│  - Defect detection alerts                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  NVIDIA VSS Engine (Port 8100)                                  │
│  - Cosmos-Reason1-7B VLM                                        │
│  - Video ingestion & analysis                                   │
│  - CA-RAG for contextual understanding                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Neo4j       │  │   Milvus      │  │   MinIO       │
│  (Graph DB)   │  │  (Vector DB)  │  │  (Storage)    │
└───────────────┘  └───────────────┘  └───────────────┘
```

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.32+
- NVIDIA GPU with 80GB+ VRAM (H100, A100, etc.)
- NVIDIA Container Toolkit
- NGC API Key from [NGC](https://org.ngc.nvidia.com/setup/api-keys)

## Quick Start

1. **Configure environment:**
   ```bash
   cd nvidia-vss
   # Edit .env file with your NGC_API_KEY
   nano .env
   ```

2. **Source environment variables:**
   ```bash
   source .env
   ```

3. **Start all services:**
   ```bash
   docker compose up -d
   ```

4. **Access the application:**
   - Custom Frontend: http://localhost:3000
   - VSS Backend API: http://localhost:8100
   - Neo4j Browser: http://localhost:7474
   - MinIO Console: http://localhost:9001

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | Custom React UI for production line analysis |
| via-server | 8100 | NVIDIA VSS Engine with Cosmos-Reason1 VLM |
| graph-db | 7474/7687 | Neo4j graph database |
| milvus-standalone | 19530 | Milvus vector database |
| minio | 9000/9001 | Object storage |
| arango-db | 8529 | ArangoDB for additional storage |
| elasticsearch | 9200 | Search engine |

## Configuration

### VLM Model
The default configuration uses Cosmos-Reason1-7B optimized for:
- Assembly defect detection
- Equipment malfunction identification
- Quality control monitoring
- Safety violation detection

### Prompts
The `config.yaml` contains automotive-specific prompts for:
- Dense captioning of production events
- Summarization of quality issues
- Alert generation for defects

## Troubleshooting

### GPU Not Detected
```bash
nvidia-smi  # Verify GPU is visible
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi
```

### Services Not Starting
```bash
docker compose logs via-server
docker compose logs -f  # Follow all logs
```

### Memory Issues
Adjust `VLLM_GPU_MEMORY_UTILIZATION` in `.env` (default: 0.3)

## Hardware Requirements

| Deployment | Min GPU | Recommended |
|------------|---------|-------------|
| Single GPU | 1x A100 80GB | 1x H100 |
| Multi-GPU | 4x A100 80GB | 4x H100 |

## License

NVIDIA AI Blueprint - Apache 2.0 License
