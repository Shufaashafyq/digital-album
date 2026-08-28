"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { Caveat_Brush } from "next/font/google";
import { Eye, EyeClosed, Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const caveatBrush = Caveat_Brush({
  weight: "400",
  subsets: ["latin"],
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),

  password: z
    .string()
    .min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

 const onSubmit: SubmitHandler<LoginFormValues> = async (
  data
) => {
  setServerError("");

  try {
    const result = await signIn("credentials", {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      redirect: false,
    });

    if (!result || result.error) {
      setServerError("Invalid email or password.");

      toast.error("Login failed", {
        description: "Invalid email or password.",
      });

      return;
    }

    toast.success("Login successful!", {
      description: "Welcome back to your memories.",
    });

    await router.push("/dashboard");
  } catch (error) {
    console.error("Login error:", error);

    setServerError(
      "Something went wrong. Please try again."
    );

    toast.error("Something went wrong", {
      description: "Please try again.",
    });
  }
};

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-12"
      style={{ backgroundColor: "#FBEAE7" }}
    >
      <div className="w-full max-w-sm">
        {/* Heading */}
        <div className="-translate-y-4 mb-5 text-center">
          <p
            className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.22em]"
            style={{ color: "#B2456E" }}
          >
            Digital Album
          </p>

          <p
            className={`${caveatBrush.className}  mx-auto mt-1 max-w-sm text-[16px] leading-tight`}
            style={{ color: "#B2456E" }}
          >
            A place for all the memories
            <br />
            you never want to forget
          </p>
        </div>

        {/* Login Card + Sticker */}
        <div className="relative">
          {/* Sticker */}
          <img
            src="/stickers/flip_phone.png"
            alt=""
            aria-hidden="true"
            className="absolute left-4 -top-5 z-20 w-20 -rotate-12"
          />

          {/* Login Card */}
          <Card
            className="border-0 shadow-xl"
            style={{
              backgroundColor: "#FFFDFC",
              boxShadow:
                "0 20px 50px rgba(85, 38, 25, 0.10)",
            }}
          >
            <CardHeader className="px-7 pb-4 pt-7">
              <CardTitle
                className={`${caveatBrush.className} text-center text-4xl font-normal`}
                style={{ color: "#552619" }}
              >
                Welcome back
              </CardTitle>

              <CardDescription
                className="mt-1 text-center text-xs"
                style={{ color: "#8B665B" }}
              >
                Log in to continue to build your albums.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-7 pb-7">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
              >
                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-[#552619]"
                  >
                    Email
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    {...register("email")}
                    className={`
                      h-11
                      border-[#E8C9C3]
                      bg-[#FBEAE7]
                      shadow-none
                      placeholder:text-[#B9968D]
                      focus-visible:ring-[#B2456E]
                      ${
                        errors.email
                          ? "border-[#E8A8B5] focus-visible:ring-[#C84B5E]"
                          : ""
                      }
                    `}
                  />

                  {errors.email && (
                    <p className="text-xs text-[#C84B5E]">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-[#552619]"
                  >
                    Password
                  </Label>

                  <div className="relative">
                    <Input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      aria-invalid={!!errors.password}
                      {...register("password")}
                      className={`
                        h-11
                        border-[#E8C9C3]
                        bg-[#FBEAE7]
                        pr-11
                        shadow-none
                        placeholder:text-[#B9968D]
                        focus-visible:ring-[#B2456E]
                        ${
                          errors.password
                            ? "border-[#E8A8B5] focus-visible:ring-[#C84B5E]"
                            : ""
                        }
                      `}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      disabled={isSubmitting}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B665B] transition hover:text-[#B2456E] disabled:opacity-50"
                    >
                      {showPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeClosed className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-xs text-[#C84B5E]">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Server Error */}
                {serverError && (
                  <div className="rounded-lg border border-[#E8A8B5] bg-[#FBE0E4] px-4 py-3">
                    <p className="text-sm text-[#9E3A55]">
                      {serverError}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-lg text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
                  style={{
                    backgroundColor: "#B2456E",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log in"
                  )}
                </Button>
              </form>

              {/* Register */}
              <div className="mt-1 border-t border-[#EED9D5] pt-6 text-center">
                <p className="text-[11px] text-[#8B665B]">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold underline-offset-4 hover:underline"
                    style={{
                      color: "#B2456E",
                    }}
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Small footer */}
        <p className="mt-6 text-center text-xs text-[#A47C72]">
          Your memories, beautifully kept.
        </p>
      </div>
    </main>
  );
}