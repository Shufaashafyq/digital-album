"use client";

import { useState } from "react";
import { Eye, EyeClosed, Loader2, LockKeyhole, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { changePasswordSchema } from "@/validations/auth";

type SettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ChangePasswordFormValues = z.infer<
  typeof changePasswordSchema
>;

export function SettingsDialog({
  open,
  onOpenChange,
}: SettingsDialogProps) {
  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<
    ChangePasswordFormValues
  > = async (data) => {
    try {
      const response = await fetch(
        "/api/account/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update your password."
        );
      }

      reset();

      toast.success("Password updated successfully!", {
        description:
          "Your account password has been changed.",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      toast.error("Password update failed", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      deleteConfirmation.trim().toUpperCase() !==
      "DELETE"
    ) {
      toast.error('Please type "DELETE" to confirm.');
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(
        "/api/account",
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to delete your account."
        );
      }

      toast.success("Account deleted successfully.");

      setDeleteConfirmation("");
      setDeleteDialogOpen(false);
      onOpenChange(false);

      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error(
        "Delete account error:",
        error
      );

      toast.error("Account deletion failed", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again.",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || deleteLoading) {
      return;
    }

    reset();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!isSubmitting && !deleteLoading) {
            if (!value) {
              reset();
            }

            onOpenChange(value);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col border-[#E8C9C3] bg-[#FFF9F7] sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2DDD8] text-[#B2456E]">
                <LockKeyhole className="h-5 w-5" />
              </div>

              <div>
                <DialogTitle className="text-2xl text-[#552619]">
                  Account Settings
                </DialogTitle>

                <DialogDescription className="text-sm leading-6 text-[#8B665B]">
                  Manage your password and account security.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto pr-2">

          <div className="space-y-5">
            {/* Change Password */}
            <section>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-[#552619]">
                  Change Password
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#8B665B]">
                  Choose a strong password to keep your
                  account secure.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3"
                noValidate
              >
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="currentPassword"
                    className="text-sm font-medium text-[#552619]"
                  >
                    Current Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      aria-invalid={
                        !!errors.currentPassword
                      }
                      {...register(
                        "currentPassword"
                      )}
                      className={`
                        h-11
                        border-[#E8C9C3]
                        bg-white
                        pr-11
                        text-[#552619]
                        shadow-none
                        focus-visible:ring-[#B2456E]
                        ${
                          errors.currentPassword
                            ? "border-[#E8A8B5] focus-visible:ring-[#C84B5E]"
                            : ""
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          (current) => !current
                        )
                      }
                      disabled={isSubmitting}
                      aria-label={
                        showCurrentPassword
                          ? "Hide current password"
                          : "Show current password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B665B] transition hover:text-[#B2456E] disabled:opacity-50"
                    >
                      {showCurrentPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeClosed className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {errors.currentPassword && (
                    <p className="text-xs text-[#C84B5E]">
                      {
                        errors.currentPassword
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-[#552619]"
                  >
                    New Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      aria-invalid={
                        !!errors.newPassword
                      }
                      {...register("newPassword")}
                      className={`
                        h-11
                        border-[#E8C9C3]
                        bg-white
                        pr-11
                        text-[#552619]
                        shadow-none
                        focus-visible:ring-[#B2456E]
                        ${
                          errors.newPassword
                            ? "border-[#E8A8B5] focus-visible:ring-[#C84B5E]"
                            : ""
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(
                          (current) => !current
                        )
                      }
                      disabled={isSubmitting}
                      aria-label={
                        showNewPassword
                          ? "Hide new password"
                          : "Show new password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B665B] transition hover:text-[#B2456E] disabled:opacity-50"
                    >
                      {showNewPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeClosed className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="text-[10px] leading-3.5 text-[#9A756B]/70">
                    At least 8 characters with uppercase,
                    lowercase, number, and special character.
                  </p>

                  {errors.newPassword && (
                    <p className="text-xs text-[#C84B5E]">
                      {
                        errors.newPassword
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-[#552619]"
                  >
                    Confirm New Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      aria-invalid={
                        !!errors.confirmPassword
                      }
                      {...register(
                        "confirmPassword"
                      )}
                      className={`
                        h-11
                        border-[#E8C9C3]
                        bg-white
                        pr-11
                        text-[#552619]
                        shadow-none
                        focus-visible:ring-[#B2456E]
                        ${
                          errors.confirmPassword
                            ? "border-[#E8A8B5] focus-visible:ring-[#C84B5E]"
                            : ""
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      disabled={isSubmitting}
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B665B] transition hover:text-[#B2456E] disabled:opacity-50"
                    >
                      {showConfirmPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeClosed className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="text-xs text-[#C84B5E]">
                      {
                        errors.confirmPassword
                          .message
                      }
                    </p>
                  )}
                </div>

                {/* Save Password */}
                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-10 rounded-lg bg-[#B2456E] px-5 text-sm font-medium text-white hover:bg-[#963A5D]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </section>

            

            <Separator className="bg-[#E8C9C3]" />

            {/* Danger Zone */}
            <section>
              <div className="mb-4">
                <h2 className="text-base font-semibold text-[#9E3A55]">
                  Account Actions
                </h2>

                <p className="mt-1 text-xs leading-5 text-[#8B665B]">
                  Permanently delete your account and all
                  associated albums, pages, and photos.
                </p>
              </div>

              <div className="rounded-xl border border-[#E8A8B5] bg-[#FBE0E4] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-[#9E3A55]">
                      Delete Account
                    </p>

                    <p className="mt-1 text-xs text-[#9E3A55]/75">
                      This action cannot be undone.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      setDeleteConfirmation("");
                      setDeleteDialogOpen(true);
                    }}
                    disabled={isSubmitting}
                    className="shrink-0"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </section>
          </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={
                isSubmitting || deleteLoading
              }
              className="border-[#C9B4AC] bg-[#E7E7E7] text-[#552619] hover:bg-[#DCDCDC]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(value) => {
          if (!deleteLoading) {
            setDeleteDialogOpen(value);

            if (!value) {
              setDeleteConfirmation("");
            }
          }
        }}
      >
        <DialogContent className="border-[#E8A8B5] bg-[#FFF9F7] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#9E3A55]">
              Delete your account?
            </DialogTitle>

            <DialogDescription className="leading-6 text-[#8B665B]">
              This permanently removes your account and
              all associated albums, photos, and pages.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Label
              htmlFor="delete-confirmation"
              className="text-sm font-medium text-[#552619]"
            >
              Type{" "}
              <span className="font-bold text-[#9E3A55]">
                DELETE
              </span>{" "}
              to confirm
            </Label>

            <Input
              id="delete-confirmation"
              type="text"
              value={deleteConfirmation}
              onChange={(event) =>
                setDeleteConfirmation(
                  event.target.value
                )
              }
              placeholder='Type "DELETE"'
              autoFocus
              disabled={deleteLoading}
              className="border-[#E8A8B5] bg-white text-[#552619] focus-visible:ring-[#C84B5E]"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
              }}
              disabled={deleteLoading}
              className="border-[#C9B4AC] bg-[#E7E7E7] text-[#552619] hover:bg-[#DCDCDC]"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={
                deleteLoading ||
                deleteConfirmation
                  .trim()
                  .toUpperCase() !== "DELETE"
              }
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}