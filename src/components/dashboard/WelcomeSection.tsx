"use client";
import { Caveat_Brush } from "next/font/google";
import { Button } from "@/components/ui/button";
import { AboutDialog } from "./AboutDialog";
import { useState } from "react"
import { CreateAlbumDialog } from "./CreateAlbumDialog";

const caveatBrush = Caveat_Brush({
  weight: "400",
  subsets: ["latin"],
});

export function WelcomeSection() {
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false);
  return (
    <section className="mb-16">
      <div className="max-w-2xl">
        <h1
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
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[#8B665B]">
          Create albums, add your favorite photographs, and turn
          your memories into something you'll love looking back on.
        </p>

        <Button
          type="button"
          onClick={() => setCreateAlbumOpen(true)}
          className="mt-7 h-11 w-40 rounded-lg text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
          style={{ backgroundColor: "#B2456E" }}
        >
          Create Album
        </Button>

        <CreateAlbumDialog
        open={createAlbumOpen}
        onOpenChange={setCreateAlbumOpen}
        />
      </div>
    </section>
  );
}