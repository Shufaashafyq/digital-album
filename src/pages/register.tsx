"use client";

import { useState } from "react";
import Link from "next/link";
import { Caveat_Brush } from "next/font/google";
import { Eye, EyeClosed, Loader2 } from "lucide-react";
import {useForm, type SubmitHandler,} from "react-hook-form";
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
import { signUpSchema } from "@/validations/auth";

const caveatBrush = Caveat_Brush({
  weight: "400",
  subsets: ["latin"],
});

type RegisterFormValues = z.infer<
  typeof signUpSchema
>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] =
    useState(false);

  const [serverError, setServerError] =
    useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<
    RegisterFormValues
  > = async (data) => {
    setServerError("");

    try {
      const response = await fetch(
        "/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email
              .trim()
              .toLowerCase(),
            password: data.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setServerError(
          result.error ||
            "Something went wrong."
        );

        toast.error("Registration failed", {
          description:
            result.error ||
            "Please check your details and try again.",
        });

        return;
      }

      reset();
      setServerError("");
      setShowPassword(false);

      toast.success(
        "Account created successfully!",
        {
          description:
            result.message ||
            "Welcome to Digital Album.",
        }
      );
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setServerError(
        "Unable to connect to the server."
      );

      toast.error(
        "Registration failed",
        {
          description:
            "Unable to connect to the server. Please try again.",
        }
      );
    }
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-12"
      style={{
        backgroundColor: "#FBEAE7",
      }}
    >
      <div className="w-full max-w-sm">
        {/* Heading */}
        <div className="-translate-y-4 mb-5 text-center">
          <p
            className="mb-1 text-[11px] font-medium uppercase tracking-[0.22em]"
            style={{
              color: "#B2456E",
            }}
          >
            Digital Album
          </p>

          <p
            className={`${caveatBrush.className} mx-auto mt-1 max-w-sm text-[16px] leading-tight`}
            style={{
              color: "#B2456E",
            }}
          >
            A place for all the memories
            <br />
            you never want to forget
          </p>
        </div>

        {/* Registration Card + Sticker */}
        <div className="relative">
          {/* Sticker */}
          <img
            src="/stickers/camera.png"
            alt=""
            aria-hidden="true"
            className="absolute -right-3 -top-5 z-20 w-20 rotate-5"
          />

          {/* Registration Card */}
          <Card
            className="border-0 shadow-xl"
            style={{
              backgroundColor: "#FFFDFC",
              boxShadow:
                "0 20px 50px rgba(85, 38, 25, 0.10)",
            }}
          >
            <CardHeader className="px-7 pb-2 pt-4">
              <CardTitle
                className={`${caveatBrush.className} text-center text-4xl font-normal`}
                style={{
                  color: "#552619",
                }}
              >
                Create your account
              </CardTitle>

              <CardDescription
                className="mt-1 text-center text-xs"
                style={{
                  color: "#8B665B",
                }}
              >
                Enter your details below.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-7 pb-4">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-3.5"
                noValidate
              >
                {/* Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-[#552619]"
                  >
                    Name
                  </Label>

                  <Input
                    id="name"
                    type="text"
                    placeholder="Username"
                    autoComplete="name"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.name}
                    {...register("name")}
                    className={`h-11
                      border-[#E8C9C3]
                      bg-[#FBEAE7]
                      shadow-none
                      placeholder:text-[#B9968D]
                      focus-visible:ring-[#B2456E]
                      ${
                        errors.name
                          ? "border-[#E8A8B5] focus-visible:ring-[#C84B5E]"
                          : ""
                      }
                    `}
                  />

                  {errors.name && (
                    <p className="text-xs text-[#C84B5E]">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
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
                <div className="group space-y-1.5">
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
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
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
                          (current) =>
                            !current
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

                  {/* Password guidance / validation */}
                  <div className="min-h-8">
                    {errors.password ? (
                      <p className="text-xs text-[#C84B5E]">
                        {errors.password.message}
                      </p>
                    ) : (
                      <p className="pointer-events-none text-[10px] leading-4 text-[#9A756B]/70 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        Use at least 8 characters with an uppercase
                        letter, lowercase letter, number, and special
                        character.
                      </p>
                    )}
                  </div>
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
                      Creating...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              {/* Login */}
              <div className="mt-2 border-t border-[#EED9D5] pt-3 text-center">
                <p className="text-[11px] text-[#8B665B]">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold underline-offset-4 hover:underline"
                    style={{
                      color: "#B2456E",
                    }}
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Small footer */}
        <p className="mt-4 text-center text-xs text-[#A47C72]">
          Your memories, beautifully kept.
        </p>
      </div>
    </main>
  );
}