import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  timeout: 30000,
});

export async function startBlueprintJob(payload) {
  const { data } = await api.post("/blueprint/jobs", payload);
  return data; // { id, status, blueprint_id?, error? }
}

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
