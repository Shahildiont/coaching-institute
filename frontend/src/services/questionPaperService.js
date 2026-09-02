import { API_BASE_URL } from "./apiConfig";

async function handleResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function getAllQuestionPapers(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString
    ? `${API_BASE_URL}/question-papers?${queryString}`
    : `${API_BASE_URL}/question-papers`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
}

export async function getQuestionPaperById(id) {
  const response = await fetch(`${API_BASE_URL}/question-papers/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
}

export async function createQuestionPaper(payload) {
  const response = await fetch(`${API_BASE_URL}/question-papers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateQuestionPaper(id, payload) {
  const response = await fetch(`${API_BASE_URL}/question-papers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deleteQuestionPaper(id) {
  const response = await fetch(`${API_BASE_URL}/question-papers/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
}