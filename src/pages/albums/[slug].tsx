import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import Image from "next/image";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PhotoUploader } from "@/components/albums/PhotoUploader";

type AlbumPageProps = {
  album: {
    id: string;
    title: string;
    description: string | null;
    theme: string | null;
    photos: {
      id: string;
      imageUrl: string;
      caption: string | null;
      order: number;
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

  const album = await prisma.album.findFirst({
    where: {
      slug,
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      theme: true,
      photos: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          order: true,
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
  return (
    <main
      className="min-h-screen px-8 py-10"
      style={{ backgroundColor: "#FBEAE7" }}
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="text-sm text-[#8B665B] transition hover:text-[#B2456E]"
        >
          ← Back to albums
        </Link>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B2456E]">
            {album.theme || "Memory album"}
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-[#552619]">
            {album.title}
          </h1>

          {album.description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#8B665B]">
              {album.description}
            </p>
          )}
        </div>

        <PhotoUploader albumId={album.id} />

        {album.photos.length === 0 ? (
          <div className="mt-10 rounded-2xl border-2 border-dashed border-[#DDAEA3] bg-white/40 px-6 py-16 text-center">
            <p className="text-sm text-[#8B665B]">
              No photos in this album yet.
            </p>

            <p className="mt-1 text-xs text-[#A47C72]">
              Add your first memory above.
            </p>
          </div>
        ) : (
          <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {album.photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-[#EED2CC] shadow-md"
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.caption || album.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}