import { API_BASE_URL } from "./apiConfig";

function getToken() {
  return localStorage.getItem("token");
}

function getAuthHeaders() {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    throw new Error("Session expired or unauthorized. Please login again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function getAllSchools(params = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  const query = new URLSearchParams(cleanParams).toString();
  const url = query
    ? `${API_BASE_URL}/schools?${query}`
    : `${API_BASE_URL}/schools`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function getSchoolById(id) {
  if (!id) {
    throw new Error("School id is required");
  }

  const response = await fetch(`${API_BASE_URL}/schools/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function createSchool(schoolData) {
  const response = await fetch(`${API_BASE_URL}/schools`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(schoolData),
  });

  return handleResponse(response);
}

export async function updateSchool(id, schoolData) {
  if (!id) {
    throw new Error("School id is required");
  }

  const response = await fetch(`${API_BASE_URL}/schools/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(schoolData),
  });

  return handleResponse(response);
}

export async function deleteSchool(id) {
  if (!id) {
    throw new Error("School id is required");
  }

  const response = await fetch(`${API_BASE_URL}/schools/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}