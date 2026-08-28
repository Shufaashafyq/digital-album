"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { ImagePlus, Lock, Globe, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type AlbumData = {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  isPublic: boolean;
  coverImage: string | null;
};

type CreateAlbumDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  album?: AlbumData | null;
};

export function CreateAlbumDialog({
  open,
  onOpenChange,
  album = null,
}: CreateAlbumDialogProps) {
  const router = useRouter();

  const isEditMode = Boolean(album);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [coverPreview, setCoverPreview] =
    useState<string | null>(null);

  const [coverFile, setCoverFile] =
    useState<File | null>(null);

  const [removeExistingCover, setRemoveExistingCover] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fill the form when editing an existing album.
  useEffect(() => {
    if (!open) {
      return;
    }

    if (album) {
      setTitle(album.title);
      setDescription(album.description ?? "");
      setTheme(album.theme ?? "");
      setIsPublic(album.isPublic);
      setCoverPreview(album.coverImage ?? null);
      setCoverFile(null);
      setRemoveExistingCover(false);
      setError("");
    } else {
      setTitle("");
      setDescription("");
      setTheme("");
      setIsPublic(false);
      setCoverPreview(null);
      setCoverFile(null);
      setRemoveExistingCover(false);
      setError("");
    }
  }, [open, album]);

  const handleCoverChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setCoverFile(file);
    setRemoveExistingCover(false);

    if (coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    const imageUrl = URL.createObjectURL(file);
    setCoverPreview(imageUrl);

    event.target.value = "";
  };

  const removeCover = () => {
    if (coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setCoverPreview(null);
    setCoverFile(null);

    if (isEditMode && album?.coverImage) {
      setRemoveExistingCover(true);
    }
  };

  const uploadCoverImage = async (file: File) => {
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
        data.error?.message ??
          "Failed to upload image."
      );
    }

    return {
      secureUrl: data.secure_url as string,
      publicId: data.public_id as string,
    };
  };

  const resetForm = () => {
    if (coverPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }

    setTitle("");
    setDescription("");
    setTheme("");
    setIsPublic(false);
    setCoverPreview(null);
    setCoverFile(null);
    setRemoveExistingCover(false);
    setError("");
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      let coverImage: string | null =
        album?.coverImage ?? null;

      // Upload a new cover if one was selected.
      if (coverFile) {
        const uploadResult =
          await uploadCoverImage(coverFile);

        coverImage = uploadResult.secureUrl;
      }

      // Remove the old cover when requested.
      if (removeExistingCover && !coverFile) {
        coverImage = null;
      }

      const response = await fetch(
        isEditMode
          ? `/api/albums/${album!.id}`
          : "/api/albums",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            theme: theme.trim(),
            isPublic,
            coverImage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            `Failed to ${
              isEditMode
                ? "update"
                : "create"
            } album.`
        );
      }

      resetForm();
      onOpenChange(false);

      await router.replace(router.asPath);
    } catch (error) {
      console.error(
        isEditMode
          ? "Update album error:"
          : "Create album error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : `Something went wrong while ${
              isEditMode
                ? "updating"
                : "creating"
            } the album.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!loading) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="border-[#E8C9C3] bg-[#FFF9F7] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#552619]">
            {isEditMode
              ? "Edit album"
              : "Create a new album"}
          </DialogTitle>

          <DialogDescription className="text-sm leading-6 text-[#8B665B]">
            {isEditMode
              ? "Update your album details and save your changes."
              : "Give your memories a little place of their own."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#552619]">
              Cover photo
            </Label>

            {coverPreview ? (
              <div className="relative overflow-hidden rounded-xl border border-[#E8C9C3]">
                <Image
                  src={coverPreview}
                  alt="Album cover preview"
                  width={600}
                  height={300}
                  unoptimized
                  className="h-44 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={removeCover}
                  disabled={loading}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#552619] shadow-sm transition hover:bg-white disabled:opacity-60"
                  aria-label="Remove cover photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="cover"
                className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DDAEA3] bg-[#FBEAE7]/50 text-center transition hover:bg-[#FBEAE7]"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F2DDD8] text-[#B2456E]">
                  <ImagePlus className="h-5 w-5" />
                </div>

                <p className="text-sm font-medium text-[#552619]">
                  {isEditMode
                    ? "Change cover photo"
                    : "Add a cover photo"}
                </p>

                <p className="mt-1 text-xs text-[#9A756B]">
                  Choose a photo from your device
                </p>

                <input
                  id="cover"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="text-sm font-medium text-[#552619]"
            >
              Album name
            </Label>

            <Input
              id="title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Summer memories"
              required
              disabled={loading}
              className="border-[#E8C9C3] bg-white text-[#552619] placeholder:text-[#B99A91] focus-visible:ring-[#B2456E]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-[#552619]"
            >
              Description
              <span className="ml-1 font-normal text-[#A47C72]">
                (optional)
              </span>
            </Label>

            <Textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="A little story about these memories..."
              rows={3}
              disabled={loading}
              className="resize-none border-[#E8C9C3] bg-white text-[#552619] placeholder:text-[#B99A91] focus-visible:ring-[#B2456E]"
            />
          </div>

          {/* Theme */}
          <div className="space-y-2">
            <Label
              htmlFor="theme"
              className="text-sm font-medium text-[#552619]"
            >
              Theme
              <span className="ml-1 font-normal text-[#A47C72]">
                (optional)
              </span>
            </Label>

            <Input
              id="theme"
              value={theme}
              onChange={(event) =>
                setTheme(event.target.value)
              }
              placeholder="Summer, Birthday, Travel..."
              disabled={loading}
              className="border-[#E8C9C3] bg-white text-[#552619] placeholder:text-[#B99A91] focus-visible:ring-[#B2456E]"
            />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-[#552619]">
              Album visibility
            </Label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setIsPublic(false)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  !isPublic
                    ? "border-[#B2456E] bg-[#FBEAE7]"
                    : "border-[#E8C9C3] bg-white hover:bg-[#FFF5F3]"
                }`}
              >
                <Lock className="h-4 w-4 text-[#B2456E]" />

                <div>
                  <p className="text-sm font-medium text-[#552619]">
                    Private
                  </p>

                  <p className="text-xs text-[#8B665B]">
                    Only you can see it
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setIsPublic(true)}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  isPublic
                    ? "border-[#B2456E] bg-[#FBEAE7]"
                    : "border-[#E8C9C3] bg-white hover:bg-[#FFF5F3]"
                }`}
              >
                <Globe className="h-4 w-4 text-[#B2456E]" />

                <div>
                  <p className="text-sm font-medium text-[#552619]">
                    Public
                  </p>

                  <p className="text-xs text-[#8B665B]">
                    Anyone with the link can see it
                  </p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-[#F2DDD8] px-3 py-2 text-sm text-[#B2456E]">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="h-11 rounded-lg border-[#E8C9C3] bg-white px-5 text-[#552619] hover:bg-[#FFF5F3]"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-40 rounded-lg text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
              style={{
                backgroundColor: "#B2456E",
              }}
            >
              {loading
                ? isEditMode
                  ? "Saving changes..."
                  : "Creating album..."
                : isEditMode
                  ? "Save changes"
                  : "Create album"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}