"use client";

import { useState } from "react";

type PhotoCaptionProps = {
  photoId: string;
  caption: string | null;
};

export function PhotoCaption({
  photoId,
  caption: initialCaption,
}: PhotoCaptionProps) {
  const [caption, setCaption] = useState(initialCaption ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const saveCaption = async () => {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption: caption.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to save caption."
        );
      }

      setCaption(data.photo.caption ?? "");
      setEditing(false);
    } catch (error) {
      console.error("Save caption error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save caption."
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setCaption(initialCaption ?? "");
    setError("");
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="mt-4 w-full max-w-md space-y-2">
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Write something about this memory..."
          rows={2}
          autoFocus
          className="w-full resize-none rounded-lg border border-[#E8C9C3] bg-[#FFF9F7] px-3 py-2 text-sm italic text-[#6B4A3D] outline-none placeholder:text-[#B99A91] focus:border-[#B2456E] focus:ring-2 focus:ring-[#B2456E]/20"
        />

        {error && (
          <p className="text-xs text-[#B2456E]">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={cancelEditing}
            disabled={saving}
            className="rounded-lg px-3 py-1.5 text-xs text-[#8B665B] transition hover:bg-[#FBEAE7] disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={saveCaption}
            disabled={saving}
            className="rounded-lg bg-[#B2456E] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="mt-4 w-full max-w-md text-center"
    >
      <p
        className={`font-serif text-sm italic transition ${
          caption
            ? "text-[#6B4A3D]"
            : "text-[#A47C72] hover:text-[#B2456E]"
        }`}
      >
        {caption
          ? `“${caption}”`
          : "Click to add a caption..."}
      </p>
    </button>
  );
}