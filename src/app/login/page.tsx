"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const { email, password, remember } = Object.fromEntries(
      formData.entries()
    ) as Record<string, string>;

    setLoading(true);
    const { error } = await authClient.signIn.email({
      email,
      password,
      rememberMe: remember === "on",
    });
    setLoading(false);

    if (error) {
      const message =
        error.message ?? "Something went wrong. Please try again.";
      setFormError(message);
      toast.error("Login failed", { description: message });
      return;
    }

    toast.success("Welcome back! ✈️", {
      description: "You're logged in to Wanderlast.",
    });
    router.push("/");
  };

  return (
    <AuthShell image="/imges/CTA.png" imageAlt="Travel destination">
      <div className="flex w-full flex-col gap-6 sm:max-w-sm">
        <Card className="shadow-xl ring-black/5">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl font-semibold">
              Welcome back
            </CardTitle>
            <CardDescription>
              Log in to your Wanderlast account to keep exploring the destinations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailLogin}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    autoComplete="email"
                    required
                  />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-xs text-muted-foreground underline-offset-4 hover:text-brand hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                  />
                </Field>

                <Field orientation="horizontal">
                  <label
                    htmlFor="remember"
                    className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
                  >
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      defaultChecked
                      className="size-4 accent-brand"
                    />
                    Remember me
                  </label>
                </Field>

                {formError ? <FieldError>{formError}</FieldError> : null}

                <Field>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-brand text-white hover:bg-brand/85 disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" aria-hidden />
                        Logging in…
                      </>
                    ) : (
                      "Log in"
                    )}
                  </Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/sign-up"
                      className="font-medium hover:underline"
                    >
                      Sign up
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <FieldDescription className="text-center">
          By logging in, you agree to our <a href="#">Terms of Service</a> and{" "}
          <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </AuthShell>
  );
}
