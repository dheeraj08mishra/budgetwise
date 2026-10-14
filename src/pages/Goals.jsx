import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Plus, Target, Trash2, CircleCheck, PiggyBank } from "lucide-react";
import { setGoals } from "../utils/redux/goalSlice";
import { api } from "../utils/api";
import { money, percent } from "../utils/format";
import { Card, PageHeader, EmptyState, Skeleton, Modal, ConfirmDialog, Field } from "../components/ui";

const amountOk = (v) => /^\d*(\.\d{0,2})?$/.test(v);

function GoalCard({ goal, onAdd, onDelete }) {
  const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${goal.isCompleted ? "bg-success/10 text-success" : "bg-violet-500/10 text-violet-500"}`}>
          {goal.isCompleted ? <CircleCheck size={20} /> : <Target size={20} />}
        </span>
        <button className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-error" onClick={() => onDelete(goal)} aria-label={`Delete goal ${goal.title}`}>
          <Trash2 size={15} />
        </button>
      </div>
      <h3 className="mt-4 font-semibold">{goal.title}</h3>
      {goal.description && <p className="mt-0.5 line-clamp-2 text-sm text-base-content/60">{goal.description}</p>}

      <div className="mt-5">
        <div className="flex items-baseline justify-between">
          <span className="num text-xl font-semibold">{money(goal.currentAmount)}</span>
          <span className="num text-sm text-base-content/55">of {money(goal.targetAmount)}</span>
        </div>
        <progress className={`progress mt-2 h-2.5 w-full ${goal.isCompleted ? "progress-success" : "progress-primary"}`} value={pct} max="100" />
        <p className="num mt-1.5 text-xs text-base-content/55">
          {goal.isCompleted ? `Completed ${goal.completedAt ? new Date(goal.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}` : `${percent(pct)} · ${money(remaining)} to go`}
        </p>
      </div>

      <div className="mt-auto pt-5">
        {goal.isCompleted ? (
          <span className="badge badge-success badge-soft">Goal reached 🎉</span>
        ) : (
          <button className="btn btn-primary btn-sm w-full" onClick={() => onAdd(goal)}>
            <PiggyBank size={16} /> Add money
          </button>
        )}
      </div>
    </Card>
  );
}

export default function Goals() {
  const dispatch = useDispatch();
  const goals = useSelector((s) => s.goal.goals) || [];
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target: "" });
  const [adding, setAdding] = useState(null);
  const [addAmount, setAddAmount] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api("/goal/list").then(({ ok, data, error }) => {
      if (!ok) toast.error(error);
      dispatch(setGoals(data?.goals || []));
      setLoading(false);
    });
  }, [dispatch]);

  const create = async () => {
    const target = parseFloat(form.target);
    if (!form.title.trim()) return toast.error("Give your goal a name.");
    if (!(target > 0)) return toast.error("Enter a target amount greater than zero.");
    setBusy(true);
    const { ok, data, error } = await api("/goal/create", {
      method: "POST",
      body: { title: form.title.trim(), description: form.description.trim(), targetAmount: target },
    });
    setBusy(false);
    if (!ok) return toast.error(error);
    dispatch(setGoals([data.goal, ...goals]));
    toast.success("Goal created");
    setCreating(false);
    setForm({ title: "", description: "", target: "" });
  };

  const contribute = async () => {
    const n = parseFloat(addAmount);
    if (!(n > 0)) return toast.error("Enter an amount greater than zero.");
    setBusy(true);
    const { ok, data, error } = await api(`/goal/update/${adding._id}`, { method: "PATCH", body: { addAmount: n } });
    setBusy(false);
    if (!ok) return toast.error(error);
    dispatch(setGoals(goals.map((g) => (g._id === adding._id ? data.goal : g))));
    toast.success(data.message);
    setAdding(null);
    setAddAmount("");
  };

  const remove = async () => {
    setBusy(true);
    const { ok, error } = await api(`/goal/delete/${deleting._id}`, { method: "DELETE" });
    setBusy(false);
    if (!ok) return toast.error(error);
    dispatch(setGoals(goals.filter((g) => g._id !== deleting._id)));
    toast.success("Goal deleted");
    setDeleting(null);
  };

  const active = goals.filter((g) => !g.isCompleted);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const remainingFor = adding ? Math.max(adding.targetAmount - adding.currentAmount, 0) : 0;

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle={goals.length ? `${money(totalSaved)} saved across ${goals.length} goal${goals.length === 1 ? "" : "s"} · ${active.length} in progress` : "Save towards the things that matter."}
        actions={<button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}><Plus size={16} /> New goal</button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-64" />)}</div>
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState icon={Target} title="No goals yet" text="Set a target, like an emergency fund or a new laptop, and track every rupee you put towards it."
            action={<button className="btn btn-primary" onClick={() => setCreating(true)}><Plus size={18} /> Create your first goal</button>} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* In-progress goals first */}
          {[...active, ...goals.filter((g) => g.isCompleted)].map((g) => (
            <GoalCard key={g._id} goal={g} onAdd={(goal) => { setAdding(goal); setAddAmount(""); }} onDelete={setDeleting} />
          ))}
        </div>
      )}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New goal"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={create} disabled={busy}>{busy && <span className="loading loading-spinner loading-sm" />}Create goal</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" htmlFor="goal-title">
            <input id="goal-title" className="input w-full" maxLength={100} placeholder="e.g. Emergency fund" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </Field>
          <Field label="Target amount" htmlFor="goal-target">
            <label className="input w-full">
              <span className="text-base-content/50">₹</span>
              <input id="goal-target" inputMode="decimal" className="num" placeholder="1,00,000" value={form.target} onChange={(e) => amountOk(e.target.value) && setForm((f) => ({ ...f, target: e.target.value }))} />
            </label>
          </Field>
          <Field label="Description" hint="Optional" htmlFor="goal-desc">
            <textarea id="goal-desc" className="textarea w-full" rows={2} maxLength={500} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!adding}
        onClose={() => setAdding(null)}
        title={adding ? `Add to ${adding.title}` : ""}
        size="max-w-sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAdding(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={contribute} disabled={busy}>{busy && <span className="loading loading-spinner loading-sm" />}Add money</button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="num text-sm text-base-content/60">{money(remainingFor)} left to reach the target. This is recorded as savings this month.</p>
          <label className="input w-full">
            <span className="text-base-content/50">₹</span>
            <input inputMode="decimal" className="num text-lg" placeholder="0" value={addAmount} onChange={(e) => amountOk(e.target.value) && setAddAmount(e.target.value)} aria-label="Amount to add" />
          </label>
          <div className="flex flex-wrap gap-2">
            {[1000, 5000, 10000].filter((v) => v < remainingFor).map((v) => (
              <button key={v} type="button" className="btn btn-xs" onClick={() => setAddAmount(String(v))}>{money(v)}</button>
            ))}
            {remainingFor > 0 && <button type="button" className="btn btn-xs btn-primary btn-soft" onClick={() => setAddAmount(String(remainingFor))}>Remaining {money(remainingFor)}</button>}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete this goal?"
        message={`"${deleting?.title}" will be removed. Contributions you already made stay in your transactions.`}
        loading={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
