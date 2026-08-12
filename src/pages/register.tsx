import { FormEvent, useState } from "react";
import Link from "next/link";
import { Caveat_Brush, Hachi_Maru_Pop } from "next/font/google";

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

const hachiMaruPop = Hachi_Maru_Pop({
  weight: "400",
  subsets: ["latin"],
});

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setSuccess(data.message || "Account created successfully!");

      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12"
      style={{ backgroundColor: "#FBEAE7" }}
    >
    {/* <img
        src="/stickers/flip_phone.png"
        alt=""
        aria-hidden="true"
        className="absolute left-[25%] top-[27%] w-25 -rotate-12" //positioning the sticker
        />
    */}
     {/*<img
        src="/stickers/butterfly.png"
        alt=""
        aria-hidden="true"
        className="absolute right-[33%] top-[10%] w-20 rotate-12" //positioning the sticker
     />
    */}
        <img
        src="/stickers/camera.png"
        alt=""
        aria-hidden="true"
        className="absolute right-[36%] top-[27%] w-27 rotate-5"
        />     

    {/*  <img
         src="/stickers/cd.png"
         alt=""
         aria-hidden="true"
         className="absolute bottom-[15%] left-[25%] w-25 -rotate-6"
        />
    */}
    
      <div className="w-full max-w-md">

        {/* Brand / Heading */}
        <div className="mb-8 text-center">
          <p
            className="mb-3 text-sm font-medium uppercase tracking-[0.25em]"
            style={{ color: "#B2456E" }}
          >
            Digital Album
          </p>

          <p
            className={`${caveatBrush.className} mx-auto mt-3 max-w-sm text-2xl`}
            style={{ color: "#B2456E" }}
          >
             A place for all the memories you never want to forget
          </p>
        </div>

        {/* Registration Card */}
        <Card
          className="border-0 shadow-xl"
          style={{
            backgroundColor: "#FFFDFC",
            boxShadow: "0 20px 50px rgba(85, 38, 25, 0.10)",
          }}
        >
          <CardHeader className="px-8 pb-4 pt-8">
            <CardTitle
              className={`${caveatBrush.className} text-center text-4xl font-normal`}
              style={{ color: "#552619" }}
            >
              Create your account
            </CardTitle>

            <CardDescription
              className="tmt-1 text-center text-sm"
              style={{ color: "#8B665B" }}
            >
              Enter your details below.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-[#552619]"
                  //style={{ color: "#552619" }}
                >
                  Name:
                </Label>

                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="username"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  className="h-11 border-[#E8C9C3] bg-[#FBEAE7] shadow-none placeholder:text-[#B9968D] focus-visible:ring-[#B2456E]"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-[#552619]"
                  //style={{ color: "#552619" }}
                >
                  Email:
                </Label>

                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="h-11 border-[#E8C9C3] bg-[#FBEAE7] shadow-none placeholder:text-[#B9968D] focus-visible:ring-[#B2456E]"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-[#552619]"
                  //style={{ color: "#552619" }}
                >
                  Password:
                </Label>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-11 border-[#E8C9C3] bg-[#FBEAE7] shadow-none placeholder:text-[#B9968D] focus-visible:ring-[#B2456E]"
                />

                <p className="text-xs text-[#9A756B]">
                  Your password must be at least 8 characters.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-lg border border-[#B2456E]/20 bg-[#FBEAE7] px-4 py-3">
                  <p
                    className="text-sm"
                    style={{ color: "#B2456E" }}
                  >
                    {success}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex w-full justify-center">
  <Button
    type="submit"
    disabled={loading}
    className="h-11 w-40 rounded-lg text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
    style={{ backgroundColor: "#B2456E" }}
  >
    {loading ? "Creating account..." : "Create account"}
  </Button>
</div>
            </form>

            {/* Login */}
            <div className="mt-7 border-t border-[#EED9D5] pt-6 text-center">
              <p className="text-sm text-[#8B665B]">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold underline-offset-4 hover:underline"
                  style={{ color: "#B2456E" }}
                >
                  Log in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Small footer */}
        <p className="mt-6 text-center text-xs text-[#A47C72]">
          Your memories, beautifully kept.
        </p>
      </div>
    </main>
  );
}

