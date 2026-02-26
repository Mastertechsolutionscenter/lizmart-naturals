"use client";

import { serverSignIn } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type SignInProps = {
  provider?: string;
} & React.ComponentPropsWithRef<typeof Button>;

export function SignIn({ provider, ...props }: SignInProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (provider === "nodemailer") {
      // For magic link: require email
      if (!email) {
        setError("Please enter your email address");
        return;
      }
      setError(null);
      setStatus("loading");
      try {
        await serverSignIn(provider, { email, callbackUrl: "/" });
        setStatus("sent");
      } catch (err) {
        console.error("Magic link error:", err);
        setError("Could not send magic link. Try again.");
        setStatus("idle");
      }
    } else {
      // For OAuth providers like google, apple
      setStatus("loading");
      try {
        await serverSignIn(provider, { callbackUrl: "/" });
      } catch (err) {
        console.error("OAuth sign in error:", err);
        setError("Sign in failed. Try again.");
        setStatus("idle");
      }
    }
  };

  if (status === "sent") {
    return <p>Check your email. Magic link has been sent!</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {provider === "nodemailer" && (
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border px-2 py-1"
          />
        </div>
      )}
      <Button type="submit" {...props} disabled={status === "loading"}>
  {status === "loading"
    ? "Loading..."
    : provider === "nodemailer"
      ? "Send Magic Link"
      : provider
        ? `Sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`
        : "Sign in"
  }
</Button>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </form>
  );
}
