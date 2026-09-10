// src/lib/stream.ts
import { StreamSource } from "@/lib/providers/types";

export async function getStreamSources(
  type: "movie" | "tv",
  id: number | string,
  season?: number,
  episode?: number,
): Promise<StreamSource[]> {
  if (!id) return [];

  const s = season || 1;
  const e = episode || 1;

  const path = type === "movie" ? `movie/${id}` : `tv/${id}/${s}/${e}`;

  return [
    { 
      id: "server-mbply", 
      label: "Shih Tzu", 
      url: `https://info.movieboxnoob.cc/video/${id}/video_1080p.m3u8`, 
      kind: "stream"
    },
    { 
      id: "server-zetply", 
      label: "Golden Retriever", 
      url: `https://peachify.top/embed/${path}`, 
      kind: "embed" 
    },
    { 
      id: "server-orvid", 
      label: "German Shepherd", 
      url: `https://2embed.cc/embed/${path}`, 
      kind: "embed" 
    },
    { 
      id: "server-qsply", 
      label: "Husky", 
      url: `https://vidsrc.sbs/embed/${path}?provider=free`, 
      kind: "embed" 
    },
    {
      id: "server-vidlnx",
      label: "Beagle",
      url: `https://vidlink.pro/${path}`,
      kind: "embed"
    },
    {
      id: "server-vnst-alfa",
      label: "Pug",
      url: `https://vidsrc.vip/embed/${path}`,
      kind: "embed"
    }
  ];
}
