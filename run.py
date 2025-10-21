"""Convenience script to launch the AI Voice Travel project locally.

This script can start the FastAPI backend, React frontend, and the
LiveKit voice agent in one command so developers do not need to remember
the individual commands. Each service can be toggled on/off via CLI flags.

Usage examples
--------------

Start backend and React frontend (default):
    python run.py

Start everything including the LiveKit agent:
    python run.py --with-agent

Start only the backend:
    python run.py --no-frontend

Custom React frontend port:
    python run.py --frontend-port 3001

"""

from __future__ import annotations

import argparse
import os
import signal
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)
from typing import Dict, Iterable, List, Sequence


ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "app" / "api"
FRONTEND_DIR = ROOT / "frontend"  # React frontend only
AGENT_DIR = ROOT / "agent"


@dataclass
class Service:
    """Runtime configuration for a managed subprocess."""

    name: str
    command: Sequence[str]
    cwd: Path
    env: Dict[str, str] | None = None


def _ensure_directory(path: Path, description: str) -> None:
    if not path.exists():
        raise FileNotFoundError(f"Expected {description} directory at {path}")


def _validate_environment(include_agent: bool, include_frontend: bool = True) -> None:
    _ensure_directory(BACKEND_DIR, "backend")
    
    if include_frontend:
        _ensure_directory(FRONTEND_DIR, "React frontend")
        # Check if node_modules exists
        if not (FRONTEND_DIR / "node_modules").exists():
            print("⚠️  React frontend dependencies not installed. Run 'cd frontend && npm install' first.")

    if include_agent:
        _ensure_directory(AGENT_DIR, "LiveKit agent")
        if not os.getenv("OPENAI_API_KEY"):
            raise RuntimeError(
                "OPENAI_API_KEY must be set to launch the LiveKit agent. "
                "Set the environment variable or omit --with-agent."
            )


def _build_services(args: argparse.Namespace) -> List[Service]:
    services: List[Service] = []
    backend_hostname = args.backend_host
    if backend_hostname in {"0.0.0.0", "::"}:
        backend_hostname = "localhost"
    backend_base_url = f"http://{backend_hostname}:{args.backend_port}"

    if not args.no_backend:
        services.append(
            Service(
                name="backend",
                command=[
                    sys.executable,
                    "-m",
                    "uvicorn",
                    "api:app",
                    "--host",
                    args.backend_host,
                    "--port",
                    str(args.backend_port),
                ],
                cwd=BACKEND_DIR,
            )
        )

    if not args.no_frontend:
        # Launch React/Vite frontend (only option now)
        services.append(
            Service(
                name="react-frontend",
                command=[
                    "npm",
                    "run",
                    "dev",
                    "--",
                    "--port",
                    str(args.frontend_port),
                    "--host",
                    "0.0.0.0"
                ],
                cwd=FRONTEND_DIR,
                env={
                    "VITE_BACKEND_URL": backend_base_url,
                },
            )
        )

    if args.with_agent:
        services.append(
            Service(
                name="livekit-agent",
                command=[sys.executable, "agent.py", "dev"],
                cwd=AGENT_DIR,
                env={
                    "TRAVEL_BACKEND_URL": backend_base_url,
                },
            )
        )

    if not services:
        raise ValueError("At least one service must be selected to run.")

    return services


def _merge_env(base: Dict[str, str], overrides: Dict[str, str] | None) -> Dict[str, str]:
    if not overrides:
        return base

    merged = base.copy()
    merged.update(overrides)
    return merged


def _start_services(services: Iterable[Service]) -> List[tuple[Service, subprocess.Popen]]:
    running: List[tuple[Service, subprocess.Popen]] = []

    for service in services:
        env = _merge_env(os.environ.copy(), service.env)
        print(
            f"🚀 Starting {service.name}: {' '.join(service.command)} (cwd={service.cwd})",
            flush=True,
        )

        process = subprocess.Popen(
            list(service.command),
            cwd=str(service.cwd),
            env=env,
        )

        running.append((service, process))

    return running


def _monitor_processes(processes: List[tuple[Service, subprocess.Popen]]) -> None:
    try:
        while True:
            for service, process in processes:
                return_code = process.poll()
                if return_code is None:
                    continue

                raise RuntimeError(
                    f"Service '{service.name}' exited unexpectedly with code {return_code}."
                )

            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Keyboard interrupt received. Shutting down services...")
    finally:
        _terminate_processes(processes)


def _terminate_processes(processes: List[tuple[Service, subprocess.Popen]]) -> None:
    for service, process in processes:
        if process.poll() is not None:
            continue

        print(f"🔻 Stopping {service.name}...")
        try:
            process.send_signal(signal.SIGINT)
        except Exception:
            process.terminate()

    # Allow processes time to exit gracefully
    deadline = time.time() + 10
    for service, process in processes:
        if process.poll() is not None:
            continue
        remaining = deadline - time.time()
        if remaining <= 0:
            break
        try:
            process.wait(timeout=max(0.1, remaining))
        except subprocess.TimeoutExpired:
            pass

    for service, process in processes:
        if process.poll() is None:
            print(f"⚠️ Force killing {service.name}")
            process.kill()


def parse_args(argv: Sequence[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the AI Travel Voice project stack")
    parser.add_argument("--no-backend", action="store_true", help="Skip launching the FastAPI backend")
    parser.add_argument("--no-frontend", action="store_true", help="Skip launching the React frontend")
    parser.add_argument("--with-agent", action="store_true", help="Launch the LiveKit voice agent as well")
    parser.add_argument("--backend-host", default="0.0.0.0", help="Host interface for the backend server")
    parser.add_argument("--backend-port", type=int, default=8000, help="Port for the backend server")
    parser.add_argument("--frontend-port", type=int, default=3001, help="Port for the React frontend (default: 3001)")

    return parser.parse_args(list(argv))


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])

    try:
        _validate_environment(include_agent=args.with_agent, include_frontend=not args.no_frontend)
    except Exception as error:
        print(f"❌ {error}")
        return 1

    services = _build_services(args)

    processes = _start_services(services)

    try:
        _monitor_processes(processes)
    except RuntimeError as error:
        print(f"❌ {error}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

