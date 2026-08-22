"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { PhotoCaption } from "../photos/PhotoCaption";
import { PhotoDeleteButton } from "../photos/PhotoDeleteBtn";
import { PhotoElement } from "../photos/PhotoElement";

type AlbumPhoto = {
  id: string;
  imageUrl: string;
  caption: string | null;
  description?: string | null;
  location?: string | null;
  dateTaken?: string | Date | null;
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

    if (layout === "single") {
      return (
        <div
          ref={ref}
          className="relative h-full w-full bg-[#cab690] p-8"
        >
          <div className="relative h-full w-full border border-[#B9A27A]">
            <div className="flex h-full flex-col items-center justify-center px-10 py-12">
             <div className="relative h-[68%] w-full">
        <PhotoElement
          imageUrl={photo.imageUrl}
          caption={photo.caption}
        />
        </div>

              <PhotoCaption
              photoId={photo.id}
              caption={photo.caption}
              />

              {(photo.location || photo.dateTaken) && (
                <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-[#8B665B]">
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
          </div>

          {pageNumber && (
            <span className="absolute bottom-5 right-7 text-xs text-[#8B665B]">
              {pageNumber}
            </span>
          )}
        </div>
      );
    }

    if (layout === "tilted") {
      return (
        <div
          ref={ref}
          className="relative h-full w-full bg-[#cab690] p-8"
        >
          <div className="relative h-full w-full border border-[#B9A27A]">
            <div className="relative flex h-full items-center justify-center">
              <div className="relative w-[68%] rotate-[-4deg] bg-[#FFF9F7] p-4 shadow-xl">
                <div className="relative h-[75%] w-[70%]">
  <PhotoElement
    imageUrl={photo.imageUrl}
    caption={photo.caption}
    x={20}
    y={20}
    width={260}
    height={330}
    rotation={-4}
  />

  <div className="pointer-events-none absolute inset-0">
    <PhotoDeleteButton photoId={photo.id} />
  </div>
</div>
                <div className="pt-4 text-center">
                  <PhotoCaption
                  photoId={photo.id}
                  caption={photo.caption}
                  />
                </div>
              </div>

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

          {pageNumber && (
            <span className="absolute bottom-5 left-7 text-xs text-[#8B665B]">
              {pageNumber}
            </span>
          )}
        </div>
      );
    }

    if (layout === "collage") {
  return (
    <div
      ref={ref}
      className="relative h-full w-full bg-[#cab690] p-8"
    >
      <div className="relative h-full w-full border border-[#B9A27A]">
        <div className="relative h-full w-full">

          {/* Photo 1 */}
          {photos[0] && (
            <PhotoElement
              imageUrl={photos[0].imageUrl}
              caption={photos[0].caption}
              x={45}
              y={75}
              width={210}
              height={210}
              rotation={-5}
            />
          )}

          {/* Photo 2 */}
          {photos[1] && (
            <PhotoElement
              imageUrl={photos[1].imageUrl}
              caption={photos[1].caption}
              x={240}
              y={150}
              width={200}
              height={200}
              rotation={5}
            />
          )}

          {/* Photo 3 */}
          {photos[2] && (
            <PhotoElement
              imageUrl={photos[2].imageUrl}
              caption={photos[2].caption}
              x={130}
              y={330}
              width={180}
              height={180}
              rotation={-2}
            />
          )}

          <div className="absolute bottom-[8%] left-[12%] max-w-[65%] text-center">
            <PhotoCaption
              photoId={photo.id}
              caption={photo.caption}
            />
          </div>

          <div className="absolute bottom-[8%] right-[12%] text-2xl text-[#B2456E]">
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

    return (
      <div
        ref={ref}
        className="relative h-full w-full bg-[#cab690] p-8"
      >
        <div className="relative h-full w-full border border-[#B9A27A]">
          <div className="flex h-full flex-col px-10 py-10">
            <div className=" group relative h-[52%] w-full rotate-1 bg-[#FFF9F7] p-4 shadow-lg">
              <Image
                src={photo.imageUrl}
                alt={photo.caption || "Album photograph"}
                fill
                className="object-cover p-4"
                sizes="550px"
              />
              <PhotoDeleteButton photoId={photo.id} />
            </div>

            <div className="mt-7">
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