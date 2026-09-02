import { useState } from "react";
import { NavLink } from "react-router";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Courses", path: "/courses" },
  { name: "Tests", path: "/quiz" },
  { name: "About", path: "/about" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6 lg:top-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex items-center justify-between rounded-[24px] border border-[#d8e0e7] bg-white/90 px-5 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md sm:px-6 lg:px-8">
          <NavLink
            to="/"
            className="flex items-center gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src="/slack.png"
              alt="XYZ Institution logo"
              className="h-11 w-11 object-contain pb-1"
            />
            <div className="hidden sm:block">
              <h2 className="text-xl leading-none text-[#1f2937]">
                XYZ Institution
              </h2>
              <p className="mt-1 text-sm text-[#607080]">
                Learn • Practice • Succeed
              </p>
            </div>
          </NavLink>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-[#46637f]"
                      : "text-[#4b5b6a] hover:text-[#46637f]"
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    {link.name}
                    <span
                      className={`absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[#46637f] transition-opacity duration-200 ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <NavLink
              to="/login"
              className="rounded-full border border-[#d8e0e7] px-5 py-2 font-medium text-[#46637f] transition hover:bg-[#eef3f6]"
            >
              Login
            </NavLink>

            <NavLink
              to="/enquire"
              className="rounded-full bg-[#46637f] border border-[#cfd8df] px-5 py-2 font-semibold text-white transition hover:bg-[#395269]"
            >
              Enquire Now
            </NavLink>
          </div>

          <button
            type="button"
            className="rounded-lg border border-[#cfd8df] p-2 text-[#4b5b6a] lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.8"
              stroke="currentColor"
              className="h-6 w-6"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="mt-3 rounded-[22px] border border-[#d8e0e7] bg-white/95 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-md lg:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#eef3f6] text-[#46637f]"
                        : "text-[#4b5b6a] hover:bg-[#f7fafc]"
                    }`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}

              <NavLink
                to="/login"
                className="rounded-xl border border-[#d8e0e7] px-4 py-2.5 text-sm font-medium text-[#46637f] transition hover:bg-[#eef3f6]"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </NavLink>

              <NavLink
                to="/enquire"
                className="rounded-full bg-[#46637f] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#395269]"
                onClick={() => setMenuOpen(false)}
              >
                Enquire Now
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;