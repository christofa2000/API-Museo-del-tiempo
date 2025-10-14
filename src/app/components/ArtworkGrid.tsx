"use client";

type Artwork = {
  id: number;
  title: string;
  artist: string | null;
  date: string;
  image: string | null;
};

export default function ArtworkGrid({ items }: { items: Artwork[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {items.map((a) => (
        <article
          key={a.id}
          className="group overflow-hidden rounded-xl border border-white/10 bg-white/5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.image ?? "/placeholder.png"}
            alt={a.title}
            className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="space-y-1 p-3">
            <h3 className="line-clamp-1 font-semibold">{a.title}</h3>
            <p className="text-sm opacity-80">
              {a.artist ?? "Artista desconocido"}
            </p>
            <p className="text-xs opacity-60">{a.date}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
