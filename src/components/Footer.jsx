import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";

// DaisyUI + Heroicons (or use any SVG for icons)
const githubIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className="w-5 h-5"
    viewBox="0 0 24 24"
  >
    <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.96.58.1.79-.25.79-.56v-2.2c-3.2.69-3.87-1.54-3.87-1.54-.53-1.36-1.29-1.73-1.29-1.73-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.19 1.78 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.27-1.28-5.27-5.69 0-1.26.45-2.3 1.18-3.12-.12-.29-.52-1.45.11-3.02 0 0 .97-.31 3.18 1.19a10.95 10.95 0 012.9-.39c.98.01 1.97.13 2.9.39 2.21-1.51 3.18-1.19 3.18-1.19.63 1.57.23 2.73.11 3.02.73.81 1.18 1.85 1.18 3.12 0 4.42-2.71 5.39-5.29 5.67.41.36.77 1.08.77 2.19v3.25c0 .31.21.67.8.56C20.71 21.43 24 17.11 24 12.02 24 5.74 18.27.5 12 .5z" />
  </svg>
);

const linkedinIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className="w-5 h-5"
    viewBox="0 0 24 24"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.783-1.75-1.75s.783-1.75 1.75-1.75 1.75.783 1.75 1.75-.783 1.75-1.75 1.75zm15.25 11.268h-3v-5.604c0-1.337-.025-3.064-1.868-3.064-1.87 0-2.156 1.46-2.156 2.969v5.699h-3v-10h2.885v1.367h.041c.403-.764 1.386-1.566 2.852-1.566 3.054 0 3.619 2.011 3.619 4.627v5.572z" />
  </svg>
);
const Footer = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [textareaValue, setTextAreaValue] = useState("");
  const [feedbackType, setFeedbackType] = useState("other");
  const [loading, setLoading] = useState(false);

  const user = useSelector((store) => store.profile.currentUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textareaValue.trim()) {
      toast.error("Feedback cannot be empty.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(BASE_URL + "/user/submitFeedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          feedbackText: textareaValue.trim(),
          feedbackType: feedbackType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      toast.success(
        "Thank you for your feedback, we will surely look at this on priority"
      );
      setShowFeedback(false);
      setTextAreaValue("");
    } catch (error) {
      toast.error("Error submitting feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  const openFeedbackModal = () => {
    setShowFeedback(true);
    setTextAreaValue("");
    setFeedbackType("other");
  };

  return (
    <>
      <footer className="footer footer-center flex flex-col items-center p-6 bg-base-200 text-base-content gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl">
          <div className="flex flex-col sm:flex-row gap-2 items-center text-sm">
            <span>&copy; {new Date().getFullYear()} BudgetWise</span>
            <span className="hidden sm:inline">•</span>
            <span>All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span>
              Made by{" "}
              <a
                href="https://linkedin.com/in/dheerajmishra462"
                target="_blank"
                rel="noopener noreferrer"
                className="link link-hover font-medium text-primary"
              >
                Dheeraj Mishra
              </a>
            </span>
          </div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a
              href="https://github.com/dheeraj08mishra/budgetwise"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              aria-label="GitHub"
            >
              {githubIcon}
            </a>
            <a
              href="https://linkedin.com/in/dheerajmishra462"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
              aria-label="LinkedIn"
            >
              {linkedinIcon}
            </a>
            <button
              className="btn btn-primary btn-sm"
              onClick={openFeedbackModal}
            >
              Feedback
            </button>
          </div>
        </div>
      </footer>

      {showFeedback && (
        <dialog
          id="my_modal_feedback"
          className="modal modal-open"
          aria-modal="true"
          role="dialog"
          aria-labelledby="feedback-title"
        >
          <div className="modal-box w-full max-w-md">
            <button
              className="absolute top-2 right-3 text-2xl font-semibold"
              onClick={() => setShowFeedback(false)}
            >
              &times;
            </button>
            <h3 className="text-lg font-bold mb-2">Feedback</h3>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
              <select
                className="select select-neutral w-full mb-4"
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                disabled={loading}
              >
                <option value={"bug"}>Report a Bug</option>
                <option value={"suggestion"}>Suggestion</option>
                <option value={"feature"}>Feature Request</option>
                <option value={"other"}>Other</option>
              </select>

              <textarea
                name="feedback"
                className="textarea textarea-neutral w-full rounded-xl"
                placeholder="Your suggestions, issues, or feature requests..."
                rows={4}
                value={textareaValue}
                onChange={(e) => setTextAreaValue(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary rounded-xl w-full"
                disabled={loading || !textareaValue.trim()}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </form>
          </div>
        </dialog>
      )}
    </>
  );
};

export default Footer;
