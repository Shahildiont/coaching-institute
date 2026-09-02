import { useEffect, useMemo, useRef, useState } from "react";
import { bulkUploadQuestions } from "../../services/questionService";

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

function BulkQuestionUploadModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const acceptedExtensionsText = ".csv, .xlsx, .xls";

  const fileMeta = useMemo(() => {
    if (!selectedFile) return null;
    return {
      name: selectedFile.name,
      size: formatFileSize(selectedFile.size),
      type: selectedFile.type || "Unknown",
    };
  }, [selectedFile]);

  function resetState() {
    setSelectedFile(null);
    setDragActive(false);
    setUploading(false);
    setError("");
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    if (uploading) return;
    resetState();
    onClose?.();
  }

  function validateFile(file) {
    if (!file) return "Please select a file";

    const validExtensions = [".csv", ".xlsx", ".xls"];
    const lowerName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some((ext) =>
      lowerName.endsWith(ext)
    );

    if (!hasValidExtension) {
      return "Only CSV, XLSX, and XLS files are allowed";
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size must be 5MB or less";
    }

    return "";
  }

  function handleFileSelect(file) {
    const validationError = validateFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      setResult(null);
      return;
    }

    setSelectedFile(file);
    setError("");
    setResult(null);
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  useEffect(() => {
  if (!isOpen) return;

  const originalBodyOverflow = document.body.style.overflow;
  const originalHtmlOverflow = document.documentElement.style.overflow;

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
  };
}, [isOpen]);

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Please select a file before uploading");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setResult(null);

      const response = await bulkUploadQuestions(selectedFile);
      setResult(response);

      if (response?.success) {
        onSuccess?.(response);
      }
    } catch (err) {
      setError(err.message || "Failed to upload questions");
    } finally {
      setUploading(false);
    }
  }

  function handleChooseFileClick() {
    fileInputRef.current?.click();
  }

  if (!isOpen) return null;

  const details = result?.details || {};
  const errorRows = details.errors || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          {/* <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Bulk Upload
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Upload Questions
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Upload multiple questions using CSV or Excel. Your file should include
              question text, category, difficulty, marks, duration, options,
              correct answer, and optional explanation/status.
            </p>
          </div> */}

          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close bulk upload modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                  dragActive
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-300 bg-white"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleInputChange}
                  className="hidden"
                />

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3v12" />
                    <path d="m7 10 5-5 5 5" />
                    <path d="M5 21h14" />
                  </svg>
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  Drag and drop your file here
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Supported formats: {acceptedExtensionsText}
                </p>

                <button
                  type="button"
                  onClick={handleChooseFileClick}
                  className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Choose File
                </button>

                {fileMeta && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <p className="text-sm font-semibold text-slate-900">
                      Selected file
                    </p>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p>
                        <span className="font-semibold text-slate-800">Name:</span>{" "}
                        {fileMeta.name}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Size:</span>{" "}
                        {fileMeta.size}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-800">Type:</span>{" "}
                        {fileMeta.type}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={resetState}
                      disabled={uploading}
                      className="mt-4 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Remove File
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? "Uploading..." : "Upload Questions"}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={uploading}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-lg font-bold text-slate-900">
                  Upload result
                </h3>

                {!result ? (
                  <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                    Upload a file to see import summary and row errors here.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    <div
                      className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                        result.success
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {result.message || "Upload completed"}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total rows
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {details.totalRows || 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Valid rows
                        </p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {details.validCount || 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                          Created
                        </p>
                        <p className="mt-2 text-2xl font-bold text-emerald-700">
                          {details.createdCount || 0}
                        </p>
                      </div>

                      <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-200">
                        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                          Invalid
                        </p>
                        <p className="mt-2 text-2xl font-bold text-red-700">
                          {details.invalidCount || 0}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200">
                      <div className="border-b border-slate-200 px-4 py-3">
                        <h4 className="text-sm font-bold text-slate-900">
                          Row errors
                        </h4>
                      </div>

                      {errorRows.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                          No row-level errors found.
                        </div>
                      ) : (
                        <div className="max-h-[320px] overflow-y-auto">
                          <div className="divide-y divide-slate-200">
                            {errorRows.map((item, index) => (
                              <div key={`${item.row}-${index}`} className="px-4 py-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                                    Row {item.row}
                                  </span>
                                  {item.questionText ? (
                                    <span className="text-sm font-semibold text-slate-800">
                                      {item.questionText}
                                    </span>
                                  ) : (
                                    <span className="text-sm font-semibold text-slate-500">
                                      No question text
                                    </span>
                                  )}
                                </div>

                                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                                  {(item.errors || []).map((rowError, errorIndex) => (
                                    <li key={errorIndex} className="flex gap-2">
                                      <span className="mt-[2px] h-1.5 w-1.5 rounded-full bg-red-500" />
                                      <span>{rowError}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={resetState}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Upload Another File
                      </button>

                      <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkQuestionUploadModal;