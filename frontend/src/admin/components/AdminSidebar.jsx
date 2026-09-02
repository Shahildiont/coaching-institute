import { NavLink } from "react-router";

const linkBase =
  "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition";
const activeClass = "bg-[#46637f] text-white shadow-sm";
const inactiveClass = "text-[#5f6b76] hover:bg-[#eef3f6] hover:text-[#1f2937]";

function AdminSidebar() {
  // const navItems = [
  //   { name: "Dashboard", path: "/admin/dashboard" },
  //   { name: "Students", path: "/admin/students" },
  //   { name: "Courses", path: "/admin/courses" },
  //   { name: "Schools", path: "/admin/schools" },
  //   { name: "Questions", path: "/admin/questions" },
  //   { name: "Quizzes", path: "/admin/quizzes" },
  //   { name: "Coupons", path: "/admin/coupons" },
  //   { name: "Enquiries", path: "/admin/enquiries" },
  //   { name: "Categories", path: "/admin/categories" },
  //   { name: "Users", path: "/admin/users" },
  //   { name: "Teams", path: "/admin/teams" },
  // ];
  const navItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Users", path: "/admin/users" },
  { name: "Teams", path: "/admin/teams" },
  { name: "Students", path: "/admin/students" },
  { name: "Courses", path: "/admin/courses" },
  { name: "Schools", path: "/admin/schools" },
  { name: "Categories", path: "/admin/categories" },
  { name: "Questions", path: "/admin/questions" },
  { name: "Quizzes", path: "/admin/quizzes" },
  { name: "Coupons", path: "/admin/coupons" },
  { name: "Enquiries", path: "/admin/enquiries" },
  { name: "Question Papers",path: "/admin/question-papers"},
];

  return (
    <aside className="hidden h-screen w-[270px] shrink-0 border-r border-[#d8e0e7] bg-white lg:flex lg:flex-col lg:sticky lg:top-0">
      <div className="border-b border-[#d8e0e7] px-6 py-6">
        <h2 className="text-2xl font-bold text-[#1f2937]">XYZ Admin</h2>
        <p className="mt-1 text-sm text-[#5f6b76]">
          Institute management panel
        </p>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {navItems.map((item) => (
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

      <div className="border-t border-[#d8e0e7] p-4">
        <NavLink
          to="/"
          className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-[#5f6b76] transition hover:bg-[#eef3f6] hover:text-[#1f2937]"
        >
          Back to Website
        </NavLink>
      </div>
    </aside>
  );
}

export default AdminSidebar;