import { useEffect, useMemo, useState } from "react";
import {
  createTeam,
  deleteTeam,
  getAllTeams,
  updateTeam,
} from "../../services/teamService";
import { getAllUsers } from "../../services/userService";

const steps = ["Team Details", "Select Staffs"];

const initialForm = {
  id: null,
  name: "",
  description: "",
  status: "active",
  members: [],
};

function Teams() {
  const [teams, setTeams] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [staffSearch, setStaffSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [form, setForm] = useState(initialForm);

  async function fetchPageData() {
    try {
      setLoading(true);
      setError("");

      const [teamsResponse, usersResponse] = await Promise.all([
        getAllTeams(),
        getAllUsers(),
      ]);

      setTeams(teamsResponse.teams || []);

      const onlyStaff = (usersResponse.users || []).filter(
        (user) => user.role === "staff"
      );
      setStaffUsers(onlyStaff);
    } catch (err) {
      setError(err.message || "Failed to load teams data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPageData();
  }, []);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toggleMember(userId) {
    setForm((prev) => {
      const alreadySelected = prev.members.includes(userId);

      return {
        ...prev,
        members: alreadySelected
          ? prev.members.filter((id) => id !== userId)
          : [...prev.members, userId],
      };
    });
  }

  function validateStep() {
    if (currentStep === 0) {
      if (!form.name.trim()) {
        setError("Team name is required");
        return false;
      }
    }

    if (currentStep === 1) {
      if (form.members.length === 0) {
        setError("Please select at least one staff member");
        return false;
      }
    }

    setError("");
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function handleBack() {
    setError("");
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  function resetForm() {
    setForm(initialForm);
    setCurrentStep(0);
    setStaffSearch("");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Team name is required");
      return;
    }

    if (form.members.length === 0) {
      setError("Please select at least one staff member");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name,
        description: form.description,
        status: form.status,
        members: form.members,
      };

      if (form.id) {
        await updateTeam(form.id, payload);
      } else {
        await createTeam(payload);
      }

      await fetchPageData();
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save team");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(team) {
    setForm({
      id: team._id,
      name: team.name || "",
      description: team.description || "",
      status: team.status || "active",
      members: (team.members || []).map((member) => member._id),
    });
    setCurrentStep(0);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(teamId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this team?"
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(teamId);
      setError("");
      await deleteTeam(teamId);
      await fetchPageData();

      if (form.id === teamId) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Failed to delete team");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredStaffUsers = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();

    return staffUsers.filter((user) => {
      if (!query) return true;

      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
    });
  }, [staffUsers, staffSearch]);

  const filteredTeams = useMemo(() => {
    const query = teamSearch.trim().toLowerCase();

    return teams.filter((team) => {
      if (!query) return true;

      return (
        team.name?.toLowerCase().includes(query) ||
        team.description?.toLowerCase().includes(query)
      );
    });
  }, [teams, teamSearch]);

  const selectedMembers = useMemo(() => {
    return staffUsers.filter((user) => form.members.includes(user._id));
  }, [staffUsers, form.members]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d8e0e7] bg-white p-6 text-[#5f6b76]">
        Loading teams...
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[#d8e0e7] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#eef3f6] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1f2937]">Teams</h2>
            <p className="mt-1 text-sm text-[#5f6b76]">
              Create teams step by step and assign staff members easily.
            </p>
          </div>

          {form.id ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[#d8e0e7] px-4 py-2 text-sm font-medium text-[#1f2937] transition hover:bg-[#f5f8fa]"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3 overflow-x-auto">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step} className="flex min-w-[180px] flex-1 items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      isCompleted
                        ? "bg-[#46637f] text-white"
                        : isActive
                        ? "border-2 border-[#46637f] bg-[#eef3f6] text-[#46637f]"
                        : "border border-[#d8e0e7] bg-white text-[#5f6b76]"
                    }`}
                  >
                    {index + 1}
                  </div>

                  <p
                    className={`text-sm font-semibold ${
                      isActive || isCompleted
                        ? "text-[#1f2937]"
                        : "text-[#5f6b76]"
                    }`}
                  >
                    {step}
                  </p>
                </div>

                {index < steps.length - 1 ? (
                  <div className="mx-3 hidden h-[2px] flex-1 bg-[#d8e0e7] lg:block" />
                ) : null}
              </div>
            );
          })}
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6">
          {currentStep === 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#1f2937]">
                  Team Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="Enter team name"
                  className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#46637f]"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium text-[#1f2937]">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Enter team description"
                  className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#46637f]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1f2937]">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#46637f]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f2937]">
                    Select Staffs
                  </h3>
                  <p className="mt-1 text-sm text-[#5f6b76]">
                    Search and choose staff members for this team.
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Search staff by name or email"
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#46637f] lg:max-w-[320px]"
                />
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {filteredStaffUsers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d8e0e7] px-4 py-8 text-center text-sm text-[#5f6b76] lg:col-span-2">
                    No staff members found.
                  </div>
                ) : (
                  filteredStaffUsers.map((user) => {
                    const selected = form.members.includes(user._id);

                    return (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => toggleMember(user._id)}
                        className={`rounded-xl border p-4 text-left transition ${
                          selected
                            ? "border-[#46637f] bg-[#eef3f6]"
                            : "border-[#d8e0e7] bg-white hover:bg-[#f8fafc]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[#1f2937]">
                              {user.name}
                            </p>
                            <p className="mt-1 text-sm text-[#5f6b76]">
                              {user.email}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              selected
                                ? "bg-[#46637f] text-white"
                                : "bg-[#eef3f6] text-[#46637f]"
                            }`}
                          >
                            {selected ? "Selected" : "Select"}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* {currentStep === 2 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#d8e0e7] bg-[#f8fafc] p-5">
                <h3 className="text-lg font-semibold text-[#1f2937]">
                  Review Team Details
                </h3>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5f6b76]">
                      Team Name
                    </p>
                    <p className="mt-1 text-sm text-[#1f2937]">
                      {form.name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5f6b76]">
                      Status
                    </p>
                    <p className="mt-1 text-sm capitalize text-[#1f2937]">
                      {form.status || "-"}
                    </p>
                  </div>

                  <div className="lg:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#5f6b76]">
                      Description
                    </p>
                    <p className="mt-1 text-sm text-[#1f2937]">
                      {form.description || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#d8e0e7] bg-white p-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-[#1f2937]">
                    Selected Staff Members
                  </h4>
                  <span className="text-sm text-[#5f6b76]">
                    {selectedMembers.length} selected
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {selectedMembers.length === 0 ? (
                    <p className="text-sm text-[#5f6b76]">No staff selected.</p>
                  ) : (
                    selectedMembers.map((member) => (
                      <div
                        key={member._id}
                        className="rounded-xl border border-[#d8e0e7] px-4 py-3"
                      >
                        <p className="font-medium text-[#1f2937]">{member.name}</p>
                        <p className="text-sm text-[#5f6b76]">{member.email}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )} */}

          <div className="mt-8 flex flex-col gap-3 border-t border-[#eef3f6] pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="rounded-xl border border-[#d8e0e7] px-5 py-3 text-sm font-medium text-[#1f2937] transition hover:bg-[#f5f8fa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Back
            </button>

            <div className="flex gap-3">
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="rounded-xl bg-[#46637f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#395269]"
                >
                  Save
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#46637f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#395269] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : form.id ? "Update Team" : "Create Team"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-[#d8e0e7] bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#d8e0e7] px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[#1f2937]">Team List</h3>
            <p className="mt-1 text-sm text-[#5f6b76]">
              All created teams are shown separately below.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search teams"
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            className="w-full rounded-xl border border-[#d8e0e7] px-4 py-3 text-sm text-[#1f2937] outline-none transition focus:border-[#46637f] lg:max-w-[300px]"
          />
        </div>

        <div className="grid gap-4 p-6 lg:grid-cols-2">
          {filteredTeams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#d8e0e7] px-4 py-8 text-center text-sm text-[#5f6b76] lg:col-span-2">
              No teams found.
            </div>
          ) : (
            filteredTeams.map((team) => (
              <div
                key={team._id}
                className="rounded-2xl border border-[#d8e0e7] bg-[#fcfdff] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-[#1f2937]">
                      {team.name}
                    </h4>
                    <p className="mt-1 text-sm text-[#5f6b76]">
                      {team.description || "No description"}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#eef3f6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#46637f]">
                    {team.status}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5f6b76]">
                    Members
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {team.members?.length ? (
                      team.members.map((member) => (
                        <span
                          key={member._id}
                          className="rounded-full border border-[#d8e0e7] bg-white px-3 py-1 text-xs font-medium text-[#1f2937]"
                        >
                          {member.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#5f6b76]">
                        No members assigned
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(team)}
                    className="rounded-xl border border-[#d8e0e7] px-4 py-2 text-sm font-medium text-[#1f2937] transition hover:bg-[#f5f8fa]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(team._id)}
                    disabled={deletingId === team._id}
                    className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === team._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Teams;