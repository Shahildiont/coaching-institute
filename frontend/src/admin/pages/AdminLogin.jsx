import { Link } from "react-router";

function AdminLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f5f7] px-6">
      <div className="w-full max-w-md rounded-[24px] bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#46637f]">
          Admin Login
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#1f2937]">
          Welcome back
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#5f6b76]">
          Sign in to manage students, courses, quizzes, and enquiries.
        </p>

        <form className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#1f2937]">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 outline-none transition focus:border-[#46637f]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#1f2937]">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 outline-none transition focus:border-[#46637f]"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-xl bg-[#46637f] px-5 py-3 font-semibold text-white transition hover:bg-[#395269]"
          >
            Login
          </button>
        </form>

        <Link
          to="/"
          className="mt-6 inline-block text-sm font-medium text-[#46637f] transition hover:text-[#395269]"
        >
          Back to website
        </Link>
      </div>
    </main>
  );
}

export default AdminLogin;