// const API_BASE_URL = "http://192.168.1.13:5000/api";
import { API_BASE_URL } from "./apiConfig";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getPublicHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function createEnquiry(enquiryData) {
  const response = await fetch(`${API_BASE_URL}/enquiries`, {
    method: "POST",
    headers: getPublicHeaders(),
    body: JSON.stringify(enquiryData),
  });

  return handleResponse(response);
}

export async function getAllEnquiries() {
  const response = await fetch(`${API_BASE_URL}/enquiries`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function updateEnquiry(id, enquiryData) {
  const response = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(enquiryData),
  });

  return handleResponse(response);
}

export async function deleteEnquiry(id) {
  const response = await fetch(`${API_BASE_URL}/enquiries/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}