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

export async function getAlldata(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query
    ? `${API_BASE_URL}/dashboard?${query}`
    : `${API_BASE_URL}/dashboard/getinfo`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function createCategory(categoryData) {
  const response = await fetch(`${API_BASE_URL}/category`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });

  return handleResponse(response);
}

export async function updateCategory(id, categoryData) {
  const response = await fetch(`${API_BASE_URL}/category/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });

  return handleResponse(response);
}

export async function deleteCategory(id) {
  const response = await fetch(`${API_BASE_URL}/category/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}