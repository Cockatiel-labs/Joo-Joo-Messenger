"use client";

import type { SigninInput } from "@joo-joo/shared/schemas/auth/auth.schema";
import { AlertCircle, Eye, EyeOff, LucideProvider } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useSigninMutate } from "../hooks/use-auth";

export default function Signin() {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const { mutate } = useSigninMutate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninInput>({
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<SigninInput> = (payload) => {
    mutate(payload);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="mb-6 text-center">
          <Image
            src="/images/logo.png"
            alt="Joo-joo Messenger"
            width={64}
            height={64}
            loading="eager"
            className="mx-auto size-16"
          />

          <h1 className="mt-4 text-3xl font-bold">Welcome back</h1>

          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your secure conversations.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>

              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                {...register("username", {
                  required: "Username is required",
                })}
              />

              {errors.username && (
                <FieldDescription className="flex items-center gap-2 text-sm text-error">
                  <AlertCircle className="size-4" />
                  <span>{errors.username.message}</span>
                </FieldDescription>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <span className="relative">
                <Input
                  id="password"
                  type={isShowPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                <LucideProvider size={24} strokeWidth={1.5} className="absolute top-2.75 right-2.5 cursor-pointer">
                  <button
                    type="button"
                    aria-label={isShowPassword ? "Hide password" : "Show password"}
                    onClick={() => setIsShowPassword((prev) => !prev)}
                  >
                    {isShowPassword ? <Eye /> : <EyeOff />}
                  </button>
                </LucideProvider>
              </span>

              {errors.password && (
                <FieldDescription className="flex items-center gap-2 text-sm text-error">
                  <AlertCircle className="size-4" />
                  <span>{errors.password.message}</span>
                </FieldDescription>
              )}
            </Field>

            <Field>
              <Button type="submit" className="h-12 w-full">
                Sign In
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium underline">
            Create one
          </Link>
        </div>
      </Card>
    </div>
  );
}
