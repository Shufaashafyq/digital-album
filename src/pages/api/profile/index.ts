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

    if (req.method === "GET") {
      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: "User not found.",
        });
      }

      return res.status(200).json({
        user,
      });
    }

    if (req.method === "PATCH") {
      const { name, profileImage } = req.body;

      if (
        name !== undefined &&
        name !== null &&
        typeof name !== "string"
      ) {
        return res.status(400).json({
          error: "Invalid name.",
        });
      }

      if (
        profileImage !== undefined &&
        profileImage !== null &&
        typeof profileImage !== "string"
      ) {
        return res.status(400).json({
          error: "Invalid profile image.",
        });
      }

      const trimmedName =
        typeof name === "string"
          ? name.trim()
          : null;

      if (
        trimmedName &&
        trimmedName.length > 100
      ) {
        return res.status(400).json({
          error: "Name is too long.",
        });
      }

      const user = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          name: trimmedName || null,
          profileImage:
            profileImage || null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      });

      return res.status(200).json({
        success: true,
        user,
      });
    }

    res.setHeader("Allow", ["GET", "PATCH"]);

    return res.status(405).json({
      error: "Method not allowed.",
    });
  } catch (error) {
    console.error("Profile API error:", error);

    return res.status(500).json({
      error: "Something went wrong.",
    });
  }
}