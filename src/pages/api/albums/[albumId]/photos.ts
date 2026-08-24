import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { syncAlbumPages } from "@/lib/syncAlbumPages";

type PhotoInput = {
  imageUrl: string;
  cloudinaryPublicId: string;
  caption?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const session = await getServerSession(
    req,
    res,
    authOptions
  );

  if (!session?.user?.id) {
    return res.status(401).json({
      error: "You must be logged in.",
    });
  }

  const albumId = req.query.albumId;

  if (typeof albumId !== "string") {
    return res.status(400).json({
      error: "Invalid album ID.",
    });
  }

  const album = await prisma.album.findFirst({
    where: {
      id: albumId,
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!album) {
    return res.status(404).json({
      error: "Album not found.",
    });
  }

  const photos = req.body.photos as PhotoInput[];

  if (!Array.isArray(photos) || photos.length === 0) {
    return res.status(400).json({
      error: "No photos were provided.",
    });
  }

  for (const photo of photos) {
    if (
      typeof photo.imageUrl !== "string" ||
      typeof photo.cloudinaryPublicId !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid photo data.",
      });
    }
  }

  const lastPhoto = await prisma.photo.findFirst({
    where: {
      albumId,
    },
    orderBy: {
      order: "desc",
    },
    select: {
      order: true,
    },
  });

  const startingOrder = (lastPhoto?.order ?? -1) + 1;

  const createdPhotos = await prisma.$transaction(
  photos.map((photo, index) =>
    prisma.photo.create({
      data: {
        albumId,
        imageUrl: photo.imageUrl,
        cloudinaryPublicId: photo.cloudinaryPublicId,
        caption: photo.caption?.trim() || null,
        order: startingOrder + index,
      },
    })
  )
);

//rebuild the album pages after adding the photos.
await syncAlbumPages(albumId);

return res.status(201).json({
  success: true,
  photos: createdPhotos,
});
}