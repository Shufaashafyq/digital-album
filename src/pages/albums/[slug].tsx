import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import Image from "next/image";
import { Caveat_Brush } from "next/font/google";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PhotoUploader } from "@/components/albums/PhotoUploader";
import { AlbumBook } from "@/components/albums/AlbumBook";

const caveatBrush = Caveat_Brush({
  weight: "400",
  subsets: ["latin"],
});

type AlbumPageProps = {
  album: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    theme: string | null;
    coverImage: string | null;

    pages: {
      id: string;
      pageOrder: number;
      layout: string;

      photos: {
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
      }[];
    }[];
  };
};

export const getServerSideProps: GetServerSideProps<
  AlbumPageProps
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

  // Get the album
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
      theme: true,
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
      album: JSON.parse(JSON.stringify(album)),
    },
  };
};

export default function AlbumPage({
  album,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const hasPages = album.pages.length > 0;

  return (
    <main
      className="min-h-screen px-8 pt-4 pb-10"
      style={{ backgroundColor: "#FBEAE7" }}
    >
      <div className="mx-auto w-full max-w-375">
        <Link
          href="/dashboard"
          className="text-sm text-[#8B665B] transition hover:text-[#B2456E]"
        >
          ← Back to albums
        </Link>

        {!hasPages ? (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-[#DDAEA3] bg-white/40 px-6 py-16 text-center">
            <p className="text-sm text-[#8B665B]">
              No photos in this album yet.
            </p>

            <p className="mt-1 text-xs text-[#A47C72]">
              Add your first memory below.
            </p>

            <PhotoUploader albumId={album.id} />
          </div>
        ) : (
          <div className="mt-4 flex justify-center pb-16">
            <div className="relative -translate-x-7">
              <AlbumBook
                title={album.title}
                description={album.description}
                coverImage={album.coverImage}
                pages={album.pages}
              />

              {/* Album actions */}
              <div
                className="
                  absolute
                  left-[calc(100%-2px)]
                  top-1/2
                  z-20
                  flex
                  -translate-y-1/2
                  flex-col
                  items-center
                  gap-6
                "
              >
                {/* Edit album */}
                <div className="h-22.5 w-22.5 shrink-0">
                  <Link
                    href={`/albums/${album.slug}/edit`}
                    aria-label="Edit album page"
                    className="group relative block h-full w-full"
                  >
                    <Image
                      src="/stickers/edit-page.png"
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

                    <span
                      className={`
                        ${caveatBrush.className}
                        pointer-events-none
                        absolute
                        inset-0
                        flex
                        -translate-x-0.5
                        flex-col
                        items-center
                        justify-center
                        text-center
                        text-xl
                        leading-[0.9]
                        text-[#B2456E]
                      `}
                    >
                      <span>Edit</span>
                      <span>Album</span>
                      <span>Page</span>
                    </span>
                  </Link>
                </div>

                {/* Add memories */}
                <div className="h-22.5 w-22.5 shrink-0">
                  <PhotoUploader
                    albumId={album.id}
                    sticker
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}