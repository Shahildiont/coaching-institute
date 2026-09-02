import { useEffect, useMemo, useState } from "react";
import { getAllUsers, updateUserRole } from "../../services/userService";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await getAllUsers();
      setUsers(response.users || []);
    } catch (err) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleRoleChange(userId, newRole) {
    try {
      setSubmittingId(userId);
      setError("");

      await updateUserRole(userId, { role: newRole });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update user role");
    } finally {
      setSubmittingId(null);
    }
  }

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query);

      const matchesRole =
        roleFilter === "all" || user.role?.toLowerCase() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d8e0e7] bg-white p-6 text-[#5f6b76]">
        Loading users...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#d8e0e7] bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1f2937]">Users</h2>
          <p className="mt-1 text-sm text-[#5f6b76]">
            Search users, filter by role, and promote users to staff.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-[#d8e0e7] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#46637f] lg:min-w-[280px]"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-[#d8e0e7] bg-white px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#46637f]"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="student">Student</option>
          </select>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[#d8e0e7] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#d8e0e7] px-6 py-4">
          <h3 className="text-lg font-semibold text-[#1f2937]">All Users</h3>
          <span className="text-sm text-[#5f6b76]">
            {filteredUsers.length} result{filteredUsers.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#f8fafc]">
              <tr className="text-left text-sm text-[#5f6b76]">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Team</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-10 text-center text-sm text-[#5f6b76]"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-[#eef3f6] text-sm text-[#1f2937]"
                  >
                    <td className="px-6 py-4 font-medium">{user.name || "-"}</td>
                    <td className="px-6 py-4">{user.email || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-[#eef3f6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#46637f]">
                        {user.role || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{user.team?.name || "-"}</td>
                    <td className="px-6 py-4">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role || "student"}
                        onChange={(e) =>
                          handleRoleChange(user._id, e.target.value)
                        }
                        disabled={submittingId === user._id}
                        className="rounded-lg border border-[#d8e0e7] bg-white px-3 py-2 text-sm text-[#1f2937] outline-none transition focus:border-[#46637f] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="student">Student</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Users;