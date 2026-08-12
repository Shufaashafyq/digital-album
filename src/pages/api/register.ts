import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/validations/auth";

type ResponseData = {
  message?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  // Validate the submitted data
  const parsed = signUpSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error:
        parsed.error.issues[0]?.message ?? "Invalid input",
    });
  }

  const { name, email, password } = parsed.data;

  try {
    // Check whether the email is already registered
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, 12);

    // Create the user
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      error: "Something went wrong while creating your account",
    });
  }
}