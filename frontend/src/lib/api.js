import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

if (!BACKEND_URL) {
  // eslint-disable-next-line no-console
  console.error(
    "[Vidur AI] REACT_APP_BACKEND_URL is not set. Add it to frontend/.env and restart yarn."
  );
}

export const api = axios.create({
  baseURL: API,
  timeout: 60000,
});

/** Extract a human-readable message from any axios error. */
export function humanizeError(err) {
  if (!err) return "Unknown error.";
  if (err.code === "ECONNABORTED") return "Request timed out. Please try again.";
  if (err.message === "Network Error") {
    return `Cannot reach backend at ${API}. Check REACT_APP_BACKEND_URL in frontend/.env and that the backend is running.`;
  }
  const detail = err?.response?.data?.detail;
  if (detail) return String(detail);
  if (err?.response?.status) return `${err.response.status} ${err.response.statusText || ""}`.trim();
  return err.message || "Unexpected error.";
}

export async function fetchHealth() {
  const { data } = await api.get("/");
  return data;
}

export async function startBlueprintJob(payload) {
  const { data } = await api.post("/blueprint/jobs", payload);
  return data;
}

export async function getBlueprintJob(jobId) {
  const { data } = await api.get(`/blueprint/jobs/${jobId}`);
  return data;
}

export async function fetchBlueprint(id) {
  const { data } = await api.get(`/blueprint/${id}`);
  return data;
}

export async function fetchChatHistory(blueprintId) {
  const { data } = await api.get(`/blueprint/${blueprintId}/chat/history`);
  return data;
}

export async function sendChatMessage(blueprintId, message) {
  const { data } = await api.post(`/blueprint/${blueprintId}/chat`, { message });
  return data;
}

export async function fetchSuggestedPrompts() {
  const { data } = await api.get(`/copilot/suggested-prompts`);
  return data;
}

export function pdfUrl(id) {
  return `${API}/blueprint/${id}/pdf`;
}
