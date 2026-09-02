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

export async function getAllQuestions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query
    ? `${API_BASE_URL}/questions?${query}`
    : `${API_BASE_URL}/questions`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function getQuestionById(id) {
  const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function createQuestion(questionData) {
  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(questionData),
  });

  return handleResponse(response);
}

export async function updateQuestion(id, questionData) {
  const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(questionData),
  });

  return handleResponse(response);
}

export async function deleteQuestion(id) {
  const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function bulkUploadQuestions(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/questions/bulk-upload`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
}