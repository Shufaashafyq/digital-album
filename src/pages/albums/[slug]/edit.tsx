"use client";

import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { useState } from "react";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { useRouter } from "next/router";
import { PhotoElement } from "@/components/photos/PhotoElement";
import { PhotoCaption } from "@/components/photos/PhotoCaption";

type EditPhoto = {
  id: string;
  imageUrl: string;
  caption: string | null;
  description: string | null;
  location: string | null;
  dateTaken: string | null;
  order: number;

  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  rotation: number;
  zIndex: number;
};

type EditPage = {
  id: string;
  pageOrder: number;
  layout: string;
  photos: EditPhoto[];
};

type EditAlbumPageProps = {
  album: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    pages: EditPage[];
  };
};

type PhotoLayout = {
  photoId: string;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
};

export const getServerSideProps: GetServerSideProps<
  EditAlbumPageProps
> = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const slug = context.params?.slug;

  if (typeof slug !== "string") {
    return {
      notFound: true,
    };
  }

  const album = await prisma.album.findFirst({
    where: {
      slug,
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,

      pages: {
        orderBy: {
          pageOrder: "asc",
        },
        include: {
          photos: {
            orderBy: {
              order: "asc",
            },
          },
        },
      },
    },
  });

  if (!album) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      album: JSON.parse(
        JSON.stringify(album)
      ),
    },
  };
};

export default function EditAlbumPage({
  album,
}: InferGetServerSidePropsType<
  typeof getServerSideProps
>) {
  const router = useRouter();

  const [photoLayouts, setPhotoLayouts] = useState<PhotoLayout[]>(
    album.pages.flatMap((page) =>
      page.photos.map((photo, photoIndex) => ({
        photoId: photo.id,
        pageId: page.id,

        x:
          photo.x ??
          (page.photos.length === 1
            ? 100
            : photoIndex === 0
              ? 35
              : 270),

        y:
          photo.y ??
          (page.photos.length === 1
            ? 70
            : photoIndex === 0
              ? 70
              : 150),

        width:
          photo.width ??
          (page.photos.length === 1
            ? 320
            : 200),

        height:
          photo.height ??
          (page.photos.length === 1
            ? 360
            : 200),

        rotation: photo.rotation ?? 0,
        zIndex: photo.zIndex ?? photo.order,
      }))
    )
  );

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

 
  //Group pages into two-page spreads ( Page 1 + Page 2)
   
  const spreads: EditPage[][] = [];
  for (let i = 0; i < album.pages.length; i += 2) {
    spreads.push(album.pages.slice(i, i + 2));
  }

  const updatePhotoLayout = (
  photoId: string,
  changes: Partial<PhotoLayout>
) => {
  setPhotoLayouts((currentLayouts) =>
    currentLayouts.map((layout) =>
      layout.photoId === photoId
        ? {
            ...layout,
            ...changes,
          }
        : layout
    )
  );
};

const handleSaveChanges = async () => {
  setSaving(true);
  setSaveError(null);

  try {
    const response = await fetch(
      `/api/albums/${album.id}/layout`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          layouts: photoLayouts,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ?? "Failed to save album changes."
      );
    }

    await router.push(`/albums/${album.slug}`);
  } catch (error) {
    console.error("Save album changes error:", error);

    setSaveError(
      error instanceof Error
        ? error.message
        : "Failed to save album changes."
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <main
      className="min-h-screen px-8 py-6"
      style={{ backgroundColor: "#FBEAE7" }}
    >
      <div className="mx-auto w-full max-w-375">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/albums/${album.slug}`}
              className="text-sm text-[#8B665B] transition hover:text-[#B2456E]"
            >
              ← Back to album
            </Link>

            <h1 className="mt-4 text-3xl font-semibold text-[#552619]">
              Edit {album.title}
            </h1>

            {album.description && (
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#8B665B]">
                {album.description}
              </p>
            )}

            <p className="mt-2 text-xs text-[#A47C72]">
              Drag and resize your photos to arrange your album.
            </p>
          </div>

          <div>
            <button
            type="button"
            onClick={handleSaveChanges}
            disabled={saving}
            className="
              rounded-full
              bg-[#B2456E]
              px-5
              py-2.5
              text-sm
              font-medium
              text-white
              shadow-sm
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving ? "Saving..." : "Save changes"}
          </button>

          {saveError && (
            <p className="mt-2 text-xs text-[#B2456E]">
              {saveError}
            </p>
          )}
        </div>      
        </div>

        {/* Album spreads */}
        <div className="mt-10 space-y-16">
          {spreads.map((spread, spreadIndex) => (
            <section
              key={`spread-${spreadIndex}`}
              className="flex flex-col items-center"
            >
              {/* Spread label */}
              <div className="mb-4 flex w-full max-w-265 items-center justify-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A47C72]">
                  Pages{" "}
                  {spread[0]?.pageOrder}
                  {spread[1]
                    ? `–${spread[1].pageOrder}`
                    : ""}
                </p>
              </div>

              {/* Two-page spread */}
              <div className="flex items-start justify-center">
                {spread.map((page) => (
                  <div
                    key={page.id}
                    className="
                      relative
                      h-150
                      w-130
                      overflow-hidden
                      border
                      border-[#B9A27A]
                      bg-[#cab690]
                      shadow-xl
                    "
                  >
                    {/* Page number */}
                    <span className="absolute bottom-4 right-6 z-40 text-xs text-[#8B665B]">
                      {page.pageOrder}
                    </span>

                    {/* Photos */}
                    {page.photos.map((photo) => {
                       const layout = photoLayouts.find(
                         (item) => item.photoId === photo.id
                   );

                     if (!layout) {
                       return null;
                    }

                    return (
                      <PhotoElement
                        key={photo.id}
                        imageUrl={photo.imageUrl}
                        caption={photo.caption}
                        x={layout.x}
                        y={layout.y}
                        width={layout.width}
                        height={layout.height}
                        rotation={layout.rotation}
                        onPositionChange={(x, y) => {
                         updatePhotoLayout(photo.id, {
                           x,
                           y,
                            });
                              }}
                        onSizeChange={(width, height) => {
                          updatePhotoLayout(photo.id, {
                            width,
                            height,
                                  });
                                }}
                              />
                             );
                           })}

                    {/* Caption area */}
                    {page.photos.length > 0 && (
                      <div className="pointer-events-auto absolute bottom-10 left-8 z-30 max-w-[70%]">
                        <PhotoCaption
                          photoId={page.photos[0].id}
                          caption={page.photos[0].caption}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Empty right page when there is an odd number of pages */}
                {spread.length === 1 && (
                  <div
                    className="
                      h-150
                      w-130
                      border
                      border-[#B9A27A]
                      bg-[#cab690]/60
                    "
                  />
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}