import { NavLink, Outlet, useNavigate } from "react-router";
import { ADMIN_NAV_ITEMS } from "../adminAccess";

const linkBase = "block rounded-xl px-4 py-3 text-sm font-medium transition";
const activeClass = "bg-[#46637f] text-white";
const inactiveClass =
  "text-[#5f6b76] hover:bg-[#eef3f6] hover:text-[#1f2937]";

function AdminLayout() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const visibleNavItems = ADMIN_NAV_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#f3f5f7]">
      <aside className="hidden w-[270px] shrink-0 border-r border-[#d8e0e7] bg-white lg:flex lg:flex-col">
        <div className="border-b border-[#d8e0e7] px-6 py-6">
          <h2 className="text-2xl font-bold text-[#1f2937]">XYZ Admin</h2>
          <p className="mt-1 text-sm text-[#5f6b76]">
            Institute management panel
          </p>
          <p className="mt-2 inline-block rounded-full bg-[#eef3f6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#46637f]">
            {role || "guest"}
          </p>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? activeClass : inactiveClass}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-3 border-t border-[#d8e0e7] p-4">
          <NavLink
            to="/"
            className="block rounded-xl border border-[#d8e0e7] px-4 py-3 text-sm font-medium text-[#1f2937] transition hover:bg-[#f5f8fa]"
          >
            Back to Website
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full rounded-xl bg-[#46637f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#395269]"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-[#d8e0e7] bg-white px-5 py-4 lg:px-8">
          <p className="text-sm font-medium text-[#46637f]">Admin Panel</p>
          <h1 className="text-2xl font-bold text-[#1f2937]">
            Institute Dashboard
          </h1>
        </header>

        <main className="flex-1 p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;