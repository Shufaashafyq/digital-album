"use client";

import { useState } from "react";
import { MoreHorizontal, Eye, Pencil, Share2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { DeleteAlbumDialog } from "@/components/dialogs/DeleteAlbumDialog";
import { useRouter } from "next/router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateAlbumDialog } from "@/components/dialogs/CreateAlbumDialog";

type AlbumCardProps = {
  id: string;
  title: string;
  slug: string;
  photoCount: number;
  coverImage: string | null;
  description?: string | null;
  theme?: string | null;
  isPublic?: boolean;
};

type SelectedAlbum = {
  id: string;
  title: string;
  description: string | null;
  theme: string | null;
  isPublic: boolean;
  coverImage: string | null;
};

export function AlbumCard({
  id,
  title,
  slug,
  photoCount,
  coverImage,
  description = null,
  theme = null,
  isPublic = false,
}: AlbumCardProps) {
  console.log("Album:", title, "Cover:", coverImage);
  const [editAlbumOpen, setEditAlbumOpen] = useState(false);
  const router = useRouter();

  const [deleteAlbumOpen, setDeleteAlbumOpen] =
    useState(false);

  const selectedAlbum: SelectedAlbum = {
    id,
    title,
    description,
    theme,
    isPublic,
    coverImage,
  };

  return (
    <article className="group w-full max-w-70">
      {/* Album Cover */}
      <div className="relative aspect-square overflow-hidden rounded-4xl bg-[#EED2CC] shadow-md transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
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
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grainy flex h-full items-center justify-center">
            <span className="relative z-10 text-sm italic text-[#6B4A3D]">
              cover?
            </span>
          </div>
        )}

        {/* Album title */}
        <h3 className="absolute left-5 top-5 max-w-[70%] text-lg font-semibold text-white drop-shadow-md">
          {title}
        </h3>

        {/* Album actions */}
        <div className="absolute right-4 top-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-md
              text-white
                transition
              hover:bg-black/10
                focus:outline-none
              "
            >
              <MoreHorizontal className="h-5 w-5 drop-shadow-md" />
              <span className="sr-only">
                Album actions
              </span>
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

              {/* Open album */}
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 font-medium text-[#552619]"
                onClick={() => {
                  window.location.href = `/albums/${slug}`;
                }}
              >
                <Eye className="h-4 w-4" />
                Open album
              </DropdownMenuItem>

              {/* Edit album */}
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 font-medium text-[#552619]"
                onClick={() => setEditAlbumOpen(true)}
              >
                <Pencil className="h-4 w-4" />
                Edit album
              </DropdownMenuItem>

              {/* Share album */}
              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 font-medium text-[#552619]"
                onClick={async () => {
                  const albumUrl = `${window.location.origin}/albums/${slug}`;

                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title,
                        url: albumUrl,
                      });
                    } else {
                      await navigator.clipboard.writeText(albumUrl);
                      window.alert("Album link copied!");
                    }
                  } catch (error) {
                    console.error(
                      "Share album error:",
                      error
                    );
                  }
                }}
              >
                <Share2 className="h-4 w-4" />
                Share album
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#E8C9C3]" />

              {/* Delete album */}
              <DropdownMenuItem
                variant="destructive"
                className="flex cursor-pointer items-center gap-2 font-medium"
                onClick={() => setDeleteAlbumOpen(true)}
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
      <div className="mt-3 flex items-center justify-between opacity-0 transition duration-300 group-hover:opacity-100">
        <p className="text-xs text-[#8B665B]">
          {photoCount}{" "}
          {photoCount === 1 ? "photo" : "photos"}
        </p>

        <p className="text-xs text-[#A47C72]">
          Recently updated
        </p>
      </div>

      {/* Edit Album Dialog */}
      <CreateAlbumDialog
        open={editAlbumOpen}
        onOpenChange={setEditAlbumOpen}
        album={selectedAlbum}
      />

      <DeleteAlbumDialog
        open={deleteAlbumOpen}
        onOpenChange={setDeleteAlbumOpen}
        albumId={id}
        albumTitle={title}
        onDeleted={() => {
          router.replace(router.asPath);
         }}
      />
    </article>
  );
}