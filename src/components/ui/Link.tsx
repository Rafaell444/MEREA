"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "@/lib/i18n/client";
import { localizePath } from "@/lib/i18n/config";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string; locale?: never };

/** Drop-in replacement for next/link that keeps the active language prefix on internal links. */
export default function Link({ href, ...rest }: Props) {
  const locale = useLocale();
  return <NextLink href={localizePath(href, locale)} {...rest} />;
}
