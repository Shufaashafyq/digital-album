"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { PhotoCaption } from "../photos/PhotoCaption";
import { PhotoDeleteButton } from "../photos/PhotoDeleteBtn";

type AlbumPhoto = {
  id: string;
  imageUrl: string;
  caption: string | null;
  description?: string | null;
  location?: string | null;
  dateTaken?: string | Date | null;

  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  rotation?: number;
  zIndex?: number;
};

type AlbumPageProps = {
  photos: AlbumPhoto[];
  layout?: "single" | "tilted" | "collage" | "journal";
  pageNumber?: number;
};

export const AlbumPage = forwardRef<HTMLDivElement, AlbumPageProps>(
  function AlbumPage(
    {
      photos,
      layout = "single",
      pageNumber,
    },
    ref
  ) {
    if (photos.length === 0) {
      return (
        <div
          ref={ref}
          className="relative h-full w-full bg-[#cab690] p-10"
        >
          <div className="flex h-full w-full items-center justify-center border border-[#B9A27A]">
            <p className="text-sm italic text-[#8B665B]">
              A blank page waiting for a memory.
            </p>
          </div>
        </div>
      );
    }

    const formatDate = (
      date: string | Date | null | undefined
    ) => {
      if (!date) return null;

      const value = new Date(date);

      if (Number.isNaN(value.getTime())) {
        return null;
      }

      return value.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    };

    const photo = photos[0];

    const hasSavedLayout =
      photo.x !== null &&
      photo.x !== undefined &&
      photo.y !== null &&
      photo.y !== undefined &&
      photo.width !== null &&
      photo.width !== undefined &&
      photo.height !== null &&
      photo.height !== undefined;

    /*
     * SINGLE LAYOUT
     */
    if (layout === "single") {
      return (
        <div
          ref={ref}
          className="relative h-full w-full bg-[#cab690] p-8"
        >
          <div className="relative h-full w-full overflow-hidden border border-[#B9A27A]">
            {hasSavedLayout ? (
              <div
                className="group absolute overflow-hidden bg-[#FFF9F7] p-2 shadow-lg"
                style={{
                  left: photo.x!,
                  top: photo.y!,
                  width: photo.width!,
                  height: photo.height!,
                  transform: `rotate(${photo.rotation ?? 0}deg)`,
                  zIndex: photo.zIndex ?? 0,
                }}
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption || "Album photograph"}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="400px"
                />

                <PhotoDeleteButton photoId={photo.id} />
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center px-10 py-12">
                <div className="group relative h-[68%] w-full">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || "Album photograph"}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="650px"
                  />

                  <PhotoDeleteButton photoId={photo.id} />
                </div>
              </div>
            )}

            <div className="absolute bottom-10 left-1/2 z-30 -translate-x-1/2">
              <PhotoCaption
                photoId={photo.id}
                caption={photo.caption}
              />
            </div>

            {(photo.location || photo.dateTaken) && (
              <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 flex-wrap justify-center gap-3 text-xs text-[#8B665B]">
                {photo.location && <span>{photo.location}</span>}

                {photo.location && photo.dateTaken && (
                  <span>·</span>
                )}

                {photo.dateTaken && (
                  <span>{formatDate(photo.dateTaken)}</span>
                )}
              </div>
            )}
          </div>

          {pageNumber && (
            <span className="absolute bottom-5 right-7 text-xs text-[#8B665B]">
              {pageNumber}
            </span>
          )}
        </div>
      );
    }

    /*
     * TILTED LAYOUT
     */
    if (layout === "tilted") {
      return (
        <div
          ref={ref}
          className="relative h-full w-full bg-[#cab690] p-8"
        >
          <div className="relative h-full w-full overflow-hidden border border-[#B9A27A]">
            <div className="relative flex h-full items-center justify-center">
              {hasSavedLayout ? (
                <div
                  className="group absolute overflow-hidden bg-[#FFF9F7] p-2 shadow-lg"
                  style={{
                    left: photo.x!,
                    top: photo.y!,
                    width: photo.width!,
                    height: photo.height!,
                    transform: `rotate(${photo.rotation ?? -4}deg)`,
                    zIndex: photo.zIndex ?? 0,
                  }}
                >
                  <Image
                    src={photo.imageUrl}
                    alt={photo.caption || "Album photograph"}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="400px"
                  />

                  <PhotoDeleteButton photoId={photo.id} />
                </div>
              ) : (
                <div className="relative w-[68%] rotate-[-4deg] bg-[#FFF9F7] p-4 shadow-xl">
                  <div className="group relative aspect-4/5 w-full">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.caption || "Album photograph"}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="500px"
                    />

                    <PhotoDeleteButton photoId={photo.id} />
                  </div>
                </div>
              )}

              <div className="absolute bottom-[16%] right-[10%] rotate-6 rounded-sm bg-[#F8E7B8] px-5 py-3 shadow-md">
                <p className="font-serif text-sm italic text-[#6B4A3D]">
                  Remember this ♡
                </p>
              </div>

              <div className="absolute left-[10%] top-[12%] text-2xl text-[#B2456E]">
                ✦
              </div>
            </div>
          </div>

          <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
            <PhotoCaption
              photoId={photo.id}
              caption={photo.caption}
            />
          </div>

          {pageNumber && (
            <span className="absolute bottom-5 left-7 text-xs text-[#8B665B]">
              {pageNumber}
            </span>
          )}
        </div>
      );
    }

    /*
     * COLLAGE LAYOUT
     */
    if (layout === "collage") {
      const secondPhoto = photos[1];
      const thirdPhoto = photos[2];

      const renderPhoto = (
        currentPhoto: AlbumPhoto,
        defaultClasses: string,
        defaultRotation: number
      ) => {
        const currentHasSavedLayout =
          currentPhoto.x !== null &&
          currentPhoto.x !== undefined &&
          currentPhoto.y !== null &&
          currentPhoto.y !== undefined &&
          currentPhoto.width !== null &&
          currentPhoto.width !== undefined &&
          currentPhoto.height !== null &&
          currentPhoto.height !== undefined;

        if (currentHasSavedLayout) {
          return (
            <div
              className="group absolute overflow-hidden bg-[#FFF9F7] p-2 shadow-lg"
              style={{
                left: currentPhoto.x!,
                top: currentPhoto.y!,
                width: currentPhoto.width!,
                height: currentPhoto.height!,
                transform: `rotate(${
                  currentPhoto.rotation ?? defaultRotation
                }deg)`,
                zIndex: currentPhoto.zIndex ?? 0,
              }}
            >
              <Image
                src={currentPhoto.imageUrl}
                alt={
                  currentPhoto.caption ||
                  "Album photograph"
                }
                fill
                unoptimized
                className="object-cover"
                sizes="400px"
              />

              <PhotoDeleteButton
                photoId={currentPhoto.id}
              />
            </div>
          );
        }

        return (
          <div className={`absolute ${defaultClasses}`}>
            <div className="group relative aspect-square w-full">
              <Image
                src={currentPhoto.imageUrl}
                alt={
                  currentPhoto.caption ||
                  "Album photograph"
                }
                fill
                unoptimized
                className="object-cover"
                sizes="350px"
              />

              <PhotoDeleteButton
                photoId={currentPhoto.id}
              />
            </div>
          </div>
        );
      };

      return (
        <div
          ref={ref}
          className="relative h-full w-full bg-[#cab690] p-8"
        >
          <div className="relative h-full w-full overflow-hidden border border-[#B9A27A]">
            <div className="relative h-full w-full">
              {renderPhoto(
                photo,
                "left-[10%] top-[13%] w-[48%] rotate-[-5deg] bg-[#FFF9F7] p-3 shadow-lg",
                -5
              )}

              {secondPhoto &&
                renderPhoto(
                  secondPhoto,
                  "right-[8%] top-[30%] w-[45%] rotate-[5deg] bg-[#FFF9F7] p-3 shadow-lg",
                  5
                )}

              {thirdPhoto &&
                renderPhoto(
                  thirdPhoto,
                  "bottom-[18%] left-[30%] w-[38%] rotate-2 bg-[#FFF9F7] p-3 shadow-lg",
                  2
                )}

              <div className="absolute bottom-[8%] left-[12%] z-30 max-w-[65%] text-center">
                <PhotoCaption
                  photoId={photo.id}
                  caption={photo.caption}
                />
              </div>

              <div className="absolute bottom-[8%] right-[12%] z-30 text-2xl text-[#B2456E]">
                ♡
              </div>
            </div>
          </div>

          {pageNumber && (
            <span className="absolute bottom-5 right-7 text-xs text-[#8B665B]">
              {pageNumber}
            </span>
          )}
        </div>
      );
    }

    /*
     * JOURNAL LAYOUT
     */
    return (
      <div
        ref={ref}
        className="relative h-full w-full bg-[#cab690] p-8"
      >
        <div className="relative h-full w-full overflow-hidden border border-[#B9A27A]">
          {hasSavedLayout ? (
            <div
              className="group absolute overflow-hidden bg-[#FFF9F7] p-2 shadow-lg"
              style={{
                left: photo.x!,
                top: photo.y!,
                width: photo.width!,
                height: photo.height!,
                transform: `rotate(${photo.rotation ?? 1}deg)`,
                zIndex: photo.zIndex ?? 0,
              }}
            >
              <Image
                src={photo.imageUrl}
                alt={photo.caption || "Album photograph"}
                fill
                unoptimized
                className="object-cover"
                sizes="400px"
              />

              <PhotoDeleteButton photoId={photo.id} />
            </div>
          ) : (
            <div className="flex h-full flex-col px-10 py-10">
              <div className="group relative h-[52%] w-full rotate-1 bg-[#FFF9F7] p-4 shadow-lg">
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption || "Album photograph"}
                  fill
                  className="object-cover p-4"
                  sizes="550px"
                />

                <PhotoDeleteButton photoId={photo.id} />
              </div>
            </div>
          )}

          <div className="absolute bottom-[17%] left-10 z-30">
            <div className="font-serif text-xl italic text-[#6B4A3D]">
              <PhotoCaption
                photoId={photo.id}
                caption={photo.caption}
              />
            </div>

            {photo.description && (
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#8B665B]">
                {photo.description}
              </p>
            )}

            {(photo.location || photo.dateTaken) && (
              <div className="mt-5 flex flex-wrap gap-3 text-xs uppercase tracking-[0.15em] text-[#A47C72]">
                {photo.location && (
                  <span>{photo.location}</span>
                )}

                {photo.location && photo.dateTaken && (
                  <span>·</span>
                )}

                {photo.dateTaken && (
                  <span>{formatDate(photo.dateTaken)}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {pageNumber && (
          <span className="absolute bottom-5 left-7 text-xs text-[#8B665B]">
            {pageNumber}
          </span>
        )}
      </div>
    );
  }
);