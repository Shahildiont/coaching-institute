import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { API_BASE_URL } from "../services/apiConfig";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          role: "student",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f5f7] px-6 py-16">
      <div className="w-full max-w-md rounded-[28px] border border-[#d8e0e7] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#46637f]">
          Sign Up
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#1f2937]">
          Create your account
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#5f6b76]">
          Register to continue with courses, quizzes, and future student features.
        </p>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1f2937]">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 outline-none transition focus:border-[#46637f]"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1f2937]">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 outline-none transition focus:border-[#46637f]"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1f2937]">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 outline-none transition focus:border-[#46637f]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#46637f] px-5 py-3 font-semibold text-white transition hover:bg-[#395269] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#5f6b76]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#46637f] transition hover:text-[#395269]"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Signup;