import { useState } from "react";
import toast from "react-hot-toast";
import { Modal, Field, Segmented } from "./ui";
import { api } from "../utils/api";

const TYPES = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Idea" },
  { value: "suggestion", label: "Suggestion" },
  { value: "other", label: "Other" },
];

const FeedbackModal = ({ open, onClose }) => {
  const [text, setText] = useState("");
  const [type, setType] = useState("other");
  const [sending, setSending] = useState(false);

  const close = () => {
    setText("");
    setType("other");
    onClose();
  };

  const submit = async () => {
    if (!text.trim()) {
      toast.error("Please write a few words first.");
      return;
    }
    setSending(true);
    const { ok, error } = await api("/user/submitFeedback", {
      method: "POST",
      body: { feedbackText: text.trim(), feedbackType: type },
    });
    setSending(false);
    if (!ok) return toast.error(error);
    toast.success("Thanks! Your feedback was sent.");
    close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Send feedback"
      footer={
        <>
          <button className="btn btn-ghost" onClick={close}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={sending}>
            {sending && <span className="loading loading-spinner loading-sm" />}
            Send
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Segmented label="Feedback type" options={TYPES} value={type} onChange={setType} size="sm" />
        <Field label="Your message" hint={`${text.length}/500`} htmlFor="feedback-text">
          <textarea
            id="feedback-text"
            className="textarea w-full"
            rows={5}
            maxLength={500}
            placeholder="What's working, what isn't, what you'd love to see…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
};

export default FeedbackModal;
