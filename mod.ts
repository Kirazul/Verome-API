/**
 * Virome API for Deno
 * A consolidated YouTube Music, YouTube Search, JioSaavn, and Last.fm API
 * 
 * Run with: deno run --allow-net --allow-env --allow-read mod.ts
 * Or deploy to Deno Deploy
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { YTMusic, YouTubeSearch, LastFM, fetchFromPiped, fetchFromInvidious, getLyrics, getTrendingMusic, getRadio, getTopArtists, getTopTracks, getArtistInfo, getTrackInfo } from "./lib.ts";
import { html as uiHtml } from "./ui.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000");

// Initialize clients
const ytmusic = new YTMusic();
const youtubeSearch = new YouTubeSearch();

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Helper functions
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

// URL pattern matching
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

// Country code to language mapping
const countryLanguageMap: Record<string, string> = {
  TN: "ar", DZ: "ar", MA: "ar", EG: "ar", SA: "ar", AE: "ar", KW: "ar", QA: "ar", BH: "ar", OM: "ar", JO: "ar", LB: "ar", IQ: "ar", LY: "ar", SD: "ar", YE: "ar", SY: "ar", PS: "ar",
  FR: "fr", BE: "fr", CH: "fr", CA: "fr", SN: "fr", CI: "fr", ML: "fr", BF: "fr", NE: "fr", TG: "fr", BJ: "fr", CM: "fr", MG: "fr",
  DE: "de", AT: "de",
  ES: "es", MX: "es", AR: "es", CO: "es", PE: "es", VE: "es", CL: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es", HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es", UY: "es",
  PT: "pt", BR: "pt", AO: "pt", MZ: "pt",
  IT: "it",
  NL: "nl",
  RU: "ru", BY: "ru", KZ: "ru",
  TR: "tr",
  JP: "ja",
  KR: "ko",
  CN: "zh", TW: "zh", HK: "zh",
  IN: "hi",
  TH: "th",
  VN: "vi",
  ID: "id",
  PL: "pl",
  UA: "uk",
  RO: "ro",
  GR: "el",
  CZ: "cs",
  SE: "sv",
  NO: "no",
  DK: "da",
  FI: "fi",
  HU: "hu",
  IL: "he",
  IR: "fa",
  PK: "ur",
  BD: "bn",
  PH: "tl",
  MY: "ms",
};

// Detect region from IP using Cloudflare/Deno Deploy headers or fallback to IP lookup
async function detectRegionFromIP(req: Request): Promise<{ country: string; language: string } | null> {
  try {
    // Try Cloudflare/Deno Deploy headers first (fastest)
    const cfCountry = req.headers.get("cf-ipcountry") || req.headers.get("x-country");
    if (cfCountry && cfCountry !== "XX") {
      const language = countryLanguageMap[cfCountry] || "en";
      return { country: cfCountry, language };
    }
    
    // Get client IP
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIP = forwardedFor ? forwardedFor.split(",")[0].trim() : null;
    
    if (!clientIP || clientIP === "127.0.0.1" || clientIP.startsWith("192.168.") || clientIP.startsWith("10.")) {
      return null;
    }
    
    // Fallback to IP geolocation API (ip-api.com is free, no key needed)
    const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=countryCode`);
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      if (geoData.countryCode) {
        const language = countryLanguageMap[geoData.countryCode] || "en";
        return { country: geoData.countryCode, language };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// Main request handler
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname, searchParams } = url;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Root - API Documentation UI
    if (pathname === "/") {
      return new Response(uiHtml, { headers: { "Content-Type": "text/html", ...corsHeaders } });
    }

    // Serve logo from assets
    if (pathname === "/assets/logo.png" || pathname === "/assets/Logo.png") {
      try {
        const logoPath = new URL("./assets/Logo.png", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
        const logo = await Deno.readFile(logoPath);
        return new Response(logo, { 
          headers: { "Content-Type": "image/png", ...corsHeaders } 
        });
      } catch {
        return new Response("Logo not found", { status: 404 });
      }
    }

    // Favicon
    if (pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }

    // Health check
    if (pathname === "/health") {
      return json({ status: "ok" });
    }

    // ============ SEARCH ENDPOINTS ============
    
    // YouTube Music Search
    if (pathname === "/api/search") {
      const query = searchParams.get("q");
      const filter = searchParams.get("filter") || undefined;
      const continuationToken = searchParams.get("continuationToken") || undefined;
      const ignoreSpelling = searchParams.get("ignore_spelling") === "true";
      
      // Get region from param or detect from IP
      let region = searchParams.get("region") || searchParams.get("gl") || undefined;
      let language = searchParams.get("language") || searchParams.get("hl") || undefined;
      
      // Auto-detect region from IP if not provided
      if (!region) {
        const detectedRegion = await detectRegionFromIP(req);
        if (detectedRegion) {
          region = detectedRegion.country;
          if (!language) language = detectedRegion.language;
        }
      }

      if (!query && !continuationToken) {
        return error("Missing required query parameter 'q' or 'continuationToken'");
      }

      const results = await ytmusic.search(query || "", filter, continuationToken, ignoreSpelling, region, language);
      return json({ query, filter, region, language, ...results });
    }

    // Search suggestions
    if (pathname === "/api/search/suggestions") {
      const query = searchParams.get("q");
      const music = searchParams.get("music");

      if (!query) return error("Missing required query parameter 'q'");

      if (music === "1") {
        const suggestions = await ytmusic.getSearchSuggestions(query);
        return json({ suggestions, source: "youtube_music" });
      } else {
        const suggestions = await youtubeSearch.getSuggestions(query);
        return json({ suggestions, source: "youtube" });
      }
    }

    // YouTube Search
    if (pathname === "/api/yt_search") {
      const query = searchParams.get("q");
      const filter = searchParams.get("filter") || "all";
      const continuationToken = searchParams.get("continuationToken") || undefined;

      if (!query && !continuationToken) {
        return error("Missing required query parameter 'q' or 'continuationToken'");
      }

      const results: unknown[] = [];
      let nextToken: string | null = null;

      if (continuationToken) {
        if (filter === "videos") {
          const r = await youtubeSearch.searchVideos(null, continuationToken);
          results.push(...r.results);
          nextToken = r.continuationToken;
        } else if (filter === "channels") {
          const r = await youtubeSearch.searchChannels(null, continuationToken);
          results.push(...r.results);
          nextToken = r.continuationToken;
        } else if (filter === "playlists") {
          const r = await youtubeSearch.searchPlaylists(null, continuationToken);
          results.push(...r.results);
          nextToken = r.continuationToken;
        }
      } else if (query) {
        if (filter === "videos" || filter === "all") {
          const r = await youtubeSearch.searchVideos(query);
          results.push(...r.results);
          nextToken = r.continuationToken;
        }
        if (filter === "channels" || filter === "all") {
          const r = await youtubeSearch.searchChannels(query);
          results.push(...r.results);
          if (!nextToken) nextToken = r.continuationToken;
        }
        if (filter === "playlists" || filter === "all") {
          const r = await youtubeSearch.searchPlaylists(query);
          results.push(...r.results);
          if (!nextToken) nextToken = r.continuationToken;
        }
      }

      return json({ filter, query, results, continuationToken: nextToken });
    }

    // ============ ENTITY ENDPOINTS ============

    // Get song details
    let params = matchRoute(pathname, "/api/songs/:videoId");
    if (params) {
      const data = await ytmusic.getSong(params.videoId);
      return json(data);
    }

    // Get album details
    params = matchRoute(pathname, "/api/albums/:browseId");
    if (params) {
      const data = await ytmusic.getAlbum(params.browseId);
      return json(data);
    }

    params = matchRoute(pathname, "/api/album/:id");
    if (params) {
      const data = await ytmusic.getAlbum(params.id);
      return json(data);
    }

    // Get artist details (skip if it's /api/artist/info)
    params = matchRoute(pathname, "/api/artists/:browseId");
    if (params) {
      const data = await ytmusic.getArtist(params.browseId);
      return json(data);
    }

    // Skip /api/artist/info - handled later by Last.fm endpoint
    if (pathname !== "/api/artist/info") {
      params = matchRoute(pathname, "/api/artist/:artistId");
      if (params) {
        const country = searchParams.get("country") || "US";
        const data = await ytmusic.getArtistSummary(params.artistId, country);
        return json(data);
      }
    }

    // Get playlist details
    params = matchRoute(pathname, "/api/playlists/:playlistId");
    if (params) {
      const data = await ytmusic.getPlaylist(params.playlistId);
      return json(data);
    }

    params = matchRoute(pathname, "/api/playlist/:id");
    if (params) {
      const data = await ytmusic.getPlaylist(params.id);
      return json(data);
    }

    // Get related videos
    params = matchRoute(pathname, "/api/related/:id");
    if (params) {
      const data = await ytmusic.getRelated(params.id);
      return json({ success: true, data });
    }

    // ============ EXPLORE ENDPOINTS ============

    // Charts
    if (pathname === "/api/charts") {
      const country = searchParams.get("country") || undefined;
      const data = await ytmusic.getCharts(country);
      return json(data);
    }

    // Moods
    if (pathname === "/api/moods") {
      const data = await ytmusic.getMoodCategories();
      return json(data);
    }

    params = matchRoute(pathname, "/api/moods/:categoryId");
    if (params) {
      const data = await ytmusic.getMoodPlaylists(params.categoryId);
      return json(data);
    }

    // Watch playlist
    if (pathname === "/api/watch_playlist") {
      const videoId = searchParams.get("videoId") || undefined;
      const playlistId = searchParams.get("playlistId") || undefined;
      const radio = searchParams.get("radio") === "true";
      const shuffle = searchParams.get("shuffle") === "true";
      const limit = parseInt(searchParams.get("limit") || "25");

      if (!videoId && !playlistId) {
        return error("Provide either videoId or playlistId");
      }

      const data = await ytmusic.getWatchPlaylist(videoId, playlistId, radio, shuffle, limit);
      return json(data);
    }

    // ============ STREAMING ENDPOINTS ============

    // Find song
    if (pathname === "/api/music/find") {
      const name = searchParams.get("name");
      const artist = searchParams.get("artist");

      if (!name || !artist) {
        return error("Missing required parameters: name and artist are required");
      }

      const query = `${name} ${artist}`;
      const searchResults = await ytmusic.search(query, "songs");

      if (!searchResults.results?.length) {
        return json({ success: false, error: "Song not found" }, 404);
      }

      const normalize = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "").toLowerCase();
      const nName = normalize(name);
      const artistsList = artist.split(",").map(a => normalize(a));

      const bestMatch = searchResults.results.find((song: any) => {
        const nSongName = normalize(song.title || "");
        const songArtists = (song.artists || []).map((a: any) => normalize(a.name || ""));
        const titleMatch = nSongName.includes(nName) || nName.includes(nSongName);
        const artistMatch = artistsList.some(a => songArtists.some((sa: string) => sa.includes(a) || a.includes(sa)));
        return titleMatch && artistMatch;
      });

      if (bestMatch) {
        return json({ success: true, data: bestMatch });
      }
      return json({ success: false, error: "Song not found after filtering" }, 404);
    }

    // Stream endpoint - multi-source
    if (pathname === "/api/stream") {
      const id = searchParams.get("id");

      if (!id) {
        return error("Missing required parameter: id");
      }

      // Try Piped first
      const pipedResult = await fetchFromPiped(id);
      if (pipedResult.success) {
        return json({
          success: true,
          service: "piped",
          instance: pipedResult.instance,
          streamingUrls: pipedResult.streamingUrls,
          metadata: pipedResult.metadata,
          requestedId: id,
          timestamp: new Date().toISOString(),
        });
      }

      // Try Invidious
      const invidiousResult = await fetchFromInvidious(id);
      if (invidiousResult.success) {
        return json({
          success: true,
          service: "invidious",
          instance: invidiousResult.instance,
          streamingUrls: invidiousResult.streamingUrls,
          metadata: invidiousResult.metadata,
          requestedId: id,
          timestamp: new Date().toISOString(),
        });
      }

      return json({ success: false, error: "No streaming data found from any source" }, 404);
    }

    // ============ SIMILAR TRACKS ============

    if (pathname === "/api/similar") {
      const title = searchParams.get("title");
      const artist = searchParams.get("artist");
      const limit = searchParams.get("limit") || "5";

      if (!title || !artist) {
        return error("Missing title or artist parameter");
      }

      const similarTracks = await LastFM.getSimilarTracks(title, artist, limit);
      if ("error" in similarTracks) {
        return json({ error: similarTracks.error }, 500);
      }

      const ytResults = await Promise.all(
        similarTracks.map(async (t: any) => {
          const r = await youtubeSearch.searchVideos(`${t.title} ${t.artist}`);
          return r.results[0] || null;
        })
      );

      return json(ytResults.filter(Boolean));
    }

    // ============ FEED ENDPOINTS ============

    // Audio proxy to bypass CORS
    if (pathname === "/api/proxy") {
      const audioUrl = searchParams.get("url");
      if (!audioUrl) {
        return error("Missing url parameter");
      }
      return proxyAudio(audioUrl);
    }

    if (pathname === "/api/feed/unauthenticated" || pathname.startsWith("/api/feed/channels=")) {
      let channelsParam = searchParams.get("channels");
      
      if (pathname.startsWith("/api/feed/channels=")) {
        channelsParam = pathname.replace("/api/feed/channels=", "").split("?")[0];
      }

      if (!channelsParam) {
        return error("No valid channel IDs provided");
      }

      const channelIds = channelsParam.split(",").map(s => s.trim()).filter(Boolean);
      const preview = searchParams.get("preview") === "1";

      const results: any[] = [];
      for (const channelId of channelIds) {
        const items = await fetchChannelVideos(channelId, preview ? 5 : undefined);
        results.push(...items);
      }

      // Filter shorts and sort by upload date
      const filtered = results
        .filter(item => !item.isShort)
        .sort((a, b) => Number(b.uploaded) - Number(a.uploaded));

      return json(filtered);
    }

    // ============ NEW FEATURES ============

    // Lyrics
    if (pathname === "/api/lyrics") {
      const title = searchParams.get("title");
      const artist = searchParams.get("artist");
      const duration = searchParams.get("duration");

      if (!title || !artist) {
        return error("Missing required parameters: title and artist");
      }

      const result = await getLyrics(title, artist, duration ? parseInt(duration) : undefined);
      return json(result);
    }

    // Trending Music
    if (pathname === "/api/trending") {
      const country = searchParams.get("country") || "United States";
      const result = await getTrendingMusic(country, ytmusic);
      return json(result);
    }

    // Radio (infinite mix based on a song)
    if (pathname === "/api/radio") {
      const videoId = searchParams.get("videoId");
      if (!videoId) {
        return error("Missing required parameter: videoId");
      }
      const result = await getRadio(videoId, ytmusic);
      return json(result);
    }

    // Top Artists (by country using YouTube Music search)
    if (pathname === "/api/top/artists") {
      const country = searchParams.get("country") || undefined;
      const limit = parseInt(searchParams.get("limit") || "20");
      const result = await getTopArtists(country, limit, ytmusic);
      return json(result);
    }

    // Top Tracks (by country using YouTube Music search)
    if (pathname === "/api/top/tracks") {
      const country = searchParams.get("country") || undefined;
      const limit = parseInt(searchParams.get("limit") || "20");
      const result = await getTopTracks(country, limit, ytmusic);
      return json(result);
    }

    // Artist Info (detailed from Last.fm)
    if (pathname === "/api/artist/info") {
      const artist = searchParams.get("artist");
      if (!artist) {
        return error("Missing required parameter: artist");
      }
      const result = await getArtistInfo(artist);
      return json(result);
    }

    // Track Info (detailed from Last.fm)
    if (pathname === "/api/track/info") {
      const title = searchParams.get("title");
      const artist = searchParams.get("artist");
      if (!title || !artist) {
        return error("Missing required parameters: title and artist");
      }
      const result = await getTrackInfo(title, artist);
      return json(result);
    }

    // 404
    return json({ error: "Route not found", path: pathname }, 404);

  } catch (err) {
    console.error("Error:", err);
    return json({ error: "Internal server error", message: String(err) }, 500);
  }
}

// Audio proxy endpoint to bypass CORS
async function proxyAudio(url: string): Promise<Response> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    
    if (!response.ok) {
      return new Response("Failed to fetch audio", { status: 502 });
    }
    
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("Content-Type") || "audio/mp4");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=3600");
    
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    
    return new Response(response.body, { headers });
  } catch (err) {
    return new Response("Proxy error: " + String(err), { status: 502 });
  }
}

// Fetch channel videos using YouTube Browse API
async function fetchChannelVideos(channelId: string, limit?: number): Promise<any[]> {
  try {
    const url = "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false";
    const payload = {
      browseId: channelId,
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20251013.01.00",
          hl: "en",
          gl: "US",
        },
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const items: any[] = [];

    // Extract channel name
    let channelName = data?.header?.c4TabbedHeaderRenderer?.title || 
                      data?.metadata?.channelMetadataRenderer?.title || "";

    // Extract videos from response
    const extractVideos = (contents: any[]) => {
      if (!contents) return;
      for (const item of contents) {
        const video = item?.richItemRenderer?.content?.videoRenderer ||
                      item?.videoRenderer ||
                      item?.gridVideoRenderer;
        if (video?.videoId) {
          items.push(parseVideo(video, channelId, channelName));
        }
        // Handle nested content
        if (item?.shelfRenderer?.content?.expandedShelfContentsRenderer?.items) {
          extractVideos(item.shelfRenderer.content.expandedShelfContentsRenderer.items);
        }
        if (item?.itemSectionRenderer?.contents) {
          extractVideos(item.itemSectionRenderer.contents);
        }
        if (limit && items.length >= limit) return;
      }
    };

    // Try different response structures
    const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs ||
                 data?.contents?.singleColumnBrowseResultsRenderer?.tabs || [];
    
    for (const tab of tabs) {
      const contents = tab?.tabRenderer?.content?.sectionListRenderer?.contents ||
                       tab?.tabRenderer?.content?.richGridRenderer?.contents || [];
      extractVideos(contents);
    }

    return items.slice(0, limit || items.length);
  } catch (err) {
    console.error("Channel fetch error:", err);
    return [];
  }
}

function parseVideo(video: any, channelId: string, channelName: string): any {
  const id = video?.videoId || "";
  const title = video?.title?.runs?.[0]?.text || video?.title?.simpleText || "";
  
  // Parse duration
  let duration = 0;
  const durationText = video?.lengthText?.simpleText ||
                       video?.thumbnailOverlays?.[0]?.thumbnailOverlayTimeStatusRenderer?.text?.simpleText || "";
  if (durationText) {
    const parts = durationText.split(":").map((p: string) => parseInt(p) || 0);
    if (parts.length === 2) duration = parts[0] * 60 + parts[1];
    else if (parts.length === 3) duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  // Parse views
  let views = 0;
  const viewText = video?.viewCountText?.simpleText || "";
  const match = viewText.match(/([\d,\.]+)([KMB]?)/);
  if (match) {
    let num = parseFloat(match[1].replace(/,/g, ""));
    if (match[2] === "K") num *= 1000;
    else if (match[2] === "M") num *= 1000000;
    else if (match[2] === "B") num *= 1000000000;
    views = Math.floor(num);
  }

  // Parse published time
  let uploaded = Date.now();
  const timeText = (video?.publishedTimeText?.simpleText || "").toLowerCase();
  if (timeText.includes("hour")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 3600000;
  else if (timeText.includes("day")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 86400000;
  else if (timeText.includes("week")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 604800000;
  else if (timeText.includes("month")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 2592000000;
  else if (timeText.includes("year")) uploaded -= parseInt(timeText.match(/(\d+)/)?.[1] || "1") * 31536000000;

  const isShort = duration > 0 && duration <= 60;

  return {
    id,
    authorId: channelId,
    duration: duration.toString(),
    author: channelName,
    views: views.toString(),
    uploaded: uploaded.toString(),
    title,
    isShort,
    thumbnail: video?.thumbnail?.thumbnails?.slice(-1)[0]?.url || "",
  };
}

// Start server
console.log(`Virome API running on http://localhost:${PORT}`);
console.log(`Endpoints: /api/search, /api/stream, /api/charts, etc.`);

serve(handler, { port: PORT });
