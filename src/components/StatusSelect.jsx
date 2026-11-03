import { STATUSES } from "../constants/statuses.js";

export default function StatusSelect({ value, onChange }) {
  return (
    <div className="chips" role="group" aria-label="Listening status">
      {STATUSES.map((s) => (
        <button
          key={s.id}
          className={`chip ${value === s.id ? "on" : ""}`}
          onClick={() => onChange(s.id)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
