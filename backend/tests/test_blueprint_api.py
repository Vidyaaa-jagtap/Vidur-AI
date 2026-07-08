"""Regression tests for Vidur AI backend."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://blueprint-builder-89.preview.emergentagent.com").rstrip("/")

VALID_PAYLOAD = {
    "startup_name": "TEST_PytestCo",
    "startup_idea": "An AI copilot that turns raw startup ideas into investor-ready blueprints under a minute.",
    "industry": "SaaS",
    "target_audience": "Early-stage founders",
}


@pytest.fixture(scope="module")
def s():
    return requests.Session()


def test_root(s):
    r = s.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_start_job_returns_immediately(s):
    t0 = time.time()
    r = s.post(f"{BASE_URL}/api/blueprint/jobs", json=VALID_PAYLOAD, timeout=10)
    elapsed = time.time() - t0
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "pending"
    assert body["blueprint_id"] is None
    assert "id" in body
    assert elapsed < 3, f"Job creation too slow: {elapsed}s"


def test_get_unknown_job_404(s):
    r = s.get(f"{BASE_URL}/api/blueprint/jobs/nonexistent-id")
    assert r.status_code == 404


def test_validation_short_idea(s):
    bad = {**VALID_PAYLOAD, "startup_idea": "short"}
    r = s.post(f"{BASE_URL}/api/blueprint/jobs", json=bad)
    assert r.status_code == 422


@pytest.mark.timeout(200)
def test_full_job_lifecycle_and_pdf(s):
    """Start job -> poll -> done -> fetch blueprint -> PDF."""
    r = s.post(f"{BASE_URL}/api/blueprint/jobs", json=VALID_PAYLOAD, timeout=10)
    assert r.status_code == 200
    job_id = r.json()["id"]

    blueprint_id = None
    deadline = time.time() + 180
    last_status = None
    while time.time() < deadline:
        jr = s.get(f"{BASE_URL}/api/blueprint/jobs/{job_id}", timeout=10)
        assert jr.status_code == 200
        j = jr.json()
        last_status = j["status"]
        if j["status"] == "done":
            blueprint_id = j["blueprint_id"]
            break
        if j["status"] == "error":
            pytest.fail(f"Job errored: {j.get('error')}")
        time.sleep(3)

    assert blueprint_id, f"Job did not finish in 180s, last_status={last_status}"

    bp = s.get(f"{BASE_URL}/api/blueprint/{blueprint_id}")
    assert bp.status_code == 200
    data = bp.json()
    assert data["startup_name"] == VALID_PAYLOAD["startup_name"]
    bp_content = data["blueprint"]
    # 9 sections expected
    for key in [
        "problem_statement",
        "business_objectives",
        "business_model_canvas",
        "swot_analysis",
        "risk_analysis",
        "functional_requirements",
        "user_stories",
        "product_backlog",
        "development_roadmap",
    ]:
        assert key in bp_content, f"Missing section {key}"

    # PDF
    pdf = s.get(f"{BASE_URL}/api/blueprint/{blueprint_id}/pdf")
    assert pdf.status_code == 200
    assert pdf.headers["content-type"].startswith("application/pdf")
    assert pdf.content[:4] == b"%PDF"


def test_unknown_pdf_404(s):
    r = s.get(f"{BASE_URL}/api/blueprint/nonexistent-id/pdf")
    assert r.status_code == 404
