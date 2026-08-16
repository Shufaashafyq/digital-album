"use client";

import Image from "next/image";
import { Info } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AboutDialog() {
  return (
    <Dialog>
      <DialogTrigger
        className="group relative ml-auto block cursor-pointer rounded-full outline-none"
        aria-label="Learn more about Digital Album"
      >
        <Image
          src="/stickers/butterfly.png"
          alt="Butterfly sticker"
          width={100}
          height={100}
          className="h-20 w-20 object-contain transition duration-300 group-hover:-translate-y-1 group-hover:rotate-3 group-hover:scale-105"
        />

        {/* Small info indicator */}
        <span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[#E8C9C3] bg-white text-[#B2456E] shadow-sm">
          <Info className="h-3.5 w-3.5" />
        </span>
      </DialogTrigger>

      <DialogContent className="border-[#E8C9C3] bg-[#FFF9F7] sm:max-w-md">
        <DialogHeader>
          {/* Title + Camera sticker */}
          <div className="flex items-center gap-4">
            <DialogTitle className="text-2xl text-[#552619]">
              About Digital Album
            </DialogTitle>

            <Image
              src="/stickers/camera.png"
              alt=""
              width={70}
              height={70}
              className="h-14 w-14 shrink-0 -rotate-2 object-contain"
            />
          </div>

          <DialogDescription className="pt-3 text-sm leading-7 text-[#8B665B]">
            Nowadays we rarely print the pictures we take from our phone
            cameras or digital cameras unless it's a polaroid camera — in
            this case you do own the physical picture.
            <br />
            <br />
            Thousands of photos we take just end up laying in our phone's
            camera rolls. I just do not bring myself to create albums and
            categorize my pics in albums. I imagine it must be the same for
            everyone else.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}