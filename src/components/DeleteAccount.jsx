import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { api } from "../utils/api";
import { logout } from "../utils/redux/profileSlice";
import { removeAllTransactions } from "../utils/redux/transactionSlice";
import { clearOfflineData } from "../utils/pwa";
import { Card, CardHeader, Modal, Field } from "./ui";

// Permanently deletes the account; asks for the password again
export default function DeleteAccount() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const close = () => {
    setOpen(false);
    setPassword("");
  };

  const remove = async (e) => {
    e?.preventDefault();
    if (!password) return toast.error("Enter your password.");
    setBusy(true);
    const { ok, data, error } = await api("/user/account", {
      method: "DELETE",
      body: { password },
    });
    setBusy(false);
    if (!ok) return toast.error(error);
    clearOfflineData();
    dispatch(logout());
    dispatch(removeAllTransactions());
    toast.success(data.message, { duration: 6000 });
    navigate("/");
  };

  return (
    <Card className="border-error/30">
      <CardHeader
        title="Delete account"
        subtitle="Permanently deletes your account and everything in it."
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pt-3">
        <p className="max-w-md text-sm text-base-content/65">
          Transactions, receipts, recurring payments, goals, budgets and
          settings are all removed, and every device is signed out. This
          can&rsquo;t be undone. To keep a copy, use Export on the Dashboard
          first.
        </p>
        <button
          className="btn btn-outline btn-error btn-sm"
          onClick={() => setOpen(true)}
        >
          <Trash2 size={15} /> Delete account
        </button>
      </div>
      <Modal
        open={open}
        onClose={close}
        title="Delete your account?"
        footer={
          <>
            <button className="btn btn-ghost" onClick={close}>
              Cancel
            </button>
            <button
              className="btn btn-error"
              type="submit"
              form="delete-account"
              disabled={busy}
            >
              {busy && <span className="loading loading-spinner loading-sm" />}
              Delete my account
            </button>
          </>
        }
      >
        <form
          id="delete-account"
          onSubmit={remove}
          className="flex flex-col gap-4"
        >
          <p className="text-sm text-base-content/70">
            All your data is deleted right away and can&rsquo;t be recovered.
          </p>
          <Field label="Your password" htmlFor="delete-password">
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              className="input w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
        </form>
      </Modal>
    </Card>
  );
}
