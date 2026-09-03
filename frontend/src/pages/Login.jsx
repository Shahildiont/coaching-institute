import { Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import { API_BASE_URL } from "../services/apiConfig";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo =
    typeof location.state?.from === "string" && location.state.from.trim()
      ? location.state.from
      : null;

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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const role = data?.user?.role?.toLowerCase?.() || "";

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (role === "admin" || role === "staff") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      navigate("/", { replace: true });
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
          Sign In
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#1f2937]">
          Welcome back
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#5f6b76]">
          Login to continue to your account.
        </p>

        {redirectTo && (
          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Please sign in first to continue to your test.
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              placeholder="Enter your password"
              className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 outline-none transition focus:border-[#46637f]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#46637f] px-5 py-3 font-semibold text-white transition hover:bg-[#395269] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#5f6b76]">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#46637f] transition hover:text-[#395269]"
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}

export default Login;