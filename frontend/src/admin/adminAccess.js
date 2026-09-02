export const ADMIN_NAV_ITEMS = [
  { name: "Dashboard", path: "/admin/dashboard", roles: ["admin", "staff"] },
  { name: "Users", path: "/admin/users", roles: ["admin"] },
  { name: "Teams", path: "/admin/teams", roles: ["admin"] },
  { name: "Students", path: "/admin/students", roles: ["admin", "staff"] },
  { name: "Courses", path: "/admin/courses", roles: ["admin"] },
  { name: "Schools", path: "/admin/schools", roles: ["admin"] },
  { name: "Categories", path: "/admin/categories", roles: ["admin", "staff"] },
  { name: "Questions", path: "/admin/questions", roles: ["admin", "staff"] },
  { name: "Question Papers", path: "/admin/question-papers", roles: ["admin", "staff"] },
  { name: "Quizzes", path: "/admin/quizzes", roles: ["admin", "staff"] },
  { name: "Enquiries", path: "/admin/enquiries", roles: ["admin", "staff"] },
  { name: "Coupons", path: "/admin/coupons", roles: ["admin"] },
];

export function canAccessPath(role, pathname) {
  if (role === "admin") return true;

  const matchedItem = ADMIN_NAV_ITEMS.find((item) => {
    return pathname === item.path || pathname.startsWith(item.path + "/");
  });

  if (!matchedItem) {
    return pathname === "/admin" || pathname === "/admin/dashboard";
  }

  return matchedItem.roles.includes(role);
}