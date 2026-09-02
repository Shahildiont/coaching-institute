import { API_BASE_URL } from "./apiConfig";

function getToken() {
  return localStorage.getItem("token");
}

function getAuthHeaders() {
  const token = getToken();

  if (!token) {
    throw new Error("You must be logged in to continue");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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

export async function submitQuizAttempt(quizId, payload) {
  if (!quizId) {
    throw new Error("Quiz id is required");
  }

  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/attempts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function getMyAttemptById(id) {
  if (!id) {
    throw new Error("Attempt id is required");
  }

  const response = await fetch(`${API_BASE_URL}/attempts/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}