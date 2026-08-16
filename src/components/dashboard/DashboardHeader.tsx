"use client";

import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardHeader() {
  return (
    <header className="mb-16 flex items-center justify-between">
      {/* Logo */}
      <div>
        <p
          className="text-sm font-bold uppercase tracking-[0.2em]"
          style={{ color: "#B2456E" }}
        >
          Digital Album
        </p>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none">
          <Avatar className="h-9 w-9 border border-[#E8C9C3] transition hover:ring-2 hover:ring-[#B2456E]/20">
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
          className="w-48 border-[#552619] bg-[#552619] text-white"
        >
          {/* Account heading */}
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium text-[#F2B8C6]">
              My Account
            </p>
            <p className="text-xs text-[#8B665B]">
              Manage your account
            </p>
          </div>

          <DropdownMenuSeparator className="bg-[#E8C9C3]" />

          <DropdownMenuItem className="cursor-pointer text-[#F2B8C6] focus:bg-white/10 focus:text-white">
            <User className="h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem className="cursor-pointer text-[#F2B8C6] focus:bg-white/10 focus:text-white">
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-white/20" />

          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer text-[#F2B8C6] focus:bg-white/10 focus:text-[#F2B8C6]"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}