import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  Activity,
  ArrowLeftRight,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { api } from "../utils/api";
import { formatDay } from "../utils/dates";
import {
  Card,
  CardHeader,
  PageHeader,
  StatCard,
  Segmented,
  EmptyState,
  Skeleton,
} from "../components/ui";

const TYPES = [
  { value: "", label: "All" },
  { value: "bug", label: "Bugs" },
  { value: "feature", label: "Ideas" },
  { value: "suggestion", label: "Suggestions" },
  { value: "other", label: "Other" },
];
const BADGE = {
  bug: "badge-error",
  feature: "badge-primary",
  suggestion: "badge-info",
  other: "badge-ghost",
};

// Read-only overview for admins: usage numbers and user feedback
export default function Admin() {
  const isAdmin = useSelector((s) => s.profile.currentUser?.role === "admin");
  const [stats, setStats] = useState(null);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!isAdmin) return;
    api("/admin/stats").then(({ ok, data, error }) =>
      ok ? setStats(data) : toast.error(error)
    );
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    let alive = true;
    setFeedback(null);
    const q = new URLSearchParams({ page, limit: 10, ...(type && { type }) });
    api(`/admin/feedback?${q}`).then(({ ok, data, error }) => {
      if (!alive) return;
      if (!ok) toast.error(error);
      setFeedback(ok ? data : { data: [], pagination: {} });
    });
    return () => {
      alive = false;
    };
  }, [isAdmin, type, page]);

  if (!isAdmin) {
    return (
      <Card>
        <EmptyState
          icon={ShieldAlert}
          title="Admins only"
          text="This page is only available to administrators."
        />
      </Card>
    );
  }

  const count = (t) => (t ? stats?.feedback[t] : stats?.feedback.total);
  const p = feedback?.pagination || {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        subtitle="Read-only overview of usage and feedback."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats ? (
          <>
            <StatCard label="Users" icon={Users} value={stats.users} />
            <StatCard
              label="New this week"
              icon={UserPlus}
              tone="success"
              value={stats.newThisWeek}
            />
            <StatCard
              label="Active (30 days)"
              icon={Activity}
              tone="violet"
              value={stats.activeLast30Days}
              footer={
                <span className="text-xs text-base-content/50">
                  Added a transaction
                </span>
              }
            />
            <StatCard
              label="Transactions"
              icon={ArrowLeftRight}
              value={stats.transactions.toLocaleString("en-IN")}
            />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)
        )}
      </div>

      <Card>
        <CardHeader title="Feedback" subtitle="Newest first" />
        <div className="overflow-x-auto px-5 pt-4">
          <Segmented
            label="Feedback type"
            size="sm"
            options={TYPES.map((t) => ({
              value: t.value,
              label: stats ? `${t.label} (${count(t.value) ?? 0})` : t.label,
            }))}
            value={type}
            onChange={(v) => {
              setType(v);
              setPage(1);
            }}
          />
        </div>
        {!feedback ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : feedback.data.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No feedback here yet" />
        ) : (
          <ul className="mt-3 divide-y divide-base-300">
            {feedback.data.map((f) => (
              <li key={f._id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-base-content/55">
                  <span
                    className={`badge badge-sm badge-soft ${BADGE[f.type] || "badge-ghost"}`}
                  >
                    {TYPES.find((t) => t.value === f.type)?.label || f.type}
                  </span>
                  <span>
                    {f.user
                      ? `${f.user.name} · ${f.user.email}`
                      : "Deleted account"}
                  </span>
                  <span>· {formatDay(f.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-line">{f.text}</p>
              </li>
            ))}
          </ul>
        )}
        {p.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-base-300 px-5 py-3 text-sm">
            <button
              className="btn btn-sm btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage((n) => n - 1)}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-base-content/60">
              Page {page} of {p.totalPages}
            </span>
            <button
              className="btn btn-sm btn-ghost"
              disabled={page >= p.totalPages}
              onClick={() => setPage((n) => n + 1)}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
