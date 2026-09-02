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

export async function getAllQuizzes(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query
    ? `${API_BASE_URL}/quizzes?${query}`
    : `${API_BASE_URL}/quizzes`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function getQuizById(id) {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function createQuiz(quizData) {
  const response = await fetch(`${API_BASE_URL}/quizzes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(quizData),
  });

  return handleResponse(response);
}

export async function updateQuiz(id, quizData) {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(quizData),
  });

  return handleResponse(response);
}

export async function deleteQuiz(id) {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}