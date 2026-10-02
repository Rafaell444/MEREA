type Social = { name: string; href: string; icon: string };

function Icon({ icon }: { icon: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "currentColor" };
  switch (icon) {
    case "vk":
      return (
        <svg {...common} aria-hidden>
          <path d="M3 7h3.2c.2 4.1 2 6 3.6 6.4V7h3v3.7c1.5-.2 3.1-2 3.7-3.7h3c-.4 2.3-2.2 4.1-3.4 4.8 1.2.6 3.2 2.2 4 4.7h-3.3c-.6-1.9-2.1-3.4-4-3.6V17h-.4C7.4 17 3.2 13.6 3 7z" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...common} aria-hidden>
          <path d="M21.5 4.5 2.9 11.7c-1 .4-1 1 0 1.3l4.7 1.5 1.8 5.6c.2.6.4.8 1 .4l2.6-2.1 4.9 3.6c.8.5 1.4.2 1.6-.8l3-14.1c.3-1.2-.4-1.7-1-1.6zM9 14.1l9.4-5.9c.4-.3.8 0 .5.3L11 15.8l-.3 3.1L9 14.1z" />
        </svg>
      );
    case "youtube":
      return (
        <svg {...common} aria-hidden>
          <path d="M22 8.2c-.2-1.3-1-2.1-2.3-2.3C17.8 5.6 12 5.6 12 5.6s-5.8 0-7.7.3C3 6.1 2.2 6.9 2 8.2 1.7 10.1 1.7 12 1.7 12s0 1.9.3 3.8c.2 1.3 1 2.1 2.3 2.3 1.9.3 7.7.3 7.7.3s5.8 0 7.7-.3c1.3-.2 2.1-1 2.3-2.3.3-1.9.3-3.8.3-3.8s0-1.9-.3-3.8zM10 15V9l5.2 3L10 15z" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} aria-hidden>
          <path d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5.9-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 2.2c-2.7 0-3 0-4 .1C5 2.4 3.4 4 3.3 7c-.1 1-.1 1.3-.1 4s0 3 .1 4c.1 3 1.7 4.6 4.7 4.7 1 .1 1.3.1 4 .1s3 0 4-.1c3-.1 4.6-1.7 4.7-4.7.1-1 .1-1.3.1-4s0-3-.1-4C20.6 4 19 2.4 16 2.3c-1-.1-1.3-.1-4-.1zm0 1.7c2.7 0 3 0 4 .1 2.1.1 3.2 1.1 3.3 3.3.1 1 .1 1.3.1 3.9s0 2.9-.1 3.9c-.1 2.1-1.1 3.2-3.3 3.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-2.1-.1-3.2-1.1-3.3-3.3-.1-1-.1-1.3-.1-3.9s0-2.9.1-3.9c.1-2.1 1.1-3.2 3.3-3.3 1-.1 1.3-.1 4-.1z" />
        </svg>
      );
    default:
      return <span className="text-xs font-bold">{icon.slice(0, 2).toUpperCase()}</span>;
  }
}

export default function SocialIcons({ socials }: { socials: Social[] }) {
  return (
    <div className="flex items-center gap-3">
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.name}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-black transition-all duration-300 hover:bg-black hover:text-white hover:border-black"
        >
          <Icon icon={s.icon} />
        </a>
      ))}
    </div>
  );
}
