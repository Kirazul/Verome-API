/**
 * Streaming Service
 * Fetches audio stream URLs from Piped and Invidious instances
 */

let instancesCache: any = null;
let instancesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const PIPED_INSTANCES = [
  "https://api.piped.private.coffee",
  "https://pipedapi.darkness.services",
  "https://pipedapi.r4fo.com",
  "https://api.piped.yt",
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.in.projectsegfau.lt",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.leptons.xyz",
];

async function getDynamicInstances() {
  const now = Date.now();
  if (instancesCache && (now - instancesCacheTime) < CACHE_DURATION) {
    return instancesCache;
  }

  try {
    const response = await fetch("https://raw.githubusercontent.com/n-ce/Uma/main/dynamic_instances.json");
    const data = await response.json();
    data.piped = PIPED_INSTANCES;
    instancesCache = data;
    instancesCacheTime = now;
    return instancesCache;
  } catch {
    return {
      piped: PIPED_INSTANCES,
      invidious: ["https://y.com.sb", "https://inv.nadeko.net"],
    };
  }
}

export async function fetchFromPiped(videoId: string) {
  const instances = await getDynamicInstances();
  const pipedInstances = instances.piped || [];

  for (const instance of pipedInstances) {
    try {
      const response = await fetch(`${instance}/streams/${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
      });
      const data = await response.json();

      if (data?.error) continue;

      if (data?.audioStreams?.length) {
        const instanceUrl = new URL(instance);
        const proxyHost = instanceUrl.host.replace("pipedapi", "pipedproxy").replace("api.", "proxy.");

        return {
          success: true,
          instance,
          streamingUrls: data.audioStreams.map((s: any) => ({
            url: s.url,
            quality: s.quality,
            mimeType: s.mimeType,
            bitrate: s.bitrate,
            proxyHost,
          })),
          metadata: {
            id: videoId,
            title: data.title,
            uploader: data.uploader,
            thumbnail: data.thumbnailUrl,
            duration: data.duration,
            views: data.views,
          },
          hlsUrl: data.hls,
        };
      }
    } catch {
      continue;
    }
  }

  return { success: false, error: "No working Piped instances found" };
}

export async function fetchFromInvidious(videoId: string) {
  const instances = await getDynamicInstances();
  const invidiousInstances = instances.invidious || [];

  for (const instance of invidiousInstances) {
    try {
      const response = await fetch(`${instance}/api/v1/videos/${videoId}`);
      const data = await response.json();

      if (data) {
        const audioFormats = (data.adaptiveFormats || []).filter((f: any) =>
          f.type?.includes("audio") || f.mimeType?.includes("audio")
        );

        return {
          success: true,
          instance,
          streamingUrls: audioFormats.map((f: any) => ({
            url: `${instance}/latest_version?id=${videoId}&itag=${f.itag}`,
            directUrl: f.url,
            bitrate: f.bitrate,
            type: f.type,
            audioQuality: f.audioQuality,
            itag: f.itag,
          })),
          metadata: {
            id: videoId,
            title: data.title,
            author: data.author,
            thumbnail: data.videoThumbnails?.[0]?.url,
            lengthSeconds: data.lengthSeconds,
            viewCount: data.viewCount,
          },
        };
      }
    } catch {
      continue;
    }
  }

  return { success: false, error: "No working Invidious instances found" };
}
