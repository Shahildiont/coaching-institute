function OfflineScreen() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.111 16.404a5 5 0 0 1 7.778 0M5.05 13.343a9.5 9.5 0 0 1 13.9 0M1.99 10.282a14 14 0 0 1 20.02 0M12 20h.01"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3l18 18"
            />
          </svg>
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          No Internet
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          You are offline
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          It looks like your internet connection is unavailable right now.
          Please reconnect and try again.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
          <p className="text-sm font-semibold text-slate-900">
            Things you can try
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Check your Wi-Fi or mobile data.</li>
            <li>Reconnect to the internet and wait a few seconds.</li>
            <li>Refresh the page after your connection returns.</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Retry
        </button>
      </div>
    </section>
  );
}

export default OfflineScreen;