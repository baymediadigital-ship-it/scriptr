"use client";

import { useEffect, useRef } from "react";

interface Thumb {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
}

const STATIC_THUMBNAILS: Thumb[] = [
  { id: "t01", title: "$300 Billion Empire", channel: "Documentary", thumbnail: "/thumbnails/image-1778933575474.jpg" },
  { id: "t02", title: "The Fall of Rome", channel: "History", thumbnail: "/thumbnails/image-1778933594577.jpg" },
  { id: "t03", title: "67° — The Hottest Seat in F1", channel: "Motorsport", thumbnail: "/thumbnails/image-1778933599378.jpg" },
  { id: "t04", title: "Building the Twin Towers: 1968–1973", channel: "Engineering", thumbnail: "/thumbnails/image-1778933603613.jpg" },
  { id: "t05", title: "Awardless — The DiCaprio Story", channel: "Entertainment", thumbnail: "/thumbnails/image-1778933607194.jpg" },
  { id: "t06", title: "Ferrari SF90", channel: "Supercar", thumbnail: "/thumbnails/image-1778933610936.jpg" },
  { id: "t07", title: "Thanos vs One Piece", channel: "Anime", thumbnail: "/thumbnails/image-1778933614507.jpg" },
  { id: "t08", title: "The Downfall", channel: "Music", thumbnail: "/thumbnails/image-1778933617948.jpg" },
  { id: "t09", title: "Breaking Bad: The Final Scene", channel: "Film", thumbnail: "/thumbnails/image-1778933620879.jpg" },
  { id: "t10", title: "AI Is Ruining Smartphones", channel: "Marques Brownlee", thumbnail: "/thumbnails/image-1778933623845.jpg" },
  { id: "t11", title: "The Andrew Tate Timeline", channel: "Documentary", thumbnail: "/thumbnails/image-1778933629882.jpg" },
  { id: "t12", title: "Aviation Disaster", channel: "Real Engineering", thumbnail: "/thumbnails/image-1778933633266.jpg" },
  { id: "t13", title: "Inside the White House", channel: "Politics", thumbnail: "/thumbnails/image-1778933636446.jpg" },
  { id: "t14", title: "$0 to $1M — Start Now", channel: "Finance", thumbnail: "/thumbnails/image-1778933640704.jpg" },
  { id: "t15", title: "The Dopamine Detox", channel: "Self Improvement", thumbnail: "/thumbnails/image-1778933646617.jpg" },
];

export function ThumbnailCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const xRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const SPEED = 3.5;
    const CARD_W = 292;

    function tick() {
      if (!pausedRef.current) {
        xRef.current += SPEED;
        const halfW = STATIC_THUMBNAILS.length * CARD_W;
        if (xRef.current >= halfW) xRef.current = 0;
        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(-${xRef.current}px)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const doubled = [...STATIC_THUMBNAILS, ...STATIC_THUMBNAILS];

  return (
    <div
      className="overflow-hidden relative"
      style={{
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
        maskImage: "linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)",
      }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div
        ref={trackRef}
        className="flex gap-3"
        style={{ width: "max-content", willChange: "transform" }}
      >
        {doubled.map((item, i) => (
          <div
            key={`${item.id}-${i}`}
            className="flex-shrink-0 rounded-xl overflow-hidden relative group"
            style={{ width: 280, height: 157, background: "rgba(255,255,255,0.04)" }}
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 60%)" }}
            >
              <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">{item.title}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{item.channel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
