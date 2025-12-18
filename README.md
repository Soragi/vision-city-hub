# Engine Production Line AI

AI-powered quality inspection and defect analysis for automotive engine production lines, built on NVIDIA Video Search & Summarization (VSS) Blueprint.

## Overview

This application provides real-time video analysis of car engine production lines using NVIDIA's Cosmos-Reason1 Vision Language Model. It detects:

- **Assembly Defects** - Engine block, cylinder head, component installation issues
- **Equipment Malfunctions** - Robotic arm failures, conveyor issues
- **Quality Control Failures** - Torque violations, measurement errors
- **Safety Violations** - PPE compliance, unsafe practices
- **Process Deviations** - Sequence errors, timing issues

## Architecture

```
├── src/                    # React frontend application
├── nvidia-vss/             # NVIDIA VSS deployment configuration
│   ├── compose.yaml        # Docker Compose for all services
│   ├── config.yaml         # VLM and RAG configuration
│   ├── .env                # Environment variables
│   └── guardrails/         # NeMo Guardrails config
├── Dockerfile              # Frontend container build
└── docker-compose.yml      # Legacy/alternative compose
```

## Quick Start

### Development (Frontend Only)

```bash
npm install
npm run dev
```

### Production Deployment (Full Stack with NVIDIA VSS)

```bash
cd nvidia-vss

# Configure your NGC API key
nano .env

# Source environment
source .env

# Start all services
docker compose up -d
```

**Access Points:**
- Frontend: http://localhost:3000
- VSS API: http://localhost:8100
- Neo4j: http://localhost:7474

## Hardware Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| GPU | 1x A100 80GB | 1x H100 |
| RAM | 32GB | 64GB |
| Storage | 100GB SSD | 500GB NVMe |

## Technologies

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: NVIDIA VSS Engine 2.4.0
- **VLM**: Cosmos-Reason1-7B
- **Databases**: Neo4j (Graph), Milvus (Vector), Elasticsearch
- **Storage**: MinIO

## Configuration

Edit `nvidia-vss/config.yaml` to customize:
- Summarization prompts for your production line
- Alert thresholds and notification events
- LLM parameters (temperature, tokens, etc.)

## Documentation

- [NVIDIA VSS Documentation](https://docs.nvidia.com/vss/latest/index.html)
- [Deployment Guide](nvidia-vss/README.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)

## License

Frontend: MIT License  
NVIDIA VSS: Apache 2.0 License
