import { MoreHorizontal, Eye, Pencil, Share2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AlbumCardProps = {
  id: string;
  title: string;
  slug: string;
  photoCount: number;
  coverImage: string | null;
};

export function AlbumCard({
  id,
  title,
  slug,
  photoCount,
  coverImage,
}: AlbumCardProps) {
  return (
    <article className="group">
      {/* Album Cover */}
      <div className="relative aspect-square overflow-hidden rounded-sm bg-[#EED2CC] shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
  <Link
    href={`/albums/${slug}`}
    className="absolute inset-0 z-10"
    aria-label={`Open ${title}`}
  />

  {coverImage ? (
    <Image
      src={coverImage}
      alt={`${title} album cover`}
      fill
      className="object-cover transition duration-500 group-hover:scale-105"
    />
  ) : (
    <div className="flex h-full items-center justify-center">
      <span className="text-sm text-[#9A756B]">
        Cover photo
      </span>
    </div>
  )}
        {/* Gradient */}
        <div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/50 to-transparent" />

        {/* Album title */}
        <h3 className="absolute left-5 top-5 max-w-[70%] text-lg font-semibold text-white drop-shadow-md">
          {title}
        </h3>

        {/* Album actions */}
        <div className="absolute right-4 top-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#552619] shadow-sm backdrop-blur-sm transition hover:bg-white focus:outline-none">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Album actions</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 border-[#E8C9C3] bg-[#FFF9F7]"
            >
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold text-[#552619]">
                  Album actions
                </p>
              </div>

              <DropdownMenuSeparator className="bg-[#E8C9C3]" />

              <DropdownMenuItem className="flex cursor-pointer items-center gap-2 font-medium text-[#552619]">
                <Eye className="h-4 w-4" />
                Open album
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center gap-2 font-medium text-[#552619]">
                <Pencil className="h-4 w-4" />
                Edit album
              </DropdownMenuItem>

              <DropdownMenuItem className="flex cursor-pointer items-center gap-2 font-medium text-[#552619]">
                <Share2 className="h-4 w-4" />
                Share album
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#E8C9C3]" />

              <DropdownMenuItem
                variant="destructive"
                className="flex cursor-pointer items-center gap-2 font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Delete album
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Hover button */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-end p-5">
          <span className="translate-y-2 rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-[#552619] opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            Open album →
          </span>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-[#8B665B]">
          {photoCount} {photoCount === 1 ? "photo" : "photos"}
        </p>

        <p className="text-xs text-[#A47C72]">
          Recently updated
        </p>
      </div>
    </article>
  );
}