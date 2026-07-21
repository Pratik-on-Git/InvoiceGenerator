"use client";

interface AddProps {
  label: string;
  onAdd: () => void;
  inline?: boolean;
  /**
   * Visual weight. `primary` is a solid filled bar for top-level structural
   * adds (a new deliverable, feature, term…); `secondary` is a soft dashed bar
   * for nested adds inside an existing block (a line, a row…). Defaults to
   * `secondary` for inline adds and `primary` otherwise.
   */
  variant?: "primary" | "secondary";
}

/** Full-width "add" button shown under a repeatable list while editing. */
export function AddButton({ label, onAdd, inline, variant }: AddProps) {
  const weight = variant ?? (inline ? "secondary" : "primary");
  return (
    <div className={inline ? "add-slot inline" : "add-slot"}>
      <button type="button" className={`ctrl-add ctrl-add--${weight}`} onClick={onAdd}>
        <span className="ctrl-add-plus" aria-hidden="true">+</span>
        {label}
      </button>
    </div>
  );
}

interface RemoveProps {
  onRemove: () => void;
  title?: string;
}

/** Small circular "remove" button; appears on hover of a `.rowwrap` item. */
export function RemoveButton({ onRemove, title = "Remove" }: RemoveProps) {
  return (
    <button
      type="button"
      className="ctrl-remove"
      title={title}
      aria-label={title}
      onClick={onRemove}
      // keep the doc's contentEditable from swallowing the click
      onMouseDown={(e) => e.preventDefault()}
    >
      ×
    </button>
  );
}
