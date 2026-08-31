import type {
  NextApiRequest,
  NextApiResponse,
} from "next";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { passwordSchema } from "@/validations/auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", ["PATCH"]);

    return res.status(405).json({
      error: "Method not allowed.",
    });
  }

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

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid password data.",
      });
    }

    // Validate the new password using the same rules used by registration
    const parsedPassword =
      passwordSchema.safeParse(newPassword);

    if (!parsedPassword.success) {
      return res.status(400).json({
        error:
          parsedPassword.error.issues[0]?.message ??
          "Invalid password.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      return res.status(400).json({
        error:
          "Password login is not available for this account.",
      });
    }

    // Verify current password
    const currentPasswordValid =
      await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

    if (!currentPasswordValid) {
      return res.status(400).json({
        error: "Current password is incorrect.",
      });
    }

    // Prevent reusing same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        error:
          "New password cannot be the same as your current password.",
      });
    }

    const newPasswordHash =
      await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      error:
        "Something went wrong while updating your password.",
    });
  }
}