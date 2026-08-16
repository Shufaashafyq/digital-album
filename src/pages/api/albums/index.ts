import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

type ResponseData =
  | {
      success: true;
      album: {
        id: string;
        title: string;
        slug: string;
        description: string | null;
        coverImage: string | null;
        theme: string | null;
        isPublic: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  | {
      success: false;
      error: string;
    };

function createSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);

    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session?.user?.id) {
      return res.status(401).json({
        success: false,
        error: "You must be logged in to create an album.",
      });
    }

    const { title, description, theme, isPublic, coverImage } = req.body;

    if (
      coverImage !== undefined &&
      coverImage !== null &&
      typeof coverImage !== "string"
   ) {
      return res.status(400).json({
      success: false,
      error: "Invalid cover image.",
    });
   }

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Album name is required.",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid description.",
      });
    }

    if (
      theme !== undefined &&
      theme !== null &&
      typeof theme !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid theme.",
      });
    }

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "Invalid album visibility.",
      });
    }

    const cleanTitle = title.trim();
    const cleanDescription =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;
    const cleanTheme =
      typeof theme === "string" && theme.trim()
        ? theme.trim()
        : null;

    const baseSlug = createSlug(cleanTitle);

    if (!baseSlug) {
      return res.status(400).json({
        success: false,
        error: "Please enter a valid album name.",
      });
    }

    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const existingAlbum = await prisma.album.findUnique({
        where: {
          userId_slug: {
            userId: session.user.id,
            slug,
          },
        },
        select: {
          id: true,
        },
      });

      if (!existingAlbum) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    const album = await prisma.album.create({
      data: {
        title: cleanTitle,
        slug,
        description: cleanDescription,
        theme: cleanTheme,
        isPublic,
        coverImage:
        typeof coverImage === "string" && coverImage.trim()
        ? coverImage.trim()
        : null,
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        theme: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      album,
    });
  } catch (error) {
    console.error("Create album error:", error);

    return res.status(500).json({
      success: false,
      error: "Something went wrong while creating the album.",
    });
  }
}