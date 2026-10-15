import { api } from "./api";
import { BASE_URL } from "./constants";

export const RECEIPT_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const TYPES = RECEIPT_ACCEPT.split(",");
const MAX_BYTES = 5 * 1024 * 1024;
const SHRINK_OVER_BYTES = 1.5 * 1024 * 1024;
const MAX_SIDE = 2000;

export const isPdf = (receipt) => receipt?.contentType === "application/pdf";

// Where the app shows a receipt from (uploadedAt busts the cache on replace)
export const receiptUrl = (txn) =>
  `${BASE_URL}/user/transaction/${txn._id}/receipt?v=${encodeURIComponent(
    txn.receipt?.uploadedAt || ""
  )}`;

export const fileSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Phone photos are often 3–8 MB: send a 2000px JPEG instead
async function shrink(file) {
  if (!file.type.startsWith("image/") || file.size <= SHRINK_OVER_BYTES) {
    return file;
  }
  try {
    const img = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // can't decode here: let the server decide
  }
}

// Checks, shrinks and uploads. Resolves to the saved receipt; throws an
// Error with a message to show.
export async function uploadReceipt(txnId, file) {
  if (!TYPES.includes(file.type)) {
    throw new Error("Receipts must be a JPG, PNG, WebP or PDF file.");
  }
  const body = await shrink(file);
  if (body.size > MAX_BYTES) throw new Error("Receipts can be up to 5 MB.");
  const name =
    body === file ? file.name : file.name.replace(/\.\w+$/, "") + ".jpg";
  const { ok, data, error } = await api(`/user/transaction/${txnId}/receipt`, {
    method: "PUT",
    body,
    headers: { "X-File-Name": encodeURIComponent(name) },
  });
  if (!ok) throw new Error(error);
  return data.receipt;
}

export async function removeReceipt(txnId) {
  const { ok, error } = await api(`/user/transaction/${txnId}/receipt`, {
    method: "DELETE",
  });
  if (!ok) throw new Error(error);
}
