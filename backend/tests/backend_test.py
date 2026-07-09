"""Vidur AI backend regression tests (IBM watsonx.ai edition)."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get(
    "REACT_APP_BACKEND_URL",
    "https://blueprint-builder-89.preview.emergentagent.com",
).rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- Health ----
class TestHealth:
    def test_root(self, api):
        r = api.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "ok"
        assert d["llm_provider"] == "IBM watsonx.ai"
        assert isinstance(d["sections"], list)
        assert d["sections"][0] == "executive_summary"


# ---- Copilot ----
class TestCopilot:
    def test_suggested_prompts(self, api):
        r = api.get(f"{BASE_URL}/api/copilot/suggested-prompts")
        assert r.status_code == 200
        prompts = r.json()
        assert isinstance(prompts, list)
        assert len(prompts) >= 5
        assert all(isinstance(p, str) and p for p in prompts)

    def test_chat_unknown_returns_404(self, api):
        r = api.post(
            f"{BASE_URL}/api/blueprint/does-not-exist/chat",
            json={"message": "hi"},
        )
        assert r.status_code == 404

    def test_chat_history_unknown_returns_empty(self, api):
        r = api.get(f"{BASE_URL}/api/blueprint/does-not-exist/chat/history")
        assert r.status_code == 200
        assert r.json() == []


# ---- Blueprint job flow (watsonx blank -> error surfaced) ----
class TestBlueprintJobs:
    def test_create_job_and_error_surfaces(self, api):
        payload = {
            "startup_name": "TEST_Vidur",
            "startup_idea": "An AI copilot that helps founders validate startup ideas.",
            "industry": "SaaS",
            "target_audience": "Early-stage founders",
        }
        r = api.post(f"{BASE_URL}/api/blueprint/jobs", json=payload)
        assert r.status_code == 200
        job = r.json()
        assert job["status"] == "pending"
        assert "executive_summary" in job["progress"]
        jid = job["id"]

        # poll up to ~30s
        final = None
        for _ in range(15):
            time.sleep(2)
            g = api.get(f"{BASE_URL}/api/blueprint/jobs/{jid}")
            assert g.status_code == 200
            final = g.json()
            if final["status"] in ("done", "error"):
                break

        assert final is not None
        assert final["status"] == "error", f"Expected error, got {final['status']}"
        assert final["error"] and "WATSONX_API_KEY" in final["error"], (
            f"Expected informative WATSONX_API_KEY error, got: {final['error']}"
        )

    def test_get_unknown_blueprint_404(self, api):
        r = api.get(f"{BASE_URL}/api/blueprint/nonexistent-id")
        assert r.status_code == 404

    def test_list_blueprints(self, api):
        r = api.get(f"{BASE_URL}/api/blueprints")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
