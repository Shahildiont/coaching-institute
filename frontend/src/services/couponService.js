// const API_BASE_URL = "http://192.168.1.13:5000/api";
import { API_BASE_URL } from "./apiConfig";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function getAllCoupons() {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function getCouponById(id) {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}

export async function createCoupon(couponData) {
  const response = await fetch(`${API_BASE_URL}/coupons`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(couponData),
  });

  return handleResponse(response);
}

export async function updateCoupon(id, couponData) {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(couponData),
  });

  return handleResponse(response);
}

export async function deleteCoupon(id) {
  const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
}