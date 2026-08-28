"use client";

import HTMLFlipBook from "react-pageflip";
import Image from "next/image";

import { AlbumPage } from "./AlbumPage";

type Photo = {
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

type AlbumPageData = {
  id: string;
  pageOrder: number;
  layout: string;
  photos: Photo[];
};

type AlbumBookProps = {
  title: string;
  pages: AlbumPageData[];
  description: string | null;
  coverImage: string | null;
};

export function AlbumBook({
  title,
  pages,
  description,
  coverImage,
}: AlbumBookProps) {
  return (
    <div className="flex justify-center">
      <HTMLFlipBook
       key={JSON.stringify({
    title,
    description,
    coverImage,
    pages: pages.map((page) => ({
      id: page.id,
      pageOrder: page.pageOrder,
      layout: page.layout,
      photos: page.photos.map((photo) => ({
        id: photo.id,
        x: photo.x,
        y: photo.y,
        width: photo.width,
        height: photo.height,
        rotation: photo.rotation,
        zIndex: photo.zIndex,
        order: photo.order,
        imageUrl: photo.imageUrl,
        caption: photo.caption,
      })),
    })),
  })}
        //key={pages
        //  .flatMap((page) => page.photos)
        //  .map((photo) => photo.id)
        //  .join("-")}
        width={520}
        height={600}
        size="fixed"
        minWidth={500}
        maxWidth={620}
        minHeight={500}
        maxHeight={700}
        startPage={0}
        startZIndex={0}
        autoSize={false}
        maxShadowOpacity={0.6}
        showCover={true}
        drawShadow={true}
        flippingTime={900}
        usePortrait={false}
        mobileScrollSupport={true}
        clickEventForward={true}
        useMouseEvents={true}
        swipeDistance={30}
        showPageCorners={true}
        disableFlipByClick={true}
        style={{
          margin: "0 auto",
        }}
        className="shadow-2xl"
      >
        {/* Front cover */}
        <div
          className="relative h-full w-full overflow-hidden"
          data-density="hard"
        >
          <div className="relative h-full w-full">
            <Image
              src="/dashboard-bg2.jpg"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="520px"
            />

            <div className="absolute inset-0 bg-black/10" />

            <div className="relative z-10 flex h-full w-full flex-col items-center px-10 py-12">
              {/* Heading */}
              <div className="w-full text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#552619]">
                  Digital Album
                </p>

                <h2 className="mt-3 text-4xl font-semibold leading-tight text-[#552619] drop-shadow-md">
                  {title}
                </h2>

                {description && (
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#552619] drop-shadow">
                    {description}
                  </p>
                )}
              </div>

              {/* Cover image */}
              <div className="relative mt-10 h-[52%] w-[68%] overflow-hidden border border-white/50 bg-[#cab690] shadow-xl">
                {coverImage ? (
                  <Image
                    src={coverImage}
                    alt={`${title} cover`}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="400px"
                  />
                ) : (
                  <div className="grainy flex h-full w-full items-center justify-center">
                    <p className="text-sm italic text-[#6B4A3D]">
                      No cover photo
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Photo pages */}
        {pages.map((page) => (
          <AlbumPage
            key={page.id}
            photos={page.photos}
            layout={
              page.layout as
                | "single"
                | "tilted"
                | "collage"
                | "journal"
            }
            pageNumber={page.pageOrder}
          />
        ))}

        {/* Back cover */}
        <div
          className="flex h-full w-full items-center justify-center"
          data-density="hard"
        >
          <div className="flex h-full w-full items-center justify-center bg-[#6B3528]">
            <p className="text-sm italic text-[#FBEAE7]">
              Your memories, beautifully kept ♡
            </p>
          </div>
        </div>
      </HTMLFlipBook>
    </div>
  );
}