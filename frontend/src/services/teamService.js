import { API_BASE_URL } from "./apiConfig";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function getAllTeams(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query
    ? `${API_BASE_URL}/teams?${query}`
    : `${API_BASE_URL}/teams`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function createTeam(payload) {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateTeam(id, payload) {
  const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deleteTeam(id) {
  const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}