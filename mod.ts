/**
 * Virome API for Deno
 * YouTube Music, YouTube Search, and Last.fm API
 * 
 * Run with: deno run --allow-net --allow-env --allow-read mod.ts
 * Or deploy to Deno Deploy
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { YTMusic, YouTubeSearch, LastFM, fetchFromPiped, fetchFromInvidious, getLyrics, getTrendingMusic, getRadio, getTopArtists, getTopTracks, getArtistInfo, getTrackInfo, getSongComplete, getAlbumComplete, getArtistComplete, getFullChain } from "./lib.ts";
import { html as uiHtml } from "./ui.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000");

const ytmusic = new YTMusic();
const youtubeSearch = new YouTubeSearch();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

function matchRoute(pathname: string, pattern: string): Record<string, string> | null {
  const patternParts = pattern.split("/");
  const pathParts = pathname.split("/");
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

const countryLanguageMap: Record<string, string> = {
  TN: "ar", DZ: "ar", MA: "ar", EG: "ar", SA: "ar", AE: "ar", KW: "ar", QA: "ar", BH: "ar", OM: "ar", JO: "ar", LB: "ar", IQ: "ar", LY: "ar", SD: "ar", YE: "ar", SY: "ar", PS: "ar",
  FR: "fr", BE: "fr", CH: "fr", CA: "fr", SN: "fr", CI: "fr", ML: "fr", BF: "fr", NE: "fr", TG: "fr", BJ: "fr", CM: "fr", MG: "fr",
  DE: "de", AT: "de", ES: "es", MX: "es", AR: "es", CO: "es", PE: "es", VE: "es", CL: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  PT: "pt", BR: "pt", AO: "pt", MZ: "pt", IT: "it", NL: "nl", RU: "ru", BY: "ru", KZ: "ru", TR: "tr", JP: "ja", KR: "ko", CN: "zh", TW: "zh", HK: "zh", IN: "hi", TH: "th", VN: "vi", ID: "id", PL: "pl", UA: "uk", RO: "ro", GR: "el", CZ: "cs", SE: "sv", NO: "no", DK: "da", FI: "fi", HU: "hu", IL: "he", IR: "fa", PK: "ur", BD: "bn", PH: "tl", MY: "ms",
};

async function detectRegionFromIP(req: Request): Promise<{ country: string; language: string } | null> {
  try {
    const cfCountry = req.headers.get("cf-ipcountry") || req.headers.get("x-country");
    if (cfCountry && cfCountry !== "XX") {
      return { country: cfCountry, language: countryLanguageMap[cfCountry] || "en" };
    }
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIP = forwardedFor ? forwardedFor.split(",")[0].trim() : null;
    if (!clientIP || clientIP === "127.0.0.1" || clientIP.startsWith("192.168.") || clientIP.startsWith("10.")) return null;
    const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=countryCode`);
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      if (geoData.countryCode) return { country: geoData.countryCode, language: countryLanguageMap[geoData.countryCode] || "en" };
    }
    return null;
  } catch { return null; }
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname, searchParams } = url;

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Root - UI
    if (pathname === "/") return new Response(uiHtml, { headers: { "Content-Type": "text/html", ...corsHeaders } });

    // Logo
    if (pathname === "/assets/logo.png" || pathname === "/assets/Logo.png") {
      try {
        const logoPath = new URL("./assets/Logo.png", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
        const logo = await Deno.readFile(logoPath);
        return new Response(logo, { headers: { "Content-Type": "image/png", ...corsHeaders } });
      } catch { return new Response("Logo not found", { status: 404 }); }
    }

    if (pathname === "/favicon.ico") return new Response(null, { status: 204 });
    if (pathname === "/health") return json({ status: "ok" });

    // ============ SEARCH ============
    
    if (pathname === "/api/search") {
      const query = searchParams.get("q");
      const filter = searchParams.get("filter") || undefined;
      const continuationToken = searchParams.get("continuationToken") || undefined;
      const ignoreSpelling = searchParams.get("ignore_spelling") === "true";
      const withFallback = searchParams.get("fallback") !== "0";
      
      let region = searchParams.get("region") || searchParams.get("gl") || undefined;
      let language = searchParams.get("language") || searchParams.get("hl") || undefined;
      
      if (!region) {
        const detected = await detectRegionFromIP(req);
        if (detected) { region = detected.country; if (!language) language = detected.language; }
      }

      if (!query && !continuationToken) return error("Missing 'q' or 'continuationToken'");

      const results = await ytmusic.search(query || "", filter, continuationToken, ignoreSpelling, region, language);
      
      // Add fallback YouTube IDs for songs
      if (withFallback && filter === "songs" && results.results?.length > 0) {
        const enhanced = await Promise.all(
          results.results.slice(0, 10).map(async (song: any) => {
            try {
              const ytResults = await youtubeSearch.searchVideos(`${song.title} ${song.artists?.[0]?.name || ''} official`);
              const alt = ytResults.results?.find((v: any) => v.channel?.name && !v.channel.name.includes('Topic') && v.id);
              if (alt) return { ...song, fallbackVideoId: alt.id, fallbackTitle: alt.title };
            } catch {}
            return song;
          })
        );
        results.results = [...enhanced, ...results.results.slice(10)];
      }
      
      return json({ query, filter, region, language, ...results });
    }

    if (pathname === "/api/search/suggestions") {
      const query = searchParams.get("q");
      if (!query) return error("Missing 'q'");
      const music = searchParams.get("music");
      const suggestions = music === "1" ? await ytmusic.getSearchSuggestions(query) : await youtubeSearch.getSuggestions(query);
      return json({ suggestions, source: music === "1" ? "youtube_music" : "youtube" });
    }

    if (pathname === "/api/yt_search") {
      const query = searchParams.get("q");
      const filter = searchParams.get("filter") || "all";
      const continuationToken = searchParams.get("continuationToken") || undefined;

      if (!query && !continuationToken) return error("Missing 'q' or 'continuationToken'");

      const results: unknown[] = [];
      let nextToken: string | null = null;

      if (continuationToken) {
        if (filter === "videos") { const r = await youtubeSearch.searchVideos(null, continuationToken); results.push(...r.results); nextToken = r.continuationToken; }
        else if (filter === "channels") { const r = await youtubeSearch.searchChannels(null, continuationToken); results.push(...r.results); nextToken = r.continuationToken; }
        else if (filter === "playlists") { const r = await youtubeSearch.searchPlaylists(null, continuationToken); results.push(...r.results); nextToken = r.continuationToken; }
      } else if (query) {
        if (filter === "videos" || filter === "all") { const r = await youtubeSearch.searchVideos(query); results.push(...r.results); nextToken = r.continuationToken; }
        if (filter === "channels" || filter === "all") { const r = await youtubeSearch.searchChannels(query); results.push(...r.results); if (!nextToken) nextToken = r.continuationToken; }
        if (filter === "playlists" || filter === "all") { const r = await youtubeSearch.searchPlaylists(query); results.push(...r.results); if (!nextToken) nextToken = r.continuationToken; }
      }

      return json({ filter, query, results, continuationToken: nextToken });
    }

    // ============ ENTITIES (Complete data with links) ============

    let params = matchRoute(pathname, "/api/songs/:videoId");
    if (params) return json(await getSongComplete(params.videoId, ytmusic));

    params = matchRoute(pathname, "/api/albums/:browseId");
    if (params) return json(await getAlbumComplete(params.browseId, ytmusic));

    params = matchRoute(pathname, "/api/album/:id");
    if (params) return json(await getAlbumComplete(params.id, ytmusic));

    params = matchRoute(pathname, "/api/artists/:browseId");
    if (params) return json(await getArtistComplete(params.browseId, ytmusic));

    if (pathname !== "/api/artist/info") {
      params = matchRoute(pathname, "/api/artist/:artistId");
      if (params) {
        const country = searchParams.get("country") || "US";
        return json(await ytmusic.getArtistSummary(params.artistId, country));
      }
    }

    params = matchRoute(pathname, "/api/playlists/:playlistId");
    if (params) return json(await ytmusic.getPlaylist(params.playlistId));

    params = matchRoute(pathname, "/api/playlist/:id");
    if (params) return json(await ytmusic.getPlaylist(params.id));

    params = matchRoute(pathname, "/api/related/:id");
    if (params) return json({ success: true, data: await ytmusic.getRelated(params.id) });

    // Full chain: song -> artist -> albums
    params = matchRoute(pathname, "/api/chain/:videoId");
    if (params) return json(await getFullChain(params.videoId, ytmusic));

    // ============ EXPLORE ============

    if (pathname === "/api/charts") return json(await ytmusic.getCharts(searchParams.get("country") || undefined));

    if (pathname === "/api/moods") return json(await ytmusic.getMoodCategories());

    params = matchRoute(pathname, "/api/moods/:categoryId");
    if (params) return json(await ytmusic.getMoodPlaylists(params.categoryId));

    if (pathname === "/api/watch_playlist") {
      const videoId = searchParams.get("videoId") || undefined;
      const playlistId = searchParams.get("playlistId") || undefined;
      if (!videoId && !playlistId) return error("Provide videoId or playlistId");
      return json(await ytmusic.getWatchPlaylist(videoId, playlistId, searchParams.get("radio") === "true", searchParams.get("shuffle") === "true", parseInt(searchParams.get("limit") || "25")));
    }

    // ============ STREAMING ============

    if (pathname === "/api/music/find") {
      const name = searchParams.get("name"), artist = searchParams.get("artist");
      if (!name || !artist) return error("Missing name and artist");

      const searchResults = await ytmusic.search(`${name} ${artist}`, "songs");
      if (!searchResults.results?.length) return json({ success: false, error: "Song not found" }, 404);

      const normalize = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "").toLowerCase();
      const nName = normalize(name);
      const artistsList = artist.split(",").map(a => normalize(a));

      const match = searchResults.results.find((song: any) => {
        const nSongName = normalize(song.title || "");
        const songArtists = (song.artists || []).map((a: any) => normalize(a.name || ""));
        return (nSongName.includes(nName) || nName.includes(nSongName)) && artistsList.some(a => songArtists.some((sa: string) => sa.includes(a) || a.includes(sa)));
      });

      return match ? json({ success: true, data: match }) : json({ success: false, error: "Song not found" }, 404);
    }

    if (pathname === "/api/stream") {
      const id = searchParams.get("id");
      if (!id) return error("Missing id");

      const piped = await fetchFromPiped(id);
      if (piped.success) return json({ success: true, service: "piped", instance: piped.instance, streamingUrls: piped.streamingUrls, metadata: piped.metadata, requestedId: id, timestamp: new Date().toISOString() });

      const invidious = await fetchFromInvidious(id);
      if (invidious.success) return json({ success: true, service: "invidious", instance: invidious.instance, streamingUrls: invidious.streamingUrls, metadata: invidious.metadata, requestedId: id, timestamp: new Date().toISOString() });

      return json({ success: false, error: "No streaming data found" }, 404);
    }

    if (pathname === "/api/proxy") {
      const audioUrl = searchParams.get("url");
      if (!audioUrl) return error("Missing url");
      return proxyAudio(audioUrl, req);
    }

    // Download audio as MP3
    if (pathname === "/api/download") {
      const id = searchParams.get("id");
      const title = searchParams.get("title") || "audio";
      const artist = searchParams.get("artist") || "";
      if (!id) return error("Missing id");

      // Get stream URL
      const piped = await fetchFromPiped(id);
      let audioUrl = null;
      let metadata = null;
      
      if (piped.success && piped.streamingUrls) {
        const audio = piped.streamingUrls.find((s: any) => s.mimeType?.includes("audio") && s.quality === "AUDIO_QUALITY_MEDIUM") 
                   || piped.streamingUrls.find((s: any) => s.mimeType?.includes("audio"));
        if (audio) audioUrl = audio.url;
        metadata = piped.metadata;
      }
      
      if (!audioUrl) {
        const invidious = await fetchFromInvidious(id);
        if (invidious.success && invidious.streamingUrls) {
          const audio = invidious.streamingUrls.find((s: any) => s.mimeType?.includes("audio") && s.quality === "AUDIO_QUALITY_MEDIUM")
                     || invidious.streamingUrls.find((s: any) => s.mimeType?.includes("audio"));
          if (audio) audioUrl = audio.url;
          metadata = invidious.metadata;
        }
      }

      if (!audioUrl) return json({ success: false, error: "No audio stream found" }, 404);

      // Create filename
      const filename = `${artist ? artist + " - " : ""}${title}`.replace(/[<>:"/\\|?*]/g, "").trim() + ".m4a";

      try {
        const response = await fetch(audioUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://www.youtube.com/",
            "Origin": "https://www.youtube.com",
          },
        });

        if (!response.ok) return json({ success: false, error: "Failed to fetch audio" }, 502);

        return new Response(response.body, {
          headers: {
            "Content-Type": "audio/mp4",
            "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "Content-Disposition",
          },
        });
      } catch (err) {
        return json({ success: false, error: "Download failed: " + String(err) }, 500);
      }
    }

    // ============ LYRICS & INFO ============

    if (pathname === "/api/lyrics") {
      const title = searchParams.get("title"), artist = searchParams.get("artist");
      if (!title || !artist) return error("Missing title and artist");
      return json(await getLyrics(title, artist, searchParams.get("duration") ? parseInt(searchParams.get("duration")!) : undefined));
    }

    if (pathname === "/api/similar") {
      const title = searchParams.get("title"), artist = searchParams.get("artist");
      if (!title || !artist) return error("Missing title or artist");
      const similar = await LastFM.getSimilarTracks(title, artist, searchParams.get("limit") || "5");
      if ("error" in similar) return json({ error: similar.error }, 500);
      const ytResults = await Promise.all(similar.map(async (t: any) => { const r = await youtubeSearch.searchVideos(`${t.title} ${t.artist}`); return r.results[0] || null; }));
      return json(ytResults.filter(Boolean));
    }

    if (pathname === "/api/trending") return json(await getTrendingMusic(searchParams.get("country") || "United States", ytmusic));

    if (pathname === "/api/radio") {
      const videoId = searchParams.get("videoId");
      if (!videoId) return error("Missing videoId");
      return json(await getRadio(videoId, ytmusic));
    }

    if (pathname === "/api/top/artists") return json(await getTopArtists(searchParams.get("country") || undefined, parseInt(searchParams.get("limit") || "20"), ytmusic));
    if (pathname === "/api/top/tracks") return json(await getTopTracks(searchParams.get("country") || undefined, parseInt(searchParams.get("limit") || "20"), ytmusic));

    if (pathname === "/api/artist/info") {
      const artist = searchParams.get("artist");
      if (!artist) return error("Missing artist");
      return json(await getArtistInfo(artist));
    }

    if (pathname === "/api/track/info") {
      const title = searchParams.get("title"), artist = searchParams.get("artist");
      if (!title || !artist) return error("Missing title and artist");
      return json(await getTrackInfo(title, artist));
    }

    // ============ FEED ============

    if (pathname === "/api/feed/unauthenticated" || pathname.startsWith("/api/feed/channels=")) {
      let channelsParam = searchParams.get("channels");
      if (pathname.startsWith("/api/feed/channels=")) channelsParam = pathname.replace("/api/feed/channels=", "").split("?")[0];
      if (!channelsParam) return error("No channel IDs provided");

      const channelIds = channelsParam.split(",").map(s => s.trim()).filter(Boolean);
      const preview = searchParams.get("preview") === "1";
      const results: any[] = [];
      for (const channelId of channelIds) results.push(...await fetchChannelVideos(channelId, preview ? 5 : undefined));
      return json(results.filter(item => !item.isShort).sort((a, b) => Number(b.uploaded) - Number(a.uploaded)));
    }

    return json({ error: "Route not found", path: pathname }, 404);

  } catch (err) {
    console.error("Error:", err);
    return json({ error: "Internal server error", message: String(err) }, 500);
  }
}

async function proxyAudio(url: string, req: Request): Promise<Response> {
  try {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "*/*", "Referer": "https://www.youtube.com/", "Origin": "https://www.youtube.com",
    };
    const rangeHeader = req.headers.get("Range");
    if (rangeHeader) headers["Range"] = rangeHeader;
    
    const response = await fetch(url, { headers });
    if (!response.ok && response.status !== 206) return new Response(`Failed: ${response.status}`, { status: 502, headers: corsHeaders });
    
    const responseHeaders = new Headers();
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type");
    responseHeaders.set("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges");
    responseHeaders.set("Cache-Control", "public, max-age=3600");
    responseHeaders.set("Content-Type", response.headers.get("Content-Type") || "audio/mp4");
    if (response.headers.get("Content-Length")) responseHeaders.set("Content-Length", response.headers.get("Content-Length")!);
    if (response.headers.get("Content-Range")) responseHeaders.set("Content-Range", response.headers.get("Content-Range")!);
    responseHeaders.set("Accept-Ranges", response.headers.get("Accept-Ranges") || "bytes");
    
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch (err) {
    return new Response("Proxy error: " + String(err), { status: 502, headers: corsHeaders });
  }
}

async function fetchChannelVideos(channelId: string, limit?: number): Promise<any[]> {
  try {
    const response = await fetch("https://www.youtube.com/youtubei/v1/browse?prettyPrint=false", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ browseId: channelId, context: { client: { clientName: "WEB", clientVersion: "2.20251013.01.00", hl: "en", gl: "US" } } }),
    });
    const data = await response.json();
    const items: any[] = [];
    const channelName = data?.header?.c4TabbedHeaderRenderer?.title || data?.metadata?.channelMetadataRenderer?.title || "";

    const extractVideos = (contents: any[]) => {
      if (!contents) return;
      for (const item of contents) {
        const video = item?.richItemRenderer?.content?.videoRenderer || item?.videoRenderer || item?.gridVideoRenderer;
        if (video?.videoId) items.push(parseVideo(video, channelId, channelName));
        if (item?.shelfRenderer?.content?.expandedShelfContentsRenderer?.items) extractVideos(item.shelfRenderer.content.expandedShelfContentsRenderer.items);
        if (item?.itemSectionRenderer?.contents) extractVideos(item.itemSectionRenderer.contents);
        if (limit && items.length >= limit) return;
      }
    };

    const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || data?.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
    for (const tab of tabs) extractVideos(tab?.tabRenderer?.content?.sectionListRenderer?.contents || tab?.tabRenderer?.content?.richGridRenderer?.contents || []);
    return items.slice(0, limit || items.length);
  } catch { return []; }
}

function parseVideo(video: any, channelId: string, channelName: string): any {
  const id = video?.videoId || "";
  const title = video?.title?.runs?.[0]?.text || video?.title?.simpleText || "";
  let duration = 0;
  const durationText = video?.lengthText?.simpleText || video?.thumbnailOverlays?.[0]?.thumbnailOverlayTimeStatusRenderer?.text?.simpleText || "";
  if (durationText) {
    const parts = durationText.split(":").map((p: string) => parseInt(p) || 0);
    if (parts.length === 2) duration = parts[0] * 60 + parts[1];
    else if (parts.length === 3) duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  let views = 0;
  const viewText = video?.viewCountText?.simpleText || "";
  const match = viewText.match(/([\d,\.]+)([KMB]?)/);
  if (match) { let num = parseFloat(match[1].replace(/,/g, "")); if (match[2] === "K") num *= 1000; else if (match[2] === "M") num *= 1000000; else if (match[2] === "B") num *= 1000000000; views = Math.floor(num); }
  let uploaded = Date.now();
  const timeText = (video?.publishedTimeText?.simpleText || "").toLowerCase();
  if (timeText.includes("hour")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 3600000;
  else if (timeText.includes("day")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 86400000;
  else if (timeText.includes("week")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 604800000;
  else if (timeText.includes("month")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 2592000000;
  else if (timeText.includes("year")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 31536000000;
  return { id, authorId: channelId, duration: duration.toString(), author: channelName, views: views.toString(), uploaded: uploaded.toString(), title, isShort: duration > 0 && duration <= 60, thumbnail: video?.thumbnail?.thumbnails?.slice(-1)[0]?.url || "" };
}

console.log(`Virome API running on http://localhost:${PORT}`);
serve(handler, { port: PORT });
