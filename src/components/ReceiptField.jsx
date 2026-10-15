import { useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  Paperclip,
  FileText,
  ExternalLink,
  Trash2,
  Upload,
} from "lucide-react";
import {
  RECEIPT_ACCEPT,
  receiptUrl,
  fileSize,
  isPdf,
  uploadReceipt,
  removeReceipt,
} from "../utils/receipts";

// Receipt of one saved transaction. Attach / replace / remove happen right
// away; onChange(receipt | null) reports the new state. Removing asks
// inline (this sits inside the edit dialog, so no second dialog).
export default function ReceiptField({ txn, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const receipt = txn.receipt;

  const pick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // picking the same file again still fires
    if (!file) return;
    setBusy(true);
    try {
      const saved = await uploadReceipt(txn._id, file);
      onChange(saved);
      toast.success(receipt ? "Receipt replaced" : "Receipt attached");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await removeReceipt(txn._id);
      onChange(null);
      toast.success("Receipt removed");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  const fileInput = (
    <input
      ref={input}
      type="file"
      accept={RECEIPT_ACCEPT}
      className="hidden"
      onChange={pick}
      aria-label="Receipt file"
    />
  );

  if (!receipt) {
    return (
      <>
        {fileInput}
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-field border border-dashed border-base-300 px-4 py-3 text-left text-sm hover:bg-base-200"
          onClick={() => input.current.click()}
          disabled={busy}
        >
          {busy ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <Paperclip size={18} className="text-base-content/50" aria-hidden />
          )}
          <span>
            <span className="block font-medium">
              {busy ? "Uploading…" : "Attach a receipt"}
            </span>
            <span className="block text-xs text-base-content/55">
              Photo or PDF, up to 5 MB
            </span>
          </span>
        </button>
      </>
    );
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-field border border-error/40 bg-error/5 px-3 py-2 text-sm">
        <span>Remove this receipt? The file is deleted.</span>
        <span className="flex gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setConfirming(false)}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-error btn-sm"
            onClick={remove}
            disabled={busy}
          >
            {busy && <span className="loading loading-spinner loading-xs" />}
            Remove
          </button>
        </span>
      </div>
    );
  }

  const url = receiptUrl(txn);
  return (
    <div className="flex items-center gap-3 rounded-field border border-base-300 p-2">
      {fileInput}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-base-200"
        aria-label="Open receipt"
      >
        {isPdf(receipt) ? (
          <FileText size={22} className="text-base-content/50" />
        ) : (
          <img src={url} alt="" className="size-full object-cover" />
        )}
      </a>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{receipt.name}</p>
        <p className="text-xs text-base-content/55">
          {isPdf(receipt) ? "PDF" : "Image"} · {fileSize(receipt.size)}
        </p>
      </div>
      <div className="flex shrink-0 gap-0.5">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost btn-sm btn-square"
          aria-label="View receipt"
          title="View"
        >
          <ExternalLink size={15} />
        </a>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => input.current.click()}
          disabled={busy}
          aria-label="Replace receipt"
          title="Replace"
        >
          {busy ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            <Upload size={15} />
          )}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square text-error"
          onClick={() => setConfirming(true)}
          disabled={busy}
          aria-label="Remove receipt"
          title="Remove"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
