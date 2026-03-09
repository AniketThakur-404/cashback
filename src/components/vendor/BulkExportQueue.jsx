import React, { useState, useEffect } from "react";
import {
  Archive,
  CheckCircle2,
  Clock3,
  Download,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
} from "lucide-react";

const formatTimestamp = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatElapsed = (startIso) => {
  if (!startIso) return null;
  const start = new Date(startIso).getTime();
  if (Number.isNaN(start)) return null;
  const elapsed = Math.max(0, Math.floor((Date.now() - start) / 1000));
  if (elapsed < 60) return `${elapsed}s`;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  if (mins < 60) return `${mins}m ${secs}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
};

const formatDuration = (startIso, endIso) => {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return null;
  const secs = Math.max(0, Math.floor((end - start) / 1000));
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  if (mins < 60) return `${mins}m ${rem}s`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
};

const statusMeta = {
  completed: {
    icon: CheckCircle2,
    badgeClass:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    label: "Ready",
  },
  processing: {
    icon: LoaderCircle,
    badgeClass:
      "border-primary/20 bg-primary/10 text-primary dark:text-primary",
    label: "Processing",
  },
  queued: {
    icon: Clock3,
    badgeClass:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300",
    label: "Queued",
  },
  failed: {
    icon: TriangleAlert,
    badgeClass:
      "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-300",
    label: "Failed",
  },
  default: {
    icon: Archive,
    badgeClass:
      "border-gray-500/20 bg-gray-500/10 text-gray-600 dark:text-gray-300",
    label: "Export",
  },
};

function BulkExportQueue({
  jobs,
  isLoading,
  error,
  onRefresh,
  onDownload,
  downloadingJobId,
  onCancel,
  cancellingJobId,
  onDelete,
  deletingJobId,
}) {
  const [, setTick] = useState(0);
  const hasActiveJobs = jobs.some(
    (j) => j.status === "processing" || j.status === "queued",
  );
  useEffect(() => {
    if (!hasActiveJobs) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [hasActiveJobs]);
  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            Background Export Queue
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Large QR exports continue in the background and download when ready.
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-zinc-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
        >
          <RefreshCw
            size={14}
            className={isLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
            No background exports yet.
          </div>
        ) : (
          jobs.map((job) => {
            const meta = statusMeta[job.status] || statusMeta.default;
            const Icon = meta.icon;
            const progress =
              typeof job.progressPercent === "number" ? job.progressPercent : 0;

            return (
              <div
                key={job.id}
                className="rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/60 p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${meta.badgeClass}`}
                    >
                      <Icon
                        size={18}
                        className={job.status === "processing" ? "animate-spin" : ""}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {job.scopeLabel || "QR Export"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {job.totalQrs?.toLocaleString?.() || job.totalQrs || 0} QRs
                        {" | "}
                        {job.partCount > 1 ? `${job.partCount} parts` : "Single file"}
                        {" | "}
                        {formatTimestamp(job.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:text-gray-200">
                      {meta.label}
                    </span>
                    {job.isReady && (
                      <button
                        type="button"
                        onClick={() => onDownload(job)}
                        disabled={downloadingJobId === job.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15 disabled:opacity-60 transition-colors"
                      >
                        {downloadingJobId === job.id ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        {downloadingJobId === job.id ? "Downloading..." : "Download"}
                      </button>
                    )}
                    {(job.status === "processing" || job.status === "queued") && (
                      <button
                        type="button"
                        onClick={() => typeof onCancel === 'function' && onCancel(job)}
                        disabled={cancellingJobId === job.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-60 transition-colors"
                      >
                        {cancellingJobId === job.id ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          "Cancel"
                        )}
                      </button>
                    )}
                    {(job.status === "completed" || job.status === "failed") && (
                      <button
                        type="button"
                        onClick={() => typeof onDelete === 'function' && onDelete(job)}
                        disabled={deletingJobId === job.id}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-800 p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                        title="Remove from queue"
                      >
                        {deletingJobId === job.id ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Archive size={16} />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>
                      {job.processedQrs?.toLocaleString?.() || job.processedQrs || 0}
                      {" / "}
                      {job.totalQrs?.toLocaleString?.() || job.totalQrs || 0}
                    </span>
                    <span className="flex items-center gap-2">
                      {(job.status === "processing" || job.status === "queued") && (
                        <span className="font-mono text-primary dark:text-primary">
                          ⏱ {formatElapsed(job.startedAt || job.createdAt) || "—"}
                        </span>
                      )}
                      {(job.status === "completed" || job.status === "failed") && (
                        (() => {
                          const dur = formatDuration(job.startedAt || job.createdAt, job.completedAt);
                          return dur ? (
                            <span className="font-mono text-gray-500 dark:text-gray-400">
                              ⏱ took {dur}
                            </span>
                          ) : null;
                        })()
                      )}
                      <span>{progress}%</span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-800">
                    <div
                      className={`h-full rounded-full ${job.status === "failed"
                        ? "bg-rose-500"
                        : job.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-primary"
                        }`}
                      style={{ width: `${Math.max(6, progress || 0)}%` }}
                    />
                  </div>
                </div>

                {job.errorMsg && (
                  <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-700 dark:text-rose-300">
                    {job.errorMsg}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default BulkExportQueue;
