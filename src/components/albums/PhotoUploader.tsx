"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { Camera, Upload } from "lucide-react";

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

    setFiles((currentFiles) => {
      const existingKeys = new Set(
        currentFiles.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`
        )
      );

      const newFiles = selectedFiles.filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;

        return !existingKeys.has(key);
      });

      return [...currentFiles, ...newFiles];
    });

    setError("");

    
    event.target.value = "";
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
    <div className="flex flex-col items-center">
      {/* Add memories tab */}
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

      {/* Selected photos */}
      {files.length > 0 && (
        <div className="mt-2 w-52 rounded-xl border border-[#E8C9C3] bg-[#FFF9F7] p-3 shadow-md">
          <p className="text-xs text-[#8B665B]">
            {files.length} photo
            {files.length === 1 ? "" : "s"} selected
          </p>

          <Button
            type="button"
            disabled={loading}
            onClick={handleUpload}
            className="mt-2 h-9 w-full rounded-lg bg-[#B2456E] text-xs text-white hover:opacity-90"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            {loading ? "Adding..." : "Add to album"}
          </Button>
        </div>
      )}

      {error && (
        <p className="mt-2 w-52 text-center text-xs text-[#B2456E]">
          {error}
        </p>
      )}
    </div>
  );
}

//need to change this into d dialog with preview of photos selected