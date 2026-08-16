"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";

type PhotoUploaderProps = {
  albumId: string;
};

type UploadResult = {
  secure_url: string;
  public_id: string;
};

export function PhotoUploader({
  albumId,
}: PhotoUploaderProps) {
  const router = useRouter();

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = Array.from(
      event.target.files ?? []
    );

    setFiles(selectedFiles);
    setError("");
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
      setError("Please choose at least one photo.");
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

  return (
    <div className="mt-8 rounded-2xl border border-[#E8C9C3] bg-white/60 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#552619]">
            Add photos
          </p>

          <p className="mt-1 text-xs text-[#8B665B]">
            Choose one or several memories from your device.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#E8C9C3] bg-white px-4 text-sm font-medium text-[#552619] transition hover:bg-[#FFF5F3]">
            <ImagePlus className="h-4 w-4 text-[#B2456E]" />
            Choose photos

            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <Button
            type="button"
            disabled={loading || files.length === 0}
            onClick={handleUpload}
            className="h-10 rounded-lg px-5 text-sm font-medium text-white"
            style={{ backgroundColor: "#B2456E" }}
          >
            {loading
              ? "Uploading..."
              : `Add ${files.length || ""} photo${
                  files.length === 1 ? "" : "s"
                }`}
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <p className="mt-3 text-xs text-[#8B665B]">
          {files.length} photo
          {files.length === 1 ? "" : "s"} selected
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg bg-[#F2DDD8] px-3 py-2 text-sm text-[#B2456E]">
          {error}
        </p>
      )}
    </div>
  );
}