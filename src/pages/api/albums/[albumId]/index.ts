import type {
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
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

    // Make sure the album belongs to the logged-in user.
    const existingAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingAlbum) {
      return res.status(404).json({
        error: "Album not found.",
      });
    }

    // Update album
    if (req.method === "PATCH") {
      const {
        title,
        description,
        theme,
        isPublic,
        coverImage,
      } = req.body;

      if (
        typeof title !== "string" ||
        title.trim().length === 0
      ) {
        return res.status(400).json({
          error: "Album name is required.",
        });
      }

      if (
        description !== undefined &&
        description !== null &&
        typeof description !== "string"
      ) {
        return res.status(400).json({
          error: "Invalid description.",
        });
      }

      if (
        theme !== undefined &&
        theme !== null &&
        typeof theme !== "string"
      ) {
        return res.status(400).json({
          error: "Invalid theme.",
        });
      }

      if (typeof isPublic !== "boolean") {
        return res.status(400).json({
          error: "Invalid album visibility.",
        });
      }

      if (
        coverImage !== undefined &&
        coverImage !== null &&
        typeof coverImage !== "string"
      ) {
        return res.status(400).json({
          error: "Invalid cover image.",
        });
      }

      const updatedAlbum = await prisma.album.update({
        where: {
          id: albumId,
        },
        data: {
          title: title.trim(),

          description:
            typeof description === "string"
              ? description.trim() || null
              : null,

          theme:
            typeof theme === "string"
              ? theme.trim() || null
              : null,

          isPublic,

          coverImage:
            typeof coverImage === "string" &&
            coverImage.trim()
              ? coverImage.trim()
              : null,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          theme: true,
          isPublic: true,
          coverImage: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({
        success: true,
        album: updatedAlbum,
      });
    }

    // Delete album
    if (req.method === "DELETE") {
      await prisma.album.delete({
        where: {
          id: albumId,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Album deleted successfully.",
      });
    }

    res.setHeader("Allow", ["PATCH", "DELETE"]);

    return res.status(405).json({
      error: "Method not allowed.",
    });
  } catch (error) {
    console.error("Album API error:", error);

    return res.status(500).json({
      error: "Something went wrong.",
    });
  }
}