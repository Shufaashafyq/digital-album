import type {
  NextApiRequest,
  NextApiResponse,
} from "next";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);

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

    await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete account error:",
      error
    );

    return res.status(500).json({
      error:
        "Something went wrong while deleting your account.",
    });
  }
}