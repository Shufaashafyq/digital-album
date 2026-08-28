"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProfileDialog } from "@/components/dialogs/ProfileDialog";

export function DashboardHeader() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (response.ok) {
          setProfileImage(
            data.user.profileImage ?? null
          );
        }
      } catch (error) {
        console.error(
          "Failed to load profile image:",
          error
        );
      }
    };

    loadProfileImage();
  }, []);

  const handleProfileUpdated = (user: {
    profileImage: string | null;
  }) => {
    setProfileImage(user.profileImage);
  };

  return (
    <header className="mb-16 flex items-center justify-between">
      {/* Logo */}
      <div>
        <p
          className="relative -top-7 text-xs font-bold uppercase tracking-[0.18em]"
          style={{ color: "#B2456E" }}
        >
          Digital Album
        </p>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none">
          <Avatar className="h-12 w-12 border border-[#E8C9C3] transition hover:ring-2 hover:ring-[#B2456E]/20">
            <AvatarImage
              src={profileImage || "/default-pfp.jpg"}
              alt="Profile"
            />

            <AvatarFallback
              className="text-sm font-medium"
              style={{
                backgroundColor: "#F2DDD8",
                color: "#552619",
              }}
            >
              S
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 overflow-hidden border-[#D8BFAF] bg-[#EED2CC] p-0"
        >
          <div className="grainy p-2">
            {/* Account heading */}
            <div className="px-2 py-1.5">
              <p className="text-sm font-semibold text-[#552619]">
                My Account
              </p>

              <p className="text-xs text-[#8B665B]">
                Manage your account
              </p>
            </div>

            <DropdownMenuSeparator className="bg-[#D8BFAF]" />

            <DropdownMenuItem
              className="cursor-pointer font-medium text-[#552619] focus:bg-white/20 focus:text-[#552619]"
              onClick={() => setProfileOpen(true)}
            >
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              className="cursor-pointer font-medium text-[#552619] focus:bg-white/20 focus:text-[#552619]"
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-[#D8BFAF]" />

            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer font-medium text-[#B2456E] focus:bg-[#B2456E]/10 focus:text-[#B2456E]"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onProfileUpdated={handleProfileUpdated}
      />
    </header>
  );
}