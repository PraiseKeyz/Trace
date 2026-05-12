# Trace AI Microservice

This service is the core intelligence engine for Trace. It handles identity scoring, opportunity matching, and trade intelligence generation. It exposes both a FastAPI (REST) interface and a high-performance gRPC server.

## Architecture

* **Framework:** FastAPI (REST) + grpcio (gRPC)
* **Language:** Python 3
* **Machine Learning:** Scikit-learn, Numpy, Pandas
* **Internal Comm:** gRPC Server (listening on port 50051)

## Setup Instructions

### 1. Prerequisites
- Python 3.10+
- Virtual environment support

### 2. Installation
Navigate to the `ai-service/` directory and run:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Generating gRPC Stubs
If the `proto/trace.proto` file changes, you must regenerate the Python stubs. From the `ai-service/` directory:

```bash
python -m grpc_tools.protoc -I./proto --python_out=./api --grpc_python_out=./api ./proto/trace.proto
```

This will output `trace_pb2.py` and `trace_pb2_grpc.py` into the `api/` folder.

### 4. Running the Application

You can run the service in two ways:

**Option A: gRPC Server (Required for NestJS Backend)**
Runs the high-performance RPC server on port 50051.
```bash
python grpc_server.py
```

**Option B: REST API (For Testing/Standalone access)**
Runs the FastAPI server on port 8000.
```bash
uvicorn main:app --reload
```
