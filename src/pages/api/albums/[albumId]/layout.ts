import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

type PhotoLayout = {
  photoId: string;
  pageId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
};

type SaveLayoutRequest = {
  layouts: PhotoLayout[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);

    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    //get the logged-in user
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

    const body = req.body as SaveLayoutRequest;

    if (!body || !Array.isArray(body.layouts)) {
      return res.status(400).json({
        error: "Invalid layout data.",
      });
    }

    //make sure this album belongs to the currently logged-in user
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

    //make sure every layout belongs to this album
    const photoIds = body.layouts.map(
      (layout) => layout.photoId
    );

    const photos = await prisma.photo.findMany({
      where: {
        id: {
          in: photoIds,
        },
        albumId,
      },
      select: {
        id: true,
        pageId: true,
      },
    });

    if (photos.length !== body.layouts.length) {
      return res.status(400).json({
        error: "One or more photos do not belong to this album.",
      });
    }

    //save every photo layout together
    await prisma.$transaction(
      body.layouts.map((layout) =>
        prisma.photo.update({
          where: {
            id: layout.photoId,
          },
          data: {
            pageId: layout.pageId,
            x: layout.x,
            y: layout.y,
            width: layout.width,
            height: layout.height,
            rotation: layout.rotation,
            zIndex: layout.zIndex,
          },
        })
      )
    );

    return res.status(200).json({
      success: true,
      message: "Album layout saved successfully.",
    });
  } catch (error) {
    console.error("Save album layout error:", error);

    return res.status(500).json({
      error: "Something went wrong while saving the album layout.",
    });
  }
}