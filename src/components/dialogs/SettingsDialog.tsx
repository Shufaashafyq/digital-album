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

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (data) => {
    try {
      const response = await fetch("/api/account/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update your password.");
      }

      reset();

      toast.success("Password updated successfully!", {
        description: "Your account password has been changed.",
      });
    } catch (error) {
      console.error("Change password error:", error);

      toast.error("Password update failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation.trim().toUpperCase() !== "DELETE") {
      toast.error('Please type "DELETE" to confirm.');
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete your account.");
      }

      toast.success("Account deleted successfully.");

      setDeleteConfirmation("");
      setDeleteDialogOpen(false);
      onOpenChange(false);

      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("Delete account error:", error);

      toast.error("Account deletion failed", {
        description: error instanceof Error ? error.message : "Please try again.",
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
        <DialogContent className="border-[#E8C9C3] bg-[#FFF9F7] sm:max-w-105">
          <DialogHeader className="gap-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2DDD8] text-[#B2456E]">
                <LockKeyhole className="h-4 w-4" />
              </div>

              <div>
                <DialogTitle className="text-2xl text-[#552619]">
                  Account Settings
                </DialogTitle>

                <DialogDescription className="-mt-1 text-sm leading-5 text-[#8B665B]">
                  Manage your password and account security.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3">
            <section>
              <div className="mb-2.5">
                <h2 className="text-sm font-semibold text-[#552619]">
                  Change Password
                </h2>

                <p className="mt-0.5 text-xs leading-4 text-[#8B665B]">
                  Choose a strong password to keep your account secure.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5" noValidate>
                <div className="space-y-1">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-[#552619]">
                    Current Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.currentPassword}
                      {...register("currentPassword")}
                      className={`h-9 border-[#E8C9C3] bg-white pr-10 text-[#552619] shadow-none focus-visible:ring-[#B2456E] ${errors.currentPassword ? "border-[#E8A8B5] focus-visible:ring-[#C84B5E]" : ""}`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((current) => !current)}
                      disabled={isSubmitting}
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B665B] transition hover:text-[#B2456E] disabled:opacity-50"
                    >
                      {showCurrentPassword ? <Eye className="h-3.5 w-3.5" /> : <EyeClosed className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {errors.currentPassword && (
                    <p className="text-xs text-[#C84B5E]">
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-[#552619]">
                    New Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.newPassword}
                      {...register("newPassword")}
                      className={`h-9 border-[#E8C9C3] bg-white pr-10 text-[#552619] shadow-none focus-visible:ring-[#B2456E] ${errors.newPassword ? "border-[#E8A8B5] focus-visible:ring-[#C84B5E]" : ""}`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      disabled={isSubmitting}
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B665B] transition hover:text-[#B2456E] disabled:opacity-50"
                    >
                      {showNewPassword ? <Eye className="h-3.5 w-3.5" /> : <EyeClosed className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <p className="text-xs leading-4 text-[#9A756B]/70">
                    At least 8 characters with uppercase, lowercase, number, and special character.
                  </p>

                  {errors.newPassword && (
                    <p className="text-xs text-[#C84B5E]">
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#552619]">
                    Confirm New Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.confirmPassword}
                      {...register("confirmPassword")}
                      className={`h-9 border-[#E8C9C3] bg-white pr-10 text-[#552619] shadow-none focus-visible:ring-[#B2456E] ${errors.confirmPassword ? "border-[#E8A8B5] focus-visible:ring-[#C84B5E]" : ""}`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      disabled={isSubmitting}
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8B665B] transition hover:text-[#B2456E] disabled:opacity-50"
                    >
                      {showConfirmPassword ? <Eye className="h-3.5 w-3.5" /> : <EyeClosed className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="text-xs text-[#C84B5E]">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-0.5">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 rounded-lg bg-[#B2456E] px-4 text-sm font-medium text-white hover:bg-[#963A5D]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </form>
            </section>

            <div className="py-0.5">
              <Separator className="bg-[#E8C9C3]" />
            </div>

            <section>
              <div className="mb-2.5">
                <h2 className="text-sm font-semibold text-[#9E3A55]">
                  Account Actions
                </h2>

                <p className="mt-0.5 text-xs leading-4 text-[#8B665B]">
                  Permanently delete your account and all associated albums, pages, and photos.
                </p>
              </div>

              <div className="rounded-lg border border-[#E8A8B5] bg-[#FBE0E4] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#9E3A55]">
                      Delete Account
                    </p>

                    <p className="mt-0.5 text-xs text-[#9E3A55]/75">
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
                    className="h-8 shrink-0 rounded-lg px-3 text-sm"
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </section>
          </div>

          <DialogFooter className="pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || deleteLoading}
              className="h-9 border-[#C9B4AC] bg-[#E7E7E7] px-4 text-sm text-[#552619] hover:bg-[#DCDCDC]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        <DialogContent className="border-[#E8A8B5] bg-[#FFF9F7] sm:max-w-sm">
          <DialogHeader className="gap-0">
            <DialogTitle className="text-2xl text-[#9E3A55]">
              Delete your account?
            </DialogTitle>

            <DialogDescription className="-mt-1 text-sm leading-5 text-[#8B665B]">
              This permanently removes your account and all associated albums, photos, and pages. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5">
            <Label htmlFor="delete-confirmation" className="text-sm font-medium text-[#552619]">
              Type <span className="font-bold text-[#9E3A55]">DELETE</span> to confirm
            </Label>

            <Input
              id="delete-confirmation"
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder='Type "DELETE"'
              autoFocus
              disabled={deleteLoading}
              className="h-9 border-[#E8A8B5] bg-white text-[#552619] focus-visible:ring-[#C84B5E]"
            />
          </div>

          <DialogFooter className="pt-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
              }}
              disabled={deleteLoading}
              className="h-9 border-[#C9B4AC] bg-[#E7E7E7] px-4 text-sm text-[#552619] hover:bg-[#DCDCDC]"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteConfirmation.trim().toUpperCase() !== "DELETE"}
              className="h-9 px-3 text-sm"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
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


