"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PhotoDeleteButtonProps = {
  photoId: string;
};

export function PhotoDeleteButton({
  photoId,
}: PhotoDeleteButtonProps) {
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async () => {
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

      setDialogOpen(false);

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
    <>
      <Button
        type="button"
        variant="destructive"
        size="icon"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setDialogOpen(true);
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

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent className="border-[#E8C9C3] bg-[#FFF9F7]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#552619]">
              Delete this photo?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-[#8B665B]">
              This photo will be permanently removed from
              your album. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleting}
              className="
                border-[#D8BFAF]
                text-[#8B665B]
                hover:bg-[#FBEAE7]
              "
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="
                bg-[#B2456E]
                text-white
                hover:bg-[#963A5D]
              "
            >
              {deleting ? "Deleting..." : "Delete photo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}