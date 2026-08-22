import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { v2 as cloudinary } from "cloudinary";

import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    //get the photo ID from the URL
    const photoId = req.query.photoId;

    if (typeof photoId !== "string") {
      return res.status(400).json({
        error: "Invalid photo ID.",
      });
    }

    //update caption
    if (req.method === "PATCH") {
      //get caption from request body
      const { caption } = req.body;

      if (
        caption !== null &&
        caption !== undefined &&
        typeof caption !== "string"
      ) {
        return res.status(400).json({
          error: "Invalid caption.",
        });
      }

      //make sure this photo belongs to an album owned by the currently logged-in user
      const photo = await prisma.photo.findFirst({
        where: {
          id: photoId,
          album: {
            userId: session.user.id,
          },
        },
        select: {
          id: true,
        },
      });

      if (!photo) {
        return res.status(404).json({
          error: "Photo not found.",
        });
      }

      //update caption
      const updatedPhoto = await prisma.photo.update({
        where: {
          id: photoId,
        },
        data: {
          caption:
            typeof caption === "string" && caption.trim()
              ? caption.trim()
              : null,
        },
        select: {
          id: true,
          caption: true,
        },
      });

      return res.status(200).json({
        success: true,
        photo: updatedPhoto,
      });
    }

    //delete photo
    if (req.method === "DELETE") {
      //make sure this photo belongs to an album owned by the currently logged-in user
      const photo = await prisma.photo.findFirst({
        where: {
          id: photoId,
          album: {
            userId: session.user.id,
          },
        },
        select: {
          id: true,
          cloudinaryPublicId: true,
        },
      });

      if (!photo) {
        return res.status(404).json({
          error: "Photo not found.",
        });
      }

      //delete the image from Cloudinary
      if (photo.cloudinaryPublicId) {
        const cloudinaryResult =
          await cloudinary.uploader.destroy(
            photo.cloudinaryPublicId,
            {
              resource_type: "image",
              type: "upload",
              invalidate: true,
            }
          );

        console.log(
          "Cloudinary delete result:",
          cloudinaryResult
        );
      }

      //delete the photo record from Prisma/PostgreSQL
      await prisma.photo.delete({
        where: {
          id: photo.id,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Photo deleted successfully.",
      });
    }

    //only allow PATCH and DELETE requests
    res.setHeader("Allow", ["PATCH", "DELETE"]);

    return res.status(405).json({
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Photo API error:", error);

    return res.status(500).json({
      error: "Something went wrong.",
    });
  }
}