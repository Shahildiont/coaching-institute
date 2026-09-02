import { API_BASE_URL } from "./apiConfig";

async function handleResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function getPublicCourses() {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
}

export async function getPublicTests() {
  const response = await fetch(`${API_BASE_URL}/quizzes`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
}

export async function getPublicTestById(id) {
  const response = await fetch(`${API_BASE_URL}/quizzes/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse(response);
}

export async function getPublicQuestionsByQuizId(quizId) {
  const response = await fetch(`${API_BASE_URL}/questions/quiz/${quizId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return { questions: [] };
  }

  return handleResponse(response);
}