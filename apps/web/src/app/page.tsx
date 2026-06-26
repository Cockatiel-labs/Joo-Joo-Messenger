"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cloud,
  EyeOff,
  Globe,
  HatGlasses,
  MessageCircleDashed,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Carousel, type CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export default function Onboarding() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [step, setStep] = React.useState(0);

  const isLastStep = step === 2; // (3 - 1)

  React.useEffect(() => {
    if (api) {
      const onSelect = () => {
        setStep(api.selectedScrollSnap());
      };

      api.on("select", onSelect);
      onSelect();

      return () => {
        api.off("select", onSelect);
      };
    }
  }, [api]);

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Image
          src="/images/onboarding-picture.png"
          alt="Introduction"
          fill
          priority
          className="object-cover object-top"
        />
      </div>

      <div className="flex flex-col justify-center w-screen sm:w-full">
        <div className="flex w-full flex-col items-center px-4 py-6 sm:px-8 lg:px-16 xl:px-24">
          <div className="mb-8 flex w-full max-w-2xl items-center">
            {Array.from({ length: 3 }, (_, index) => index).map((index) =>
              step > index ? (
                <React.Fragment key={index}>
                  <button
                    type="button"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-primary border-2 text-sm font-semibold text-ring sm:h-10 sm:w-10"
                  >
                    <Check />
                  </button>

                  {index < 2 && <div className="mx-2 h-px flex-1 bg-primary sm:mx-4" />}
                </React.Fragment>
              ) : (
                <React.Fragment key={index}>
                  <button
                    type="button"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                     border-2 text-sm font-semibold sm:h-10 sm:w-10 transition-colors ${index <= step ? "border-primary text-primary" : "border-muted-foreground/20 text-muted-foreground"}
                  `}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>

                  {index < 2 && <div className="mx-2 h-px flex-1 bg-muted-foreground/20 sm:mx-4" />}
                </React.Fragment>
              ),
            )}
          </div>

          <Carousel
            className="w-full"
            setApi={setApi}
            opts={{
              dragFree: false,
              watchDrag: false,
            }}
          >
            <CarouselContent>
              <CarouselItem>
                <CardContent className="px-0 py-4 sm:px-2 lg:px-8">
                  <div className="mx-auto w-full max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-accent/30 px-4 py-2">
                      <HatGlasses className="size-5 text-primary fill-primary" />
                      <span className="text-sm font-semibold text-primary">Privacy First</span>
                    </div>

                    <div className="mt-8 space-y-2">
                      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
                        Your privacy.
                      </h1>

                      <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl xl:text-6xl">
                        Our priority.
                      </h1>
                    </div>

                    <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                      Joo-joo Messenger is built with end-to-end encryption and zero tracking. Your conversations belong
                      to you — always.
                    </p>

                    <div className="mt-8 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30 sm:h-14 sm:w-14">
                          <HatGlasses className="text-primary fill-primary" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">End-to-end encrypted</h3>

                          <p className="text-muted-foreground">Only you and your recipient can read messages.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30 sm:h-14 sm:w-14">
                          <Cloud className="text-primary" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">Cloud synced</h3>

                          <p className="text-muted-foreground">Securely sync across all your devices.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30 sm:h-14 sm:w-14">
                          <EyeOff className="text-primary" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">No tracking</h3>

                          <p className="text-muted-foreground">We don't collect your data. Ever.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CarouselItem>
              <CarouselItem>
                <CardContent className="px-0 py-4 sm:px-2 lg:px-8">
                  <div className="mx-auto w-full max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-accent/30 px-4 py-2">
                      <Zap className="size-5 text-transparent fill-primary" />
                      <span className="text-sm font-semibold text-primary">Fast & Reliable</span>
                    </div>

                    <div className="mt-8 space-y-2">
                      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
                        Speed that
                      </h1>

                      <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl xl:text-6xl">
                        Keeps up with you.
                      </h1>
                    </div>

                    <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                      Joo-joo Messenger delivers your messages instantly and reliably. With optimized performance and
                      cloud sync, you'll never miss a moment.
                    </p>

                    <div className="mt-8 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30 sm:h-14 sm:w-14">
                          <Zap className="text-transparent fill-primary" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">Instant delivery</h3>

                          <p className="text-muted-foreground">Messages reach your friends in real time.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30 sm:h-14 sm:w-14">
                          <Cloud className="text-primary" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">Cloud sync</h3>

                          <p className="text-muted-foreground">Your chats stay synced across all devices.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30 sm:h-14 sm:w-14">
                          <ShieldCheck className="text-primary" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">Always reliable</h3>

                          <p className="text-muted-foreground">Built for speed, uptime, and performance.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CarouselItem>
              <CarouselItem>
                <CardContent className="px-0 py-4 sm:px-2 lg:px-8">
                  <div className="mx-auto w-full max-w-xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-accent/30 px-4 py-2">
                      <Users className="size-5 text-primary fill-primary" />
                      <span className="text-sm font-semibold text-primary">Stay Connected</span>
                    </div>

                    <div className="mt-8 space-y-2">
                      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
                        Stay close to
                      </h1>

                      <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl lg:text-5xl xl:text-6xl">
                        what matters.
                      </h1>
                    </div>

                    <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                      Whether it's friends, family, or your team, Joo-joo Messenger keeps everyone connected — anywhere,
                      anytime.
                    </p>

                    <div className="mt-8 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30 sm:h-14 sm:w-14">
                          <Users className="text-primary fill-primary" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">Groups & communities</h3>

                          <p className="text-muted-foreground">Chat with groups of any size.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30 sm:h-14 sm:w-14">
                          <MessageCircleDashed className="text-primary" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">Rich conversations</h3>

                          <p className="text-muted-foreground">Share photos, files, voice messages and more.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/30 sm:h-14 sm:w-14">
                          <Globe className="text-primary" />
                        </div>

                        <div>
                          <h3 className="text-lg font-bold">Anywhere, anytime</h3>

                          <p className="text-muted-foreground">Stay connected on all your devices</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CarouselItem>
            </CarouselContent>
          </Carousel>

          <div className=" mt-4 flex flex-col w-full gap-2 sm:flex-row sm:w-full sm:max-w-2xl sm:justify-between">
            <Link href="/signin">
              <Button
                type="button"
                variant="ghost"
                className="h-12 w-full sm:w-32 text-primary border border-ring/40 transition-all hover:text-background hover:bg-primary"
              >
                Skip
              </Button>
            </Link>

            <span className="flex flex-col-reverse sm:flex-row gap-1">
              <Button
                type="button"
                variant="outline"
                className={`h-12 w-full sm:w-32 text-primary border border-ring/40 transition-all hover:text-background hover:bg-primary ${step === 0 ? "invisible" : "visible"}`}
                onClick={() => api?.scrollPrev()}
              >
                <ArrowLeft className="size-4" />
                Previous
              </Button>
              {isLastStep ? (
                <Link href="/signin">
                  <Button type="button" className="h-12 w-full sm:w-32" onClick={() => api?.scrollNext()}>
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              ) : (
                <Button type="button" className="h-12 w-full sm:w-32" onClick={() => api?.scrollNext()}>
                  Next
                  <ArrowRight className="size-4" />
                </Button>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
