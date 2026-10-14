import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Search, Plus, Inbox, X } from "lucide-react";
import { addTransaction } from "../utils/redux/transactionSlice";
import { api } from "../utils/api";
import { EXPENSE_CATEGORIES, CATEGORIES, isIncome } from "../utils/categories";
import { money } from "../utils/format";
import { todayString } from "../utils/dates";
import { Card, PageHeader, EmptyState, Skeleton } from "../components/ui";
import TransactionList, { sortTransactions } from "../components/TransactionList";

const PAGE = 25;
const SORTS = [
  { value: "", label: "Newest first" },
  { value: "oldestToNewest", label: "Oldest first" },
  { value: "highestToLowest", label: "Highest amount" },
  { value: "lowestToHighest", label: "Lowest amount" },
];

export default function Transactions() {
  const dispatch = useDispatch();
  const transactions = useSelector((s) => s.transaction.transactions);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [shown, setShown] = useState(PAGE);

  const filtersActive = query || category || fromDate || toDate || sort;

  // Debounced fetch whenever a filter changes
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      setLoading(true);
      const note = query.trim();
      if (note && !/^[a-zA-Z0-9\s]+$/.test(note)) {
        setLoading(false);
        return toast.error("Search supports letters, numbers and spaces.", { id: "search" });
      }
      const params = new URLSearchParams();
      if (note) params.set("note", note);
      if (category) params.set("category", category);
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);
      if (sort) params.set("sort", sort);
      const path = params.toString() ? `/filter?${params}` : "/user/transactions";
      const { ok, data, error } = await api(path);
      if (!alive) return;
      if (!ok) toast.error(error, { id: "filter" });
      dispatch(addTransaction(ok ? data.data.transactions : []));
      setShown(PAGE);
      setLoading(false);
    }, 300);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, category, fromDate, toDate, sort, dispatch]);

  const clear = () => {
    setQuery("");
    setCategory("");
    setFromDate("");
    setToDate("");
    setSort("");
  };

  const net = transactions.reduce((s, t) => s + (isIncome(t) ? t.amount : -t.amount), 0);
  // Date orders are grouped by day; amount sorts keep the server order, flat.
  // Sort before paging so "Show more" continues in the same order.
  const order = !sort ? "newest" : sort === "oldestToNewest" ? "oldest" : "server";
  const visible = sortTransactions(transactions, order).slice(0, shown);

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="Search, filter and edit everything you've recorded."
        actions={<Link to="/add" className="btn btn-primary btn-sm"><Plus size={16} /> Add</Link>}
      />

      <Card className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
          <label className="input w-full">
            <Search size={16} className="text-base-content/40" />
            <input type="search" placeholder="Search notes (e.g. rent)" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={100} aria-label="Search notes" />
          </label>
          <select className="select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORIES[c].label}</option>)}
          </select>
          <input type="date" className="input md:w-40" value={fromDate} max={toDate || todayString()} onChange={(e) => setFromDate(e.target.value)} aria-label="From date" />
          <input type="date" className="input md:w-40" value={toDate} min={fromDate} max={todayString()} onChange={(e) => setToDate(e.target.value)} aria-label="To date" />
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="text-base-content/60">
            {loading ? "Loading…" : (
              <>
                <span className="font-medium text-base-content">{transactions.length}</span> transaction{transactions.length === 1 ? "" : "s"}
                {transactions.length > 0 && <> · net <span className={`num font-medium ${net >= 0 ? "text-success" : "text-error"}`}>{net >= 0 ? "+" : "−"}{money(Math.abs(net))}</span></>}
              </>
            )}
          </span>
          {filtersActive && (
            <button className="btn btn-ghost btn-xs" onClick={clear}><X size={14} /> Clear filters</button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={filtersActive ? "No matching transactions" : "No transactions yet"}
            text={filtersActive ? "Try a different search or clear the filters." : "Add your first income or expense to get started."}
            action={filtersActive ? <button className="btn btn-sm" onClick={clear}>Clear filters</button> : <Link to="/add" className="btn btn-primary btn-sm"><Plus size={16} /> Add transaction</Link>}
          />
        ) : (
          <>
            <TransactionList transactions={visible} groupByDay={order !== "server"} order="server" />
            {shown < transactions.length && (
              <div className="border-t border-base-300 p-4 text-center">
                <button className="btn btn-sm" onClick={() => setShown((n) => n + PAGE)}>
                  Show more ({transactions.length - shown} left)
                </button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
