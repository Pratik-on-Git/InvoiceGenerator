"use client";

interface AddProps {
  label: string;
  onAdd: () => void;
  inline?: boolean;
}

/** Dashed "add" button shown under a repeatable list while editing. */
export function AddButton({ label, onAdd, inline }: AddProps) {
  return (
    <div className={inline ? "add-slot inline" : "add-slot"}>
      <button type="button" className="ctrl-add" onClick={onAdd}>
        + {label}
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
