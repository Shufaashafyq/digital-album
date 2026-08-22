"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type PhotoDeleteButtonProps = {
  photoId: string;
};

export function PhotoDeleteButton({
  photoId,
}: PhotoDeleteButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this photo from your album?"
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/photos/${photoId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Failed to delete photo."
        );
      }

      await router.replace(router.asPath);
    } catch (error) {
      console.error("Delete photo error:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to delete photo."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        handleDelete();
      }}
      disabled={deleting}
      aria-label="Delete photo"
      title="Delete photo"
      className="
        absolute
        right-2
        top-2
        z-30
        h-7
        w-7
        rounded-full
        p-0
        opacity-0
        shadow-md
        transition-all
        duration-200
        hover:scale-105
        group-hover:opacity-100
      "
    >
      <X className="h-4 w-4" />
    </Button>
  );
}