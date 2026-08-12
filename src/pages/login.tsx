import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
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

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      // Login successful
      await router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-12"
      style={{ backgroundColor: "#FBEAE7" }}
    >

          <img
        src="/stickers/flip_phone.png"
        alt=""
        aria-hidden="true"
        className="absolute left-[38%] top-[24%] w-25 -rotate-12" //positioning the sticker
    />

    
    
      <div className="w-full max-w-md">

        {/* Heading */}
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

        {/* Login Card */}
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
              Welcome back
            </CardTitle>

            <CardDescription
              className="mt-1 text-center text-sm"
              style={{ color: "#8B665B" }}
            >
              Log in to continue to your memories.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium"
                >
                  Email
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
                  className="text-sm font-medium"
                >
                  Password
                </Label>

                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="h-11 border-[#E8C9C3] bg-[#FBEAE7] shadow-none placeholder:text-[#B9968D] focus-visible:ring-[#B2456E]"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg text-sm font-medium text-white shadow-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#B2456E" }}
              >
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>

            {/* Register */}
            <div className="mt-7 border-t border-[#EED9D5] pt-6 text-center">
              <p className="text-sm text-[#8B665B]">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold underline-offset-4 hover:underline"
                  style={{ color: "#B2456E" }}
                >
                  Create one
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

