import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import { api } from "../utils/api";
import { timeAgo } from "../utils/format";
import { formatDay } from "../utils/dates";
import { Card, CardHeader, ConfirmDialog, Skeleton } from "./ui";

const isPhone = (s) => s.kind === "app" || /iOS|Android/.test(s.device);

// Where this account is signed in; sign out one device or all the others
export default function SignedInDevices() {
  const [sessions, setSessions] = useState(null);
  const [busy, setBusy] = useState(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const load = () =>
    api("/user/sessions").then(({ ok, data }) =>
      setSessions(ok ? data.data : [])
    );
  useEffect(() => {
    load();
  }, []);

  const signOut = async (s) => {
    setBusy(s._id);
    const { ok, data, error } = await api(`/user/sessions/${s._id}`, {
      method: "DELETE",
    });
    setBusy(null);
    if (!ok) return toast.error(error);
    toast.success(data.message);
    setSessions((list) => list.filter((x) => x._id !== s._id));
  };

  const signOutOthers = async () => {
    setBusy("all");
    const { ok, data, error } = await api("/user/sessions/sign-out-others", {
      method: "POST",
    });
    setBusy(null);
    setConfirmAll(false);
    if (!ok) return toast.error(error);
    toast.success(data.message);
    load();
  };

  const others = (sessions || []).filter((s) => !s.current);

  return (
    <Card>
      <CardHeader
        title="Signed-in devices"
        subtitle="Signing out a device takes effect on its next action."
        action={
          others.length > 0 && (
            <button
              className="btn btn-sm btn-ghost border-base-300"
              onClick={() => setConfirmAll(true)}
            >
              Sign out all others
            </button>
          )
        }
      />
      {!sessions ? (
        <div className="p-5">
          <Skeleton className="h-16" />
        </div>
      ) : (
        <ul className="divide-y divide-base-300 pt-2">
          {sessions.map((s) => {
            const Icon = isPhone(s) ? Smartphone : Monitor;
            return (
              <li key={s._id} className="flex items-center gap-3 px-5 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-base-200 text-base-content/60">
                  <Icon size={17} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {s.device}
                    {s.current && (
                      <span className="badge badge-sm badge-success badge-soft">
                        This device
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-base-content/55">
                    {s.current
                      ? "Active now"
                      : `Active ${timeAgo(s.lastSeenAt)}`}
                    {" · signed in "}
                    {formatDay(s.signedInAt, { year: undefined })}
                    {s.ip && ` · IP ${s.ip}`}
                  </p>
                </div>
                {!s.current && (
                  <button
                    className="btn btn-sm btn-ghost border-base-300 max-sm:btn-square"
                    onClick={() => signOut(s)}
                    disabled={busy === s._id}
                    aria-label={`Sign out ${s.device}`}
                  >
                    {busy === s._id ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <LogOut size={15} />
                    )}
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                )}
              </li>
            );
          })}
          {sessions.length === 0 && (
            <li className="px-5 py-4 text-sm text-base-content/60">
              This device signed in before device tracking was added. Sign out
              and back in to see it here.
            </li>
          )}
        </ul>
      )}
      <ConfirmDialog
        open={confirmAll}
        title="Sign out all other devices?"
        message="Every other browser and phone signed in to this account will need to sign in again. This device stays signed in."
        confirmLabel="Sign out others"
        loading={busy === "all"}
        onConfirm={signOutOthers}
        onCancel={() => setConfirmAll(false)}
      />
    </Card>
  );
}
