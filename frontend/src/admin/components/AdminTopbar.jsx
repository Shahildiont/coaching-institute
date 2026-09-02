    function AdminTopbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d8e0e7] bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-4 lg:px-8">
        <div>
          <p className="text-sm font-medium text-[#46637f]">Admin Panel</p>
          <h1 className="text-2xl font-bold text-[#1f2937]">
            Institute Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-[#d8e0e7] px-4 py-2 text-sm font-medium text-[#1f2937] transition hover:bg-[#f5f8fa]">
            Notifications
          </button>
          <button className="rounded-xl bg-[#46637f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#395269]">
            Admin
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;