function Students() {
  const students = [
    {
      name: "Aarav Sharma",
      course: "JEE Main",
      status: "Active",
      phone: "+91 98765 10001",
    },
    {
      name: "Ananya Gupta",
      course: "NEET",
      status: "Active",
      phone: "+91 98765 10002",
    },
    {
      name: "Riya Verma",
      course: "JEE Advanced",
      status: "Pending",
      phone: "+91 98765 10003",
    },
    {
      name: "Rahul Mehta",
      course: "Foundation",
      status: "Active",
      phone: "+91 98765 10004",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-[22px] border border-[#d8e0e7] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#1f2937]">Students</h2>
            <p className="mt-2 text-[#5f6b76]">
              Manage enrolled students and track their course details.
            </p>
          </div>

          <button className="rounded-xl bg-[#46637f] px-5 py-3 font-semibold text-white transition hover:bg-[#395269]">
            Add Student
          </button>
        </div>
      </div>

      <div className="rounded-[22px] border border-[#d8e0e7] bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#e4eaf0] text-left text-sm text-[#5f6b76]">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Course</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Phone</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index} className="border-b border-[#eef3f6]">
                  <td className="py-4 text-sm font-medium text-[#1f2937]">
                    {student.name}
                  </td>
                  <td className="py-4 text-sm text-[#5f6b76]">
                    {student.course}
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-[#eef3f6] px-3 py-1 text-xs font-semibold text-[#46637f]">
                      {student.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-[#5f6b76]">
                    {student.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Students;