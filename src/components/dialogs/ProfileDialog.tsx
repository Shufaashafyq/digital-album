"use client";

import { useEffect, useRef, useState } from "react";
//import Image from "next/image";
import { Camera, Save, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProfileUpdated?: (user: UserProfile) => void;
};

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  profileImage: string | null;
};

type UploadResult = {
  secure_url: string;
  public_id: string;
};

export function ProfileDialog({
  open,
  onOpenChange,
  onProfileUpdated,
}: ProfileDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load profile.");
      }

      setProfile(data.user);
      setName(data.user.name ?? "");
      setProfileImage(data.user.profileImage ?? null);
      setSelectedFile(null);

      onProfileUpdated?.(data.user);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Load profile error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    setSelectedFile(file);
    setError("");

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const handleRemoveProfileImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);
    setSelectedFile(null);
    setProfileImage(null);
    setError("");
  };

  const uploadProfileImage = async (
    file: File
  ): Promise<UploadResult> => {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary configuration is missing.");
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
          "Failed to upload profile image."
      );
    }

    return data;
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      let newProfileImage = profileImage;

      if (selectedFile) {
        const uploadResult =
          await uploadProfileImage(selectedFile);

        newProfileImage = uploadResult.secure_url;
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          profileImage: newProfileImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update profile."
        );
      }

      setProfile(data.user);
      setName(data.user.name ?? "");
      setProfileImage(data.user.profileImage ?? null);
      setSelectedFile(null);

      onProfileUpdated?.(data.user);

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Update profile error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) {
      return;
    }

    setError("");
    onOpenChange(false);
  };

  const displayedImage =
    imagePreview ||
    profileImage ||
    "/default-pfp.jpg";

  const initials =
    name.trim().charAt(0).toUpperCase() || "S";

  const hasChanges =
    name.trim() !== (profile?.name ?? "") ||
    profileImage !== (profile?.profileImage ?? null) ||
    !!selectedFile;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!saving) {
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="border-[#E8C9C3] bg-[#FFF9F7] sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2DDD8] text-[#B2456E]">
              <User className="h-5 w-5" />
            </div>

            <div>
              <DialogTitle className="text-2xl text-[#552619]">
                My Profile
              </DialogTitle>

              <DialogDescription className="text-sm leading-6 text-[#8B665B]">
                Manage your profile information and profile photo.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center text-sm text-[#8B665B]">
            Loading profile...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile photo */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="h-24 w-24 border-2 border-[#E8C9C3]">
                  <AvatarImage
                    src={displayedImage}
                    alt="Profile photo"
                  />

                  <AvatarFallback className="bg-[#F2DDD8] text-2xl text-[#552619]">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#FFF9F7] bg-[#B2456E] text-white shadow-md transition hover:bg-[#963A5D] disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Change profile photo"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="mt-2 text-xs font-medium text-[#B2456E] transition hover:underline"
              >
                Change profile photo
              </button>

              {(profileImage || imagePreview) && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleRemoveProfileImage}
                  className="mt-1 text-xs font-medium text-[#8B665B] transition hover:text-[#B2456E] hover:underline"
                >
                  Remove profile photo
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageChange}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-[#E8C9C3]" />

            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold text-[#552619]">
                  Personal Information
                </h2>

                <p className="mt-1 text-xs text-[#8B665B]">
                  Keep your account details up to date.
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="profile-name"
                  className="text-sm font-medium text-[#552619]"
                >
                  Name
                </Label>

                <Input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Your name"
                  disabled={saving}
                  className="border-[#E8C9C3] bg-white text-[#552619] placeholder:text-[#B99A91] focus-visible:ring-[#B2456E]"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="profile-email"
                  className="text-sm font-medium text-[#552619]"
                >
                  Email
                </Label>

                <Input
                  id="profile-email"
                  type="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="border-[#E8C9C3] bg-[#FBEAE7] text-[#8B665B]"
                />

                <p className="text-xs text-[#A47C72]">
                  Email cannot be changed here.
                </p>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-[#F2DDD8] px-3 py-2 text-sm text-[#B2456E]">
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={handleClose}
            className="h-11 rounded-lg border-[#E8C9C3] bg-[#FFE5B4] px-5 text-[#552619] hover:bg-[#FFF5F3]"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              loading ||
              saving ||
              !profile ||
              !hasChanges
            }
            onClick={handleSave}
            className="h-11 rounded-lg bg-[#B2456E] px-5 text-white shadow-sm transition-all hover:opacity-90"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}