"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import {Camera, ImagePlus, Upload, X, } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Caveat_Brush } from "next/font/google";

type PhotoUploaderProps = {
  albumId: string;
  sticker?: boolean;
};

type UploadResult = {
  secure_url: string;
  public_id: string;
};

const caveatBrush = Caveat_Brush({
  weight: "400",
  subsets: ["latin"],
});

export function PhotoUploader({
  albumId,
  sticker = false,
}: PhotoUploaderProps) {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [dragDropEnabled, setDragDropEnabled] =
    useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const [previews, setPreviews] = useState<
    { file: File; url: string }[]
  >([]);

  useEffect(() => {
    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviews(newPreviews);

    return () => {
      newPreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [files]);

  const addFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      return;
    }

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      setError("Please choose image files only.");
      return;
    }

    setFiles((currentFiles) => {
      const existingKeys = new Set(
        currentFiles.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`
        )
      );

      const newFiles = imageFiles.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;

        return !existingKeys.has(key);
      });

      return [...currentFiles, ...newFiles];
    });

    setError("");
    setDialogOpen(true);
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    addFiles(selectedFiles);

    event.target.value = "";
  };

  const handleDragOver = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    if (!dragDropEnabled || loading) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    if (!dragDropEnabled || loading) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    if (!dragDropEnabled || loading) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const droppedFiles = Array.from(
      event.dataTransfer.files
    );

    addFiles(droppedFiles);
  };

  const removeFile = (index: number) => {
    setFiles((currentFiles) =>
      currentFiles.filter(
        (_, fileIndex) => fileIndex !== index
      )
    );
  };

  const uploadToCloudinary = async (
    file: File
  ): Promise<UploadResult> => {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary configuration is missing."
      );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message ||
          "Cloudinary upload failed."
      );
    }

    return data;
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Choose at least one photo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const uploadedPhotos = await Promise.all(
        files.map(async (file) => {
          const result = await uploadToCloudinary(file);

          return {
            imageUrl: result.secure_url,
            cloudinaryPublicId: result.public_id,
          };
        })
      );

      const response = await fetch(
        `/api/albums/${albumId}/photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            photos: uploadedPhotos,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save photos."
        );
      }

      setFiles([]);
      setError("");
      setDialogOpen(false);
      setDragDropEnabled(false);
      setIsDragging(false);

      await router.replace(router.asPath);
    } catch (error) {
      console.error("Photo upload error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while uploading."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (loading) {
      return;
    }

    setDialogOpen(open);

    if (!open) {
      setError("");
      setDragDropEnabled(false);
      setIsDragging(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Add memories trigger */}
      {sticker ? (
        <label
          className="group relative block cursor-pointer"
          aria-label="Add memories"
        >
          <Image
            src="/stickers/jukebox.png"
            alt=""
            width={90}
            height={90}
            priority
            className="
              transition-all
              duration-200
              group-hover:scale-105
              group-active:scale-95
            "
          />

          <span
            className={`${caveatBrush.className}
            pointer-events-none
            absolute
            inset-0
            flex
            flex-col
            items-center
            justify-center
            text-center
            text-xl
            font-bold
            leading-[0.9]
           `}
           style={{
            color: "#552619",
            WebkitTextStroke: "0.5px #FFFFFF",
            paintOrder: "stroke fill",
           }}
          >
            <span>Add</span>
            <br/>
            <span>Memories</span>
          </span>

          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <label
          className="
            group
            flex
            h-10
            cursor-pointer
            items-center
            gap-1.5
            rounded-r-lg
            rounded-l-md
            border
            border-[#D8BFAF]
            bg-[#FFF9F7]
            px-3
            shadow-md
            transition-all
            hover:-translate-x-1
            hover:shadow-lg
          "
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F2DDD8] text-[#B2456E] transition group-hover:scale-105">
            <Camera className="h-4 w-4" />
          </div>

          <span className="whitespace-nowrap text-xs font-medium text-[#552619] transition group-hover:text-[#B2456E]">
            Add memories
          </span>

          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}

      {/* Preview dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
      >
        <DialogContent className="border-[#E8C9C3] bg-[#FFF9F7] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#552619]">
              Add memories
            </DialogTitle>

            <DialogDescription className="text-sm leading-6 text-[#8B665B]">
              Choose the photos you want to add to this
              album. You can preview and remove them before
              uploading.
            </DialogDescription>
          </DialogHeader>

          {/* Drag & drop option */}
          <div className="flex items-center justify-between rounded-xl border border-[#E8C9C3] bg-white px-3 py-3">
            <div>
              <p className="text-sm font-medium text-[#552619]">
                Drag & drop photos
              </p>

              <p className="mt-0.5 text-xs text-[#9A756B]">
                Turn this on to drop photos into the
                preview area.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setDragDropEnabled(
                  (current) => !current
                );
                setIsDragging(false);
              }}
              className={`
                h-9
                rounded-lg
                px-3
                text-xs
                font-medium
                transition-all
                ${
                  dragDropEnabled
                    ? "border-[#B2456E] bg-[#FBEAE7] text-[#B2456E] hover:bg-[#FBEAE7]"
                    : "border-[#D8BFAF] bg-[#FFF9F7] text-[#552619] hover:bg-[#FFF5F3]"
                }
              `}
            >
              {dragDropEnabled
                ? "Enabled"
                : "Enable"}
            </Button>
          </div>

          {/* Preview / drop zone */}
          {files.length > 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                space-y-4
                rounded-xl
                p-2
                transition-all
                ${
                  dragDropEnabled && isDragging
                    ? "border-2 border-dashed border-[#B2456E] bg-[#FBEAE7]"
                    : dragDropEnabled
                      ? "border-2 border-dashed border-[#DDAEA3] bg-[#FBEAE7]/40"
                      : "border-2 border-transparent"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#552619]">
                  {files.length} photo
                  {files.length === 1 ? "" : "s"} selected
                </p>

                <p className="text-xs text-[#A47C72]">
                  {dragDropEnabled && isDragging
                    ? "Drop photos here"
                    : "Preview"}
                </p>
              </div>

              <div className="max-h-[52vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {previews.map((preview, index) => (
                    <div
                      key={`${preview.file.name}-${preview.file.lastModified}`}
                      className="group relative overflow-hidden rounded-xl border border-[#E8C9C3] bg-white shadow-sm"
                    >
                      <div className="relative aspect-square">
                        <img
                          src={preview.url}
                          alt={preview.file.name}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeFile(index)
                          }
                          disabled={loading}
                          aria-label={`Remove ${preview.file.name}`}
                          className="
                            absolute
                            right-2
                            top-2
                            flex
                            h-7
                            w-7
                            items-center
                            justify-center
                            rounded-full
                            bg-white/90
                            text-[#552619]
                            opacity-0
                            shadow-md
                            transition-all
                            group-hover:opacity-100
                            hover:bg-[#B2456E]
                            hover:text-white
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="px-2.5 py-2">
                        <p
                          className="truncate text-xs text-[#8B665B]"
                          title={preview.file.name}
                        >
                          {preview.file.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                flex
                h-40
                flex-col
                items-center
                justify-center
                rounded-xl
                border-2
                border-dashed
                text-center
                transition-all
                ${
                  dragDropEnabled && isDragging
                    ? "border-[#B2456E] bg-[#FBEAE7]"
                    : "border-[#DDAEA3] bg-[#FBEAE7]/50"
                }
              `}
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F2DDD8] text-[#B2456E]">
                <ImagePlus className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-[#552619]">
                {dragDropEnabled && isDragging
                  ? "Drop your photos here"
                  : "No photos selected"}
              </p>

              <p className="mt-1 text-xs text-[#9A756B]">
                {dragDropEnabled
                  ? "Drag image files into this area"
                  : "Choose photos from your device"}
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-[#F2DDD8] px-3 py-2 text-sm text-[#B2456E]">
              {error}
            </p>
          )}

          <DialogFooter className="flex-wrap gap-2 sm:justify-end">
            {/* Cancel */}
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setFiles([]);
                setError("");
                setDialogOpen(false);
                setDragDropEnabled(false);
                setIsDragging(false);
              }}
              className="
                h-10
                rounded-lg
                border-[#E8C9C3]
                bg-white
                px-5
                text-[#552619]
                hover:bg-[#FFF5F3]
              "
            >
              Cancel
            </Button>

            {/* Select more photos */}
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                document
                  .getElementById(
                    "select-more-photos"
                  )
                  ?.click();
              }}
              className="
                h-10
                rounded-r-lg
                rounded-l-md
                border-[#D8BFAF]
                bg-[#FFF9F7]
                px-3
                text-xs
                font-medium
                text-[#552619]
                shadow-md
                transition-all
                hover:-translate-x-1
                hover:bg-[#FFF9F7]
                hover:text-[#B2456E]
                hover:shadow-lg
              "
            >
              <span className="mr-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#F2DDD8] text-[#B2456E]">
                <Camera className="h-3.5 w-3.5" />
              </span>

              Select more photos
            </Button>

            <input
              id="select-more-photos"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Add photos */}
            <Button
              type="button"
              disabled={
                loading || files.length === 0
              }
              onClick={handleUpload}
              className="
                h-10
                rounded-r-lg
                rounded-l-md
                border
                border-[#B2456E]
                bg-[#B2456E]
                px-3
                text-xs
                font-medium
                text-white
                shadow-md
                transition-all
                hover:-translate-x-1
                hover:bg-[#963A5D]
                hover:shadow-lg
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <span className="mr-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                <Upload className="h-3.5 w-3.5 text-white" />
              </span>

              {loading
                ? "Adding..."
                : `Add ${files.length} photo${
                    files.length === 1
                      ? ""
                      : "s"
                  }`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}