"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteAlbumDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  albumId: string;
  albumTitle: string;
  onDeleted: () => void;
};

export function DeleteAlbumDialog({
  open,
  onOpenChange,
  albumId,
  albumTitle,
  onDeleted,
}: DeleteAlbumDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/albums/${albumId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete album."
        );
      }

      onOpenChange(false);
      onDeleted();
    } catch (error) {
      console.error("Delete album error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete album."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!deleting) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="border-[#E8C9C3] bg-[#FFF9F7] sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2DDD8] text-[#B2456E]">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle className="text-xl text-[#552619]">
                Delete album?
              </DialogTitle>

              <DialogDescription className="mt-1 text-sm leading-6 text-[#8B665B]">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#552619]">
                  "{albumTitle}"
                </span>
                ?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-xl border border-[#E8A8B5] bg-[#FBE0E4] px-4 py-3 text-sm leading-6 text-[#9E3A55]">
          This will permanently remove the album and
          its photos. This action cannot be undone.
        </div>

        {error && (
          <p className="rounded-lg bg-[#F2DDD8] px-3 py-2 text-sm text-[#B2456E]">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={deleting}
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-lg border-[#D1D5DB] bg-[#FFE5B4] px-5 text-[#4B5563] hover:bg-[#D1D5DB]"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="h-11 rounded-lg bg-[#C84B5E] px-5 text-white hover:bg-[#A83B4B]"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {deleting ? "Deleting..." : "Delete album"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}