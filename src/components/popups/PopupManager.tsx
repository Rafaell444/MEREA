"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "@/components/ui/Link";
import Modal from "@/components/ui/Modal";
import type { PopupConfig } from "@/lib/cms/content";
import { cn } from "@/lib/utils";
import { useT, usePath } from "@/lib/i18n/client";

const LS_PREFIX = "tz-popup:";

function seen(key: string, frequencyDays: number) {
  try {
    const v = localStorage.getItem(LS_PREFIX + key);
    if (!v) return false;
    return Date.now() - Number(v) < frequencyDays * 86400000;
  } catch {
    return false;
  }
}
function markSeen(key: string) {
  try { localStorage.setItem(LS_PREFIX + key, String(Date.now())); } catch { /* ignore */ }
}
function matches(path: string, list: string[]) {
  return list.some((p) => path === p || path.startsWith(p));
}

/** Renders every enabled CMS popup with its own timing rules; cookie consent always has priority. */
export default function PopupManager({ popups }: { popups: PopupConfig[] }) {
  const pathname = usePath();
  const [active, setActive] = useState<string | null>(null);
  const [cookieDone, setCookieDone] = useState(false);

  const cookie = useMemo(() => popups.find((p) => p.key === "cookie"), [popups]);
  const others = useMemo(() => popups.filter((p) => p.key !== "cookie"), [popups]);

  // Cookie consent first
  useEffect(() => {
    if (!cookie) { setCookieDone(true); return; }
    if (seen("cookie", cookie.frequencyDays)) { setCookieDone(true); return; }
    const t = setTimeout(() => setActive("cookie"), cookie.delaySeconds * 1000);
    return () => clearTimeout(t);
  }, [cookie]);

  // Other popups once cookie consent is handled
  useEffect(() => {
    if (!cookieDone || active) return;
    const candidates = others.filter((p) => {
      if (seen(p.key, p.frequencyDays)) return false;
      if (p.showOnPaths.length && !matches(pathname, p.showOnPaths)) return false;
      if (p.excludePaths.length && matches(pathname, p.excludePaths)) return false;
      return true;
    });
    const p = candidates[0];
    if (!p) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let fired = false;
    const fire = () => { if (fired) return; fired = true; setActive(p.key); };
    if (p.scrollPercent > 0) {
      const onScroll = () => {
        const pct = (window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100;
        if (pct >= p.scrollPercent) { fire(); window.removeEventListener("scroll", onScroll); }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      timer = setTimeout(fire, Math.max(p.delaySeconds, 30) * 1000);
      return () => { window.removeEventListener("scroll", onScroll); if (timer) clearTimeout(timer); };
    }
    timer = setTimeout(fire, p.delaySeconds * 1000);
    return () => { if (timer) clearTimeout(timer); };
  }, [cookieDone, active, others, pathname]);

  const close = (key: string) => {
    markSeen(key);
    setActive(null);
    if (key === "cookie") setCookieDone(true);
  };

  const current = popups.find((p) => p.key === active);
  if (!current) return null;
  if (current.key === "cookie") return <CookieConsent popup={current} onAccept={() => close("cookie")} />;
  return <NewsletterPopup popup={current} onClose={() => close(current.key)} />;
}

/* ---------------- Cookie consent ("Персонализированная навигация") ---------------- */
function CookieConsent({ popup, onAccept }: { popup: PopupConfig; onAccept: () => void }) {
  const t = useT();
  return (
    <Modal open closable={false} size="sm" className="max-w-[560px] rounded-sm">
      <div className="px-8 py-10 text-center sm:px-12">
        <h2 className="mb-4 text-lg font-bold sm:text-xl">{popup.title ? t(popup.title) : null}</h2>
        <p className="text-xsm leading-5 text-gray-900 sm:text-sm sm:leading-6">
          {popup.body ? t(popup.body) : null}{" "}
          {popup.secondaryText && popup.ctaHref && (
            <Link href={popup.ctaHref} className="underline underline-offset-2" target="_blank">
              {t(popup.secondaryText)}
            </Link>
          )}
          .
        </p>
        <button onClick={onAccept} className="btn-primary mt-8 h-11 min-w-[180px] uppercase tracking-wide">
          {popup.ctaText ? t(popup.ctaText) : t("Принять")}
        </button>
      </div>
    </Modal>
  );
}

/* ---------------- Newsletter / registration promo ("-10% за регистрацию") ---------------- */
function NewsletterPopup({ popup, onClose }: { popup: PopupConfig; onClose: () => void }) {
  const t = useT();
  const cfg = popup.config as Record<string, string>;
  const loyaltyLink = cfg.consentPrivacyLink ? <Link href={cfg.consentPrivacyLink} className="underline" target="_blank">{t("программы лояльности")}</Link> : t("программы лояльности");
  const [acceptBefore, acceptAfter = ""] = t("Принимаю условия {link}").split("{link}");
  const [email, setEmail] = useState("");
  const [privacy, setPrivacy] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!privacy) { setError(t("Необходимо принять условия программы лояльности")); return; }
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source: "popup", consent: marketing }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t("Ошибка"));
      setState("done");
    } catch (err) {
      setState("error");
      setError((err as Error).message);
    }
  }

  return (
    <Modal open onClose={onClose} size="lg" className="overflow-hidden rounded-sm max-w-[760px]">
      <div className="grid sm:grid-cols-[300px_1fr]">
        {popup.image && (
          <div className="relative hidden sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={popup.image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="px-8 py-10 text-center">
          {state === "done" ? (
            <div className="py-6">
              <h2 className="mb-3 text-lg font-bold">{cfg.successTitle ? t(cfg.successTitle) : t("Спасибо!")}</h2>
              <p className="text-sm text-gray-900">{cfg.successText ? t(cfg.successText) : null}</p>
              {popup.ctaHref && (
                <Link href={popup.ctaHref} onClick={onClose} className="btn-primary mt-6 h-10 px-6">
                  {popup.ctaText ? t(popup.ctaText) : null}
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="mb-3 text-lg font-bold leading-tight sm:text-xl">{popup.title ? t(popup.title) : null}</h2>
              {popup.body && <p className="mb-6 text-sm text-gray-900">{t(popup.body)}</p>}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={cfg.placeholder ? t(cfg.placeholder) : t("Электронная почта")}
                className="h-11 w-full rounded-full border border-gray-300 bg-off-white px-5 text-center text-sm placeholder:text-gray-500 focus:border-black"
              />
              <button type="submit" disabled={state === "loading"} className="btn-primary mt-3 h-11 w-full">
                {popup.ctaText ? t(popup.ctaText) : t("Зарегистрироваться")}
              </button>
              <div className="mt-5 space-y-2 text-left text-[10px] leading-3 text-gray-500">
                {cfg.consentPrivacy && (
                  <p>
                    {t(cfg.consentPrivacy)}{" "}
                    {cfg.consentPrivacyLink && <Link href={cfg.consentPrivacyLink} className="underline" target="_blank">{t("программы лояльности")}</Link>}
                  </p>
                )}
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 accent-black" />
                  <span>{acceptBefore}{loyaltyLink}{acceptAfter}</span>
                </label>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 accent-black" />
                  <span>
                    {cfg.consentMarketing ? t(cfg.consentMarketing) : t("Даю своё согласие на получение рекламной рассылки")}{" "}
                    {cfg.consentMarketingLink && <Link href={cfg.consentMarketingLink} className="underline" target="_blank">{t("(политика конфиденциальности)")}</Link>}
                  </span>
                </label>
                {error && <p className={cn("text-error text-xsm")}>{t(error)}</p>}
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}
