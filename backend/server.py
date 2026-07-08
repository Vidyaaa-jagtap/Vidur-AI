"""Vidur AI — FastAPI backend."""
from __future__ import annotations

import asyncio
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, BackgroundTasks, FastAPI, HTTPException
from fastapi.responses import Response
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# These imports depend on env vars being loaded first.
from ai_service import generate_blueprint  # noqa: E402
from pdf_service import build_pdf  # noqa: E402

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("vidur")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(title="Vidur AI")
api_router = APIRouter(prefix="/api")


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class BlueprintInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    startup_name: str = Field(..., min_length=1, max_length=120)
    startup_idea: str = Field(..., min_length=10, max_length=4000)
    industry: str = Field(..., min_length=1, max_length=120)
    target_audience: str = Field(..., min_length=1, max_length=400)


class BlueprintRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    startup_name: str
    startup_idea: str
    industry: str
    target_audience: str
    blueprint: dict
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class BlueprintSummary(BaseModel):
    id: str
    startup_name: str
    industry: str
    created_at: datetime


class BlueprintJob(BaseModel):
    """Async generation job so we don't hit the 60s ingress timeout."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: str = "pending"  # pending | running | done | error
    blueprint_id: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Background worker
# ---------------------------------------------------------------------------


async def _run_generation(job_id: str, payload: dict) -> None:
    await db.blueprint_jobs.update_one({"id": job_id}, {"$set": {"status": "running"}})
    try:
        blueprint = await generate_blueprint(payload)
        record = BlueprintRecord(**payload, blueprint=blueprint)
        doc = record.model_dump()
        doc["created_at"] = doc["created_at"].isoformat()
        await db.blueprints.insert_one(doc)
        await db.blueprint_jobs.update_one(
            {"id": job_id},
            {"$set": {"status": "done", "blueprint_id": record.id}},
        )
        logger.info("Job %s completed -> blueprint %s", job_id, record.id)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Job %s failed", job_id)
        await db.blueprint_jobs.update_one(
            {"id": job_id}, {"$set": {"status": "error", "error": str(exc)}}
        )



# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@api_router.get("/")
async def root():
    return {"service": "Vidur AI", "status": "ok"}


@api_router.post("/blueprint/generate", response_model=BlueprintRecord)
async def create_blueprint(payload: BlueprintInput):
    """Synchronous generation. Kept for API completeness / server-to-server callers.

    UI clients should use /blueprint/jobs to avoid the 60s ingress timeout.
    """
    logger.info("Generating blueprint (sync) for %s", payload.startup_name)
    try:
        blueprint = await generate_blueprint(payload.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=f"AI response error: {exc}") from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Blueprint generation failed")
        raise HTTPException(status_code=500, detail="Failed to generate blueprint.") from exc

    record = BlueprintRecord(**payload.model_dump(), blueprint=blueprint)
    doc = record.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.blueprints.insert_one(doc)
    return record


@api_router.post("/blueprint/jobs", response_model=BlueprintJob)
async def start_blueprint_job(payload: BlueprintInput, background_tasks: BackgroundTasks):
    """Kick off async blueprint generation and return a job id immediately."""
    job = BlueprintJob()
    doc = job.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.blueprint_jobs.insert_one(doc)
    background_tasks.add_task(_run_generation, job.id, payload.model_dump())
    logger.info("Job %s queued for %s", job.id, payload.startup_name)
    return job


@api_router.get("/blueprint/jobs/{job_id}", response_model=BlueprintJob)
async def get_blueprint_job(job_id: str):
    doc = await db.blueprint_jobs.find_one({"id": job_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found.")
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return BlueprintJob(**doc)


@api_router.get("/blueprint/{blueprint_id}", response_model=BlueprintRecord)
async def get_blueprint(blueprint_id: str):
    doc = await db.blueprints.find_one({"id": blueprint_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Blueprint not found.")
    if isinstance(doc.get("created_at"), str):
        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
    return BlueprintRecord(**doc)


@api_router.get("/blueprints", response_model=List[BlueprintSummary])
async def list_blueprints(limit: int = 20):
    cursor = db.blueprints.find(
        {},
        {"_id": 0, "id": 1, "startup_name": 1, "industry": 1, "created_at": 1},
    ).sort("created_at", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    for it in items:
        if isinstance(it.get("created_at"), str):
            it["created_at"] = datetime.fromisoformat(it["created_at"])
    return [BlueprintSummary(**i) for i in items]


@api_router.get("/blueprint/{blueprint_id}/pdf")
async def download_pdf(blueprint_id: str):
    doc = await db.blueprints.find_one({"id": blueprint_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Blueprint not found.")

    meta = {
        "startup_name": doc["startup_name"],
        "startup_idea": doc["startup_idea"],
        "industry": doc["industry"],
        "target_audience": doc["target_audience"],
    }
    pdf_bytes = build_pdf(doc["blueprint"], meta)
    safe = "".join(c for c in doc["startup_name"] if c.isalnum() or c in ("-", "_")) or "blueprint"
    filename = f"Vidur-AI-{safe}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
