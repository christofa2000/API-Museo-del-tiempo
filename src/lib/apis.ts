import axios from "axios";

type ITunesTrack = {
  trackName: string;
  artistName: string;
  previewUrl?: string;
  artworkUrl100?: string;
  collectionName?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  trackViewUrl?: string;
};

/**
 * Devuelve una canción aleatoria asociada a la década dada.
 * - Elige un año aleatorio dentro de la década (ej: 1980–1989).
 * - Elige un país aleatorio de una lista amplia para variar el catálogo.
 * - Busca con varias queries y devuelve un track aleatorio (prioriza los que tienen preview).
 */
export async function searchRandomSongByDecade(decadeStart: number) {
  // Año aleatorio de la década
  const year = decadeStart + Math.floor(Math.random() * 10);

  // País aleatorio (catálogos distintos para variedad)
  const countries = [
    "US",
    "GB",
    "AR",
    "BR",
    "MX",
    "ES",
    "FR",
    "DE",
    "IT",
    "JP",
    "KR",
    "CA",
    "AU",
    "CL",
    "CO",
  ];
  const country = countries[Math.floor(Math.random() * countries.length)];

  // Varias consultas posibles para ese año
  const queries = [
    `top hits ${year}`,
    `best of ${year}`,
    `billboard ${year}`,
    `${year} music`,
    `${year} greatest hits`,
  ];

  // Helper: buscar y devolver N resultados
  async function fetchMany(q: string) {
    const term = encodeURIComponent(q);
    const url =
      `https://itunes.apple.com/search?term=${term}` +
      `&media=music&entity=musicTrack&country=${country}&limit=50`;
    const { data } = await axios.get(url);
    return (data?.results ?? []) as ITunesTrack[];
  }

  // Intentamos queries hasta obtener algo
  for (const q of queries) {
    const results = await fetchMany(q);
    if (!results.length) continue;

    const withPreview = results.filter((r) => !!r.previewUrl);
    const pool = withPreview.length ? withPreview : results;

    // Canción aleatoria del pool
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) {
      return {
        trackName: pick.trackName,
        artistName: pick.artistName,
        previewUrl: pick.previewUrl ?? null,
        artworkUrl100: pick.artworkUrl100 ?? "",
        collectionName: pick.collectionName ?? null,
        releaseDate: pick.releaseDate ?? null,
        primaryGenreName: pick.primaryGenreName ?? null,
        trackViewUrl: pick.trackViewUrl ?? null,
        year,
        country,
        query: q,
      };
    }
  }

  // Fallback duro: nada encontrado
  return null;
}

/** Wikipedia Summary — contexto por título (p.ej. "1980s") */
export async function wikipediaSummary(title: string) {
  const safe = encodeURIComponent(title);
  const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${safe}`;
  const { data } = await axios.get(url);
  return {
    title: data.title as string,
    extract: data.extract as string,
    url: data.content_urls?.desktop?.page as string | undefined,
  };
}

/** Art Institute of Chicago — obras por década */
export async function artByDecade(decadeStart: number) {
  const decadeEnd = decadeStart + 9;

  const fields = [
    "id",
    "title",
    "artist_title",
    "date_display",
    "date_start",
    "date_end",
    "image_id",
  ].join(",");

  const url =
    `https://api.artic.edu/api/v1/artworks/search?fields=${fields}` +
    // rango de fechas: incluimos piezas cuya ventana cae completamente en la década
    `&q=term[date_start]=>=${decadeStart} AND term[date_end]=<${decadeEnd}` +
    `&limit=100`;

  const { data } = await axios.get(url);
  const base = (data?.data ?? []) as any[];

  // 1) Filtrado estricto: date_start/date_end dentro de la década
  const filtered = base.filter((x) => {
    const ds =
      typeof x.date_start === "number" ? x.date_start : Number(x.date_start);
    const de = typeof x.date_end === "number" ? x.date_end : Number(x.date_end);
    if (Number.isNaN(ds) || Number.isNaN(de)) return false;
    return ds >= decadeStart && de <= decadeEnd;
  });

  // 2) Solo con imagen válida
  const withImage = filtered.filter((x) => !!x.image_id);

  // 3) Deduplicar por (title + artist_title)
  const seen = new Set<string>();
  const deduped = withImage.filter((x) => {
    const key = `${x.title}__${x.artist_title ?? ""}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 4) Barajar para variedad
  for (let i = deduped.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deduped[i], deduped[j]] = [deduped[j], deduped[i]];
  }

  // 5) Mapear a tu shape y limitar a 6
  return deduped.slice(0, 6).map((x) => ({
    id: x.id as number,
    title: x.title as string,
    artist: (x.artist_title as string) ?? null,
    date: (x.date_display as string) ?? `${x.date_start}–${x.date_end}`,
    image: `https://www.artic.edu/iiif/2/${x.image_id}/full/843,/0/default.jpg`,
  })) as {
    id: number;
    title: string;
    artist: string | null;
    date: string;
    image: string | null;
  }[];
}
