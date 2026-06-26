"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type SignupInput, signupSchema } from "@joo-joo/shared/schemas/auth/auth.schema";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, LucideProvider } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useCheckUsernameQuery, useSignupMutate } from "../hooks/use-auth";
import { checkPasswordStrength } from "../utils/password-strength-checker";

export default function Signup() {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    control,
    reset,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  });

  const username = useWatch({
    control,
    name: "username",
    defaultValue: "",
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const { mutate, isPending } = useSignupMutate();

  const usernameQuery = useDebounce(username, 500) ?? "";

  const { data, isLoading, isError } = useCheckUsernameQuery(usernameQuery);

  const onSubmit: SubmitHandler<SignupInput> = (payload) => {
    mutate(payload, {
      onSuccess: () => {
        reset();
      },
    });
  };

  const strength = checkPasswordStrength(password);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-6">
          <Image
            src="/images/logo.png"
            alt="Joo-joo Messenger"
            width={64}
            height={64}
            loading="eager"
            className="size-16 mx-auto"
          />
          <h1 className="text-3xl font-bold mt-4">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Join Joo-joo Messenger and start secure conversations</p>
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
                {...register("username")}
              />
              {errors.username ? (
                <FieldDescription className="flex items-center gap-2 text-sm text-error">
                  <AlertCircle className="size-4" />
                  <span>{errors.username.message}</span>
                </FieldDescription>
              ) : isLoading ? (
                <FieldDescription className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Checking username...</span>
                </FieldDescription>
              ) : isError ? (
                <FieldDescription className="flex items-center gap-2 text-sm text-error">
                  <AlertCircle className="size-4" />
                  <span>Failed to check username</span>
                </FieldDescription>
              ) : data === true ? (
                <FieldDescription className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="size-4" />
                  <span>Username is available</span>
                </FieldDescription>
              ) : data === false ? (
                <FieldDescription className="flex items-center gap-2 text-sm text-error">
                  <AlertCircle className="size-4" />
                  <span>This username is already taken</span>
                </FieldDescription>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <span className="relative">
                <Input
                  id="password"
                  type={isShowPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className="pr-12"
                  {...register("password")}
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

              {password.length > 0 && errors.password && (
                <FieldDescription className="flex items-center gap-2 text-sm text-error">
                  <AlertCircle className="size-4" />
                  {errors.password.message}
                </FieldDescription>
              )}

              {password.length >= 8 && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-1 gap-2">
                      {["weak", "medium", "strong"].map((level, index) => {
                        let color = "bg-gray-300";

                        if (strength === "Weak") {
                          color = index < 1 ? "bg-red-500" : "bg-gray-300";
                        } else if (strength === "Medium") {
                          color = index < 2 ? "bg-amber-500" : "bg-gray-300";
                        } else if (strength === "Strong") {
                          color = "bg-emerald-500";
                        }

                        return <span key={level} className={cn("h-1 flex-1 rounded", color)} />;
                      })}
                    </div>
                    <span
                      className={cn(
                        "ml-2 text-xs font-medium w-10 text-end",
                        strength === "Weak"
                          ? "text-red-500"
                          : strength === "Medium"
                            ? "text-amber-500"
                            : "text-emerald-500",
                      )}
                    >
                      {strength === "Weak" ? "Weak" : strength === "Medium" ? "Medium" : "Strong"}
                    </span>
                  </div>
                  <FieldDescription className="text-sm text-muted-foreground">
                    Weak passwords are allowed, but we recommend choosing a stronger one for better account security.
                  </FieldDescription>
                </>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <span className="relative">
                <Input
                  id="confirm-password"
                  type={isShowConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  className="pr-12"
                  {...register("confirmPassword")}
                />
                <LucideProvider size={24} strokeWidth={1.5} className="absolute top-2.75 right-2.5">
                  <button
                    type="button"
                    aria-label={isShowConfirmPassword ? "Hide password" : "Show password"}
                    onClick={() => setIsShowConfirmPassword((prev) => !prev)}
                  >
                    {isShowConfirmPassword ? <Eye /> : <EyeOff />}
                  </button>
                </LucideProvider>
              </span>
              {errors.confirmPassword && (
                <FieldDescription className="flex items-center gap-2 text-sm text-error">
                  <AlertCircle className="size-4" />
                  {errors.confirmPassword.message}
                </FieldDescription>
              )}
            </Field>

            <Field>
              <Button type="submit" className="h-12 w-full" disabled={!isValid || isPending}>
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </Field>
          </FieldGroup>
        </form>

        <Separator />

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?&nbsp;
          <a href="/signin" className="font-medium underline">
            Sign in
          </a>
        </div>
      </Card>
    </div>
  );
}
