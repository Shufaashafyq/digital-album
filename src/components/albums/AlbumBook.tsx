"use client";

import HTMLFlipBook from "react-pageflip";
import { AlbumPage } from "./AlbumPage";
import Image from "next/image";

type Photo = {
  id: string;
  imageUrl: string;
  caption: string | null;
  description: string | null;
  location: string | null;
  dateTaken: string | null;
  order: number;
};

type AlbumBookProps = {
  title: string;
  photos: Photo[];
  description: string | null;
  coverImage: string | null;
};

export function AlbumBook({
  title,
  photos,
  description,
  coverImage,
}: AlbumBookProps) {
     const pages: Photo[][] = [];

for (let i = 0; i < photos.length; ) {
  const pattern = pages.length % 4;

  if (pattern === 0) {
    // One large photo
    pages.push([photos[i]]);
    i += 1;
  } else if (pattern === 1) {
    // Two-photo collage
    pages.push(photos.slice(i, i + 2));
    i += 2;
  } else if (pattern === 2) {
    // One journal-style photo
    pages.push([photos[i]]);
    i += 1;
  } else {
    // Three-photo collage
    pages.push(photos.slice(i, i + 3));
    i += 3;
  }
}
  return (
    <div className="flex justify-center">
      <HTMLFlipBook
      key={photos.map((photo) => photo.id).join("-")}
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
  {/* Background */}
  <Image
    src="/dashboard-bg2.jpg"
    alt=""
    fill
    priority
    className="object-cover"
    sizes="520px"
  />

  {/* Slight overlay */}
  <div className="absolute inset-0 bg-black/10" />

  {/* Cover content */}
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

    {/* Cover image box */}
    <div className="relative mt-10 h-[52%] w-[68%] overflow-hidden border border-white/50 bg-[#cab690] shadow-xl">
      {coverImage ? (
        <Image
          src={coverImage}
          alt={`${title} cover`}
          fill
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
        {/* Photo pages */}
        {pages.map((pagePhotos, index) => (
  <AlbumPage
    key={`page-${index}`}
    photos={pagePhotos}
    layout={
      pagePhotos.length === 1
        ? index % 3 === 0
          ? "single"
          : "journal"
        : pagePhotos.length === 2
          ? "collage"
          : "collage"
    }
    pageNumber={index + 1}
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