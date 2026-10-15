import { Github, Linkedin } from "lucide-react";

const LINKS = {
  github: "https://github.com/dheeraj08mishra/budgetwise",
  linkedin: "https://linkedin.com/in/dheerajmishra462",
};

// Copyright, author and social links: on every page and the login screen
export default function SiteFooter({ className = "" }) {
  return (
    <footer
      className={`flex flex-col items-center justify-between gap-3 text-xs text-base-content/55 sm:flex-row ${className}`}
    >
      <p>
        © {new Date().getFullYear()} BudgetWise · Made by{" "}
        <a
          href={LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover font-medium text-base-content/75"
        >
          Dheeraj Mishra
        </a>
      </p>
      <div className="flex items-center gap-1">
        <a
          href={LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-xs btn-square"
          aria-label="BudgetWise on GitHub"
        >
          <Github size={16} />
        </a>
        <a
          href={LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-xs btn-square"
          aria-label="Dheeraj Mishra on LinkedIn"
        >
          <Linkedin size={16} />
        </a>
      </div>
    </footer>
  );
}
