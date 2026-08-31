"use client";
import { Caveat_Brush } from "next/font/google";
import { AboutDialog } from "../dialogs/AboutDialog";
import { useState } from "react"
import { CreateAlbumDialog } from "../dialogs/CreateAlbumDialog";
import Image from "next/image";

const caveatBrush = Caveat_Brush({
  weight: "400",
  subsets: ["latin"],
});

export function WelcomeSection() {
  
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false);

  return (
    <section className="-mt-18 mb-8">
      <div className="max-w-2xl">
        <h2
          className={`${caveatBrush.className} text-5xl leading-tight md:text-6xl`}
          style={{ color: "#552619" }}
        >
          
          <span className="flex items-center gap-6">
            <span>It is a</span>
            <span className="-ml-1">
              <AboutDialog />
            </span>
          </span>

          <span className="block">Digital Album.</span>
        </h2>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[#8B665B]">
          Create albums, add your favorite photographs, 
          <br />  turn your memories into something you'll love looking back on.
        </p>

        <div className="relative mt-7 inline-block">
          <button
            type="button"
            onClick={() => setCreateAlbumOpen(true)}
            aria-label="Create a new album"
            className="group cursor-pointer border-0 bg-transparent p-0"
           >
    <Image
      src="/stickers/button.png"
      alt=""
      width={90}
      height={90}
      priority
      className="
        transition-all
        duration-200
        group-hover:scale-105
        group-active:scale-95
      "
    />
  </button>

  <span
    className="
      pointer-events-none
      absolute
      inset-0
      flex
      flex-col
      items-center
      justify-center
      text-sm
      font-bold
      leading-tight
      text-[#FBEAE7]
    "
  >
    <span 
    className="-translate-y-2"
     style={{
      WebkitTextStroke: "1.5px #B2456E",
      paintOrder: "stroke fill",
    }}>
      Create
      </span>
    <span
     style={{
      WebkitTextStroke: "1.5px #B2456E",
      paintOrder: "stroke fill",
    }}
    >Album
    </span>
  </span>
</div>

        <CreateAlbumDialog
        open={createAlbumOpen}
        onOpenChange={setCreateAlbumOpen}
        />
      </div>
    </section>
  );
}