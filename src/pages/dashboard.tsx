import type {
  GetServerSideProps,
  InferGetServerSidePropsType,
} from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { AlbumGrid } from "@/components/dashboard/AlbumGrid";

export const getServerSideProps: GetServerSideProps = async (
  context
) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  // User not logged in
  if (!session?.user?.id) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const albums = await prisma.album.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      theme:true,
      isPublic: true,
      coverImage: true,
      _count: {
        select: {
          photos: true,
        },
      },
    },
  });

  return {
    props: {
      albums: JSON.parse(JSON.stringify(albums)),
    },
  };
};

export default function DashboardPage({
  albums,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <main
      className="min-h-screen px-8 py-10"
      style={{ backgroundColor: "#FBEAE7" }}
    >
      <div className="mx-auto max-w-6xl">
        <DashboardHeader />

        <WelcomeSection />

        <AlbumGrid albums={albums} />

        <footer className="mt-20 pb-6 text-center">
          <p className="text-xs text-[#A47C72]">
            Your memories, beautifully kept ♡♡♡♡
          </p>
        </footer>
      </div>
    </main>
  );
}