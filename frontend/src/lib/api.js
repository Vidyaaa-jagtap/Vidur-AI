import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  timeout: 30000,
});

/** Kick off async generation. Returns { id, status, progress } instantly. */
export async function startBlueprintJob(payload) {
  const { data } = await api.post("/blueprint/jobs", payload);
  return data;
}

/** Poll job. Returns { id, status, blueprint_id?, progress, error? }. */
export async function getBlueprintJob(jobId) {
  const { data } = await api.get(`/blueprint/jobs/${jobId}`);
  return data;
}

export async function fetchBlueprint(id) {
  const { data } = await api.get(`/blueprint/${id}`);
  return data;
}

export function pdfUrl(id) {
  return `${API}/blueprint/${id}/pdf`;
}

export async function fetchHealth() {
  const { data } = await api.get("/");
  return data;
}
