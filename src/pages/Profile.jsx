import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail, Phone, ShieldCheck, LogOut } from "lucide-react";
import { updateProfile, logout } from "../utils/redux/profileSlice";
import { removeAllTransactions } from "../utils/redux/transactionSlice";
import { api } from "../utils/api";
import { capitalize } from "../utils/format";
import { Card, CardHeader, PageHeader, Field } from "../components/ui";
import { Avatar } from "../components/AppShell";

const NAME_RE = /^[a-zA-Z ]{3,20}$/;

export default function Profile() {
  const user = useSelector((s) => s.profile.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: capitalize(user.firstName || ""),
    lastName: capitalize(user.lastName || ""),
    phoneNumber: user.phoneNumber || "",
    gender: user.gender || "",
    photo: user.photo || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!NAME_RE.test(form.firstName.trim())) e.firstName = "3–20 letters";
    if (!NAME_RE.test(form.lastName.trim())) e.lastName = "3–20 letters";
    if (form.phoneNumber && !/^\d{10}$/.test(form.phoneNumber)) e.phoneNumber = "10 digits";
    if (form.photo && !/^https:\/\/\S+$/.test(form.photo)) e.photo = "Must be an https:// link";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const save = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const { ok, data, error } = await api("/user/profile/update", {
      method: "PATCH",
      body: {
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        gender: form.gender || undefined, // "" isn't a valid gender: leave it unchanged
      },
    });
    setSaving(false);
    if (!ok) return toast.error(error);
    dispatch(updateProfile(data.user));
    toast.success("Profile updated");
  };

  const signOut = async () => {
    await api("/logout", { method: "POST" });
    dispatch(logout());
    dispatch(removeAllTransactions());
    toast.success("Signed out");
    navigate("/");
  };

  const preview = { ...user, ...form };

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your personal details and account security." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card className="flex flex-col items-center p-6 text-center">
            <Avatar user={preview} size="size-24 text-2xl" />
            <h2 className="mt-4 text-lg font-semibold">{form.firstName} {form.lastName}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-base-content/60"><Mail size={14} /> {user.email}</p>
            {form.phoneNumber && <p className="mt-1 flex items-center gap-1.5 text-sm text-base-content/60"><Phone size={14} /> {form.phoneNumber}</p>}
          </Card>
          <Card>
            <CardHeader title="Security" />
            <div className="space-y-4 p-5 text-sm">
              <p className="flex gap-3 text-base-content/70">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-success" />
                Your session is kept in a secure, http-only cookie and ends automatically after a day.
              </p>
              <button className="btn btn-outline btn-error btn-sm w-full" onClick={signOut}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader title="Personal details" subtitle="Email can't be changed." />
          <form onSubmit={save} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2" noValidate>
            <Field label="First name" error={errors.firstName} htmlFor="p-first">
              <input id="p-first" className={`input w-full ${errors.firstName ? "input-error" : ""}`} value={form.firstName} onChange={set("firstName")} maxLength={20} />
            </Field>
            <Field label="Last name" error={errors.lastName} htmlFor="p-last">
              <input id="p-last" className={`input w-full ${errors.lastName ? "input-error" : ""}`} value={form.lastName} onChange={set("lastName")} maxLength={20} />
            </Field>
            <Field label="Phone" error={errors.phoneNumber} htmlFor="p-phone">
              <input id="p-phone" type="tel" inputMode="numeric" className={`input w-full ${errors.phoneNumber ? "input-error" : ""}`} value={form.phoneNumber} onChange={(e) => /^\d{0,10}$/.test(e.target.value) && set("phoneNumber")(e)} />
            </Field>
            <Field label="Gender" htmlFor="p-gender">
              <select id="p-gender" className="select w-full" value={form.gender} onChange={set("gender")}>
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Photo URL" hint="Link to an image (https://…). Without one, your initials are shown." error={errors.photo} htmlFor="p-photo">
                <input id="p-photo" type="url" className={`input w-full ${errors.photo ? "input-error" : ""}`} placeholder="https://…" value={form.photo} onChange={set("photo")} />
              </Field>
            </div>
            <div className="flex justify-end sm:col-span-2">
              <button className="btn btn-primary" disabled={saving}>
                {saving && <span className="loading loading-spinner loading-sm" />}
                Save changes
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
