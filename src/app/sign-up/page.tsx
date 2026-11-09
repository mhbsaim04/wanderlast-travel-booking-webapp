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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleEmailSignUp = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);
    const { name, image, email, password, confirmPassword } =
      Object.fromEntries(formData.entries()) as Record<string, string>;

    if (confirmPassword && confirmPassword !== password) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      image: image || undefined,
    });
    setLoading(false);

    if (error) {
      const message =
        error.message ?? "Something went wrong. Please try again.";
      setFormError(message);
      toast.error("Sign up failed", { description: message });
      return;
    }

    toast.success("Welcome to Wanderlast! 🎉", {
      description: "Your account has been created.",
    });
    router.push("/");
  };

  return (
    <AuthShell image="/imges/destinations/image7.jpg" imageAlt="Travel destination">
      <div className="flex w-full flex-col gap-6 sm:max-w-sm">
        <Card className="shadow-xl ring-black/5">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-2xl font-semibold">
              Create your account
            </CardTitle>
            <CardDescription>
              Join Wanderlast and start planning your next adventure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSignUp}>
              <FieldGroup>
                <Field>
                  <Button
                    variant="outline"
                    size="lg"
                    type="button"
                    className="w-full"
                    onClick={() =>
                      toast.info("Social sign-up is coming soon", {
                        description:
                          "Please use email and password for now.",
                      })
                    }
                  >
                    <GoogleIcon />
                    Continue with Google
                  </Button>
                </Field>

                <FieldSeparator>or continue with email</FieldSeparator>

                <Field>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your Full Name"
                    autoComplete="name"
                    required
                  />
                </Field>

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
                  <FieldLabel htmlFor="image">
                    Profile image URL{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FieldLabel>
                  <Input
                    id="image"
                    name="image"
                    type="url"
                    placeholder="https://…"
                    autoComplete="off"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <FieldDescription>Must be at least 8 characters.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirm password
                  </FieldLabel>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                  />
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
                        Creating account…
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>
                  <FieldDescription className="text-center">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium hover:underline">
                      Log in
                    </Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <FieldDescription className="text-center">
          By signing up, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </AuthShell>
  );
}
