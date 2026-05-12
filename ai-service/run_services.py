import logging
from threading import Thread

import uvicorn

from core.config import settings
from grpc_server import create_server


def start_grpc_server():
    server = create_server()
    bind_address = f"{settings.GRPC_SERVICE_HOST}:{settings.GRPC_SERVICE_PORT}"
    server.add_insecure_port(bind_address)
    server.start()
    logging.getLogger(__name__).info("gRPC server listening on %s", bind_address)
    server.wait_for_termination()


def main():
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    )

    grpc_thread = Thread(target=start_grpc_server, daemon=True)
    grpc_thread.start()

    uvicorn.run(
        "main:app",
        host=settings.AI_SERVICE_HOST,
        port=settings.AI_SERVICE_PORT,
        log_level=settings.LOG_LEVEL.lower(),
    )


if __name__ == "__main__":
    main()
