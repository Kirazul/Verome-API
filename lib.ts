/**
 * Music API Library for Deno
 * Contains all the core functionality for YouTube Music, YouTube Search, JioSaavn, and Last.fm
 */

// ============ YOUTUBE MUSIC API ============

export class YTMusic {
  private baseURL: string;
  private apiKey = "AIzaSyC9XL3ZjWjXClIX1FmUxJq--EohcD4_oSs";
  private context: any;

  constructor() {
    this.baseURL = "https://music.youtube.com/youtubei/v1";
    this.context = {
      client: {
        hl: "en",
        gl: "US",
        clientName: "WEB_REMIX",
        clientVersion: "1.20251015.03.00",
        platform: "DESKTOP",
        utcOffsetMinutes: 0,
      },
    };
  }

  async search(query: string, filter?: string, continuationToken?: string, _ignoreSpelling = false, region?: string, language?: string) {
    // Normalize the query to handle Arabic and other Unicode characters properly
    const normalizedQuery = query.normalize("NFC");
    
    const filterParams = this.getFilterParams(filter);
    const params: any = continuationToken
      ? { continuation: continuationToken }
      : filterParams 
        ? { query: normalizedQuery, params: filterParams }
        : { query: normalizedQuery };

    // Use custom context if region or language specified
    const context = (region || language) ? {
      client: {
        ...this.context.client,
        gl: region || this.context.client.gl,
        hl: language || this.context.client.hl,
      }
    } : this.context;

    const data = await this.makeRequestWithContext("search", params, context);
    return this.parseSearchResults(data);
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    // Normalize the query to handle Arabic and other Unicode characters properly
    const normalizedQuery = query.normalize("NFC");
    const data = await this.makeRequest("music/get_search_suggestions", { input: normalizedQuery });
    return this.parseSuggestions(data);
  }

  async getSong(videoId: string) {
    const data = await this.makeRequest("player", { videoId });
    const details = data?.videoDetails || {};
    return {
      videoId: details.videoId,
      title: details.title,
      author: details.author,
      lengthSeconds: details.lengthSeconds,
      thumbnail: details.thumbnail?.thumbnails?.[0]?.url,
    };
  }

  async getAlbum(browseId: string) {
    const data = await this.makeRequest("browse", { browseId });
    
    // Handle both single and two column layouts
    const singleColumn = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
    const twoColumnPrimary = data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
    const twoColumnSecondary = data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer?.contents;
    
    // Get header from different possible locations
    let title = "";
    let artist = "";
    let thumbnail = "";
    let year = "";
    
    // Check old header location
    const oldHeader = data?.header?.musicDetailHeaderRenderer || 
                      data?.header?.musicImmersiveHeaderRenderer || 
                      data?.header?.musicVisualHeaderRenderer;
    
    if (oldHeader) {
      title = oldHeader.title?.runs?.[0]?.text;
      const subtitleRuns = oldHeader.subtitle?.runs || oldHeader.straplineTextOne?.runs || [];
      artist = subtitleRuns.find((r: any) => r.navigationEndpoint)?.text || subtitleRuns[0]?.text;
      thumbnail = oldHeader.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
                  oldHeader.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;
    }
    
    // Check new header location (musicResponsiveHeaderRenderer in contents)
    const primaryContents = twoColumnPrimary || singleColumn || [];
    for (const section of primaryContents) {
      if (section.musicResponsiveHeaderRenderer) {
        const h = section.musicResponsiveHeaderRenderer;
        title = h.title?.runs?.[0]?.text || title;
        const subtitleRuns = h.straplineTextOne?.runs || h.subtitle?.runs || [];
        artist = subtitleRuns.find((r: any) => r.navigationEndpoint)?.text || subtitleRuns[0]?.text || artist;
        thumbnail = h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url || thumbnail;
        
        // Get year from subtitle
        const secondSubtitle = h.subtitle?.runs || [];
        for (const run of secondSubtitle) {
          const yearMatch = run.text?.match(/\d{4}/);
          if (yearMatch) year = yearMatch[0];
        }
      }
      if (section.musicDescriptionShelfRenderer) {
        const subHeader = section.musicDescriptionShelfRenderer.subheader?.runs?.[0]?.text || "";
        const yearMatch = subHeader.match(/\d{4}/);
        if (yearMatch && !year) year = yearMatch[0];
      }
    }
    
    // Parse tracks from secondary contents
    const trackContents = twoColumnSecondary || singleColumn || [];
    const tracks = this.parseTracksFromContents(trackContents);
    
    return {
      browseId,
      title,
      artist,
      thumbnail,
      year,
      trackCount: tracks.length,
      tracks,
    };
  }

  async getArtist(browseId: string) {
    const data = await this.makeRequest("browse", { browseId });
    const header = data?.header?.musicImmersiveHeaderRenderer || data?.header?.musicVisualHeaderRenderer || {};
    
    // Get contents for top songs, albums, etc.
    const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    
    // Parse sections
    const topSongs: any[] = [];
    const albums: any[] = [];
    const singles: any[] = [];
    const videos: any[] = [];
    
    for (const section of contents) {
      const shelf = section.musicShelfRenderer;
      const carousel = section.musicCarouselShelfRenderer;
      
      if (shelf) {
        const title = shelf.title?.runs?.[0]?.text?.toLowerCase() || "";
        if (title.includes("song")) {
          for (const item of shelf.contents || []) {
            const parsed = this.parseMusicItem(item.musicResponsiveListItemRenderer);
            if (parsed) topSongs.push(parsed);
          }
        }
      }
      
      if (carousel) {
        const title = carousel.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text?.toLowerCase() || "";
        const items = (carousel.contents || []).map((item: any) => this.parseTwoRowItem(item.musicTwoRowItemRenderer)).filter(Boolean);
        
        if (title.includes("album")) albums.push(...items);
        else if (title.includes("single")) singles.push(...items);
        else if (title.includes("video")) videos.push(...items);
      }
    }
    
    return {
      browseId,
      name: header.title?.runs?.[0]?.text,
      description: header.description?.runs?.[0]?.text,
      thumbnail: header.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url,
      subscribers: header.subscriptionButton?.subscribeButtonRenderer?.subscriberCountText?.runs?.[0]?.text,
      topSongs,
      albums,
      singles,
      videos,
    };
  }

  async getArtistSummary(artistId: string, country = "US") {
    const url = "https://music.youtube.com/youtubei/v1/browse?prettyPrint=false";
    const body = {
      browseId: artistId,
      context: { client: { ...this.context.client, gl: country } },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    const header = data?.header?.musicImmersiveHeaderRenderer || data?.header?.musicVisualHeaderRenderer;
    const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

    // Find top songs playlist ID
    let playlistId = null;
    for (const item of contents) {
      if (item.musicShelfRenderer?.title?.runs?.[0]?.text === "Top songs") {
        playlistId = item.musicShelfRenderer.contents?.[0]?.musicResponsiveListItemRenderer?.flexColumns?.[0]
          ?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.playlistId;
        break;
      }
    }

    // Find recommended artists
    let recommendedArtists = null;
    for (const item of contents) {
      const headerTitle = item.musicCarouselShelfRenderer?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text;
      if (headerTitle === "Fans might also like") {
        recommendedArtists = (item.musicCarouselShelfRenderer.contents || []).map((it: any) => ({
          name: it.musicTwoRowItemRenderer?.title?.runs?.[0]?.text,
          browseId: it.musicTwoRowItemRenderer?.navigationEndpoint?.browseEndpoint?.browseId,
          thumbnail: it.musicTwoRowItemRenderer?.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url,
        }));
        break;
      }
    }

    return {
      artistName: header?.title?.runs?.[0]?.text,
      artistAvatar: header?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url,
      playlistId,
      recommendedArtists,
    };
  }

  async getPlaylist(playlistId: string) {
    const browseId = `VL${playlistId.replace(/^VL/, "")}`;
    const data = await this.makeRequest("browse", { browseId });
    
    // Handle different header types
    const header = data?.header?.musicDetailHeaderRenderer || 
                   data?.header?.musicEditablePlaylistDetailHeaderRenderer?.header?.musicDetailHeaderRenderer || {};
    
    // Handle both single and two column layouts
    const singleColumn = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
    const twoColumn = data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents?.sectionListRenderer?.contents;
    const contents = singleColumn || twoColumn || [];
    
    // Parse subtitle for author and track count
    const subtitleRuns = header.subtitle?.runs || [];
    const author = subtitleRuns.find((r: any) => r.navigationEndpoint)?.text || subtitleRuns[0]?.text;
    
    return {
      playlistId: playlistId.replace(/^VL/, ""),
      title: header.title?.runs?.[0]?.text,
      author,
      description: header.description?.runs?.[0]?.text,
      thumbnail: header.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url ||
                 header.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url,
      tracks: this.parseTracksFromContents(contents),
    };
  }

  async getCharts(country?: string) {
    const data = await this.makeRequest("browse", {
      browseId: "FEmusic_charts",
      formData: { selectedValues: [country || "US"] },
    });
    return this.parseChartsData(data);
  }

  async getMoodCategories() {
    const data = await this.makeRequest("browse", { browseId: "FEmusic_moods_and_genres" });
    return this.parseMoodsData(data);
  }

  async getMoodPlaylists(categoryId: string) {
    const data = await this.makeRequest("browse", { browseId: categoryId });
    const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    
    const playlists: any[] = [];
    for (const section of contents) {
      const items = section.musicShelfRenderer?.contents || [];
      for (const item of items) {
        const parsed = this.parseMusicItem(item.musicResponsiveListItemRenderer);
        if (parsed) playlists.push(parsed);
      }
    }
    return playlists;
  }

  async getWatchPlaylist(videoId?: string, playlistId?: string, radio = false, shuffle = false, limit = 25) {
    const data = await this.makeRequest("next", { videoId, playlistId, radio, shuffle });
    const contents = data?.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer
      ?.tabs?.[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer?.contents || [];

    const tracks = contents.map((item: any) => {
      const video = item.playlistPanelVideoRenderer;
      if (!video) return null;
      return {
        videoId: video.videoId,
        title: video.title?.runs?.[0]?.text,
        author: video.shortBylineText?.runs?.[0]?.text,
        thumbnail: video.thumbnail?.thumbnails?.[0]?.url,
      };
    }).filter(Boolean);

    return { tracks: tracks.slice(0, limit) };
  }

  async getRelated(videoId: string) {
    // Use YouTube's next endpoint for related videos
    const url = `https://www.youtube.com/youtubei/v1/next?key=${this.apiKey}`;
    const body = {
      videoId,
      context: { client: { clientName: "WEB", clientVersion: "2.20251013.01.00" } },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    const secondaryResults = data?.contents?.twoColumnWatchNextResults?.secondaryResults?.secondaryResults?.results || [];
    const results: any[] = [];
    
    for (const item of secondaryResults) {
      // Handle new lockupViewModel format
      if (item.lockupViewModel) {
        const lockup = item.lockupViewModel;
        const metadata = lockup.metadata?.lockupMetadataViewModel;
        const contentImage = lockup.contentImage?.collectionThumbnailViewModel?.primaryThumbnail?.thumbnailViewModel;
        
        const videoIdMatch = lockup.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId ||
                            lockup.contentId;
        
        if (videoIdMatch) {
          results.push({
            videoId: videoIdMatch,
            title: metadata?.title?.content,
            artist: metadata?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content,
            thumbnail: contentImage?.image?.sources?.[0]?.url,
            duration: metadata?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[2]?.text?.content,
          });
        }
      }
      // Handle old compactVideoRenderer format (fallback)
      else if (item.compactVideoRenderer) {
        const video = item.compactVideoRenderer;
        const durationText = video.lengthText?.simpleText || "";
        let durationSeconds = 0;
        if (durationText) {
          const parts = durationText.split(":").map((p: string) => parseInt(p) || 0);
          if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
          else if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }

        if (video.videoId && !(durationSeconds > 0 && durationSeconds <= 60)) {
          results.push({
            videoId: video.videoId,
            title: video.title?.simpleText || video.title?.runs?.[0]?.text,
            artist: video.shortBylineText?.runs?.[0]?.text,
            thumbnail: video.thumbnail?.thumbnails?.[0]?.url,
            duration: durationText,
          });
        }
      }
    }
    
    return results.slice(0, 20);
  }

  private async makeRequest(endpoint: string, params: any) {
    const url = `${this.baseURL}/${endpoint}?key=${this.apiKey}`;
    const body = { context: this.context, ...params };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  private async makeRequestWithContext(endpoint: string, params: any, context: any) {
    const url = `${this.baseURL}/${endpoint}?key=${this.apiKey}`;
    const body = { context, ...params };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  private getFilterParams(filter?: string): string | undefined {
    // Return undefined for no filter (searches everything - mixed results)
    if (!filter) return undefined;
    
    // These params are from YouTube Music's actual web requests
    const filterMap: Record<string, string> = {
      songs: "EgWKAQIIAWoKEAkQAxAEEAoQBQ%3D%3D",
      videos: "EgWKAQIQAWoKEAkQAxAEEAoQBQ%3D%3D",
      albums: "EgWKAQIYAWoKEAkQAxAEEAoQBQ%3D%3D",
      artists: "EgWKAQIgAWoKEAkQAxAEEAoQBQ%3D%3D",
      playlists: "EgWKAQIoAWoKEAkQAxAEEAoQBQ%3D%3D",
      community_playlists: "EgeKAQQoAEABagoQAxAEEAkQChAF",
      featured_playlists: "EgeKAQQoADgBagoQAxAEEAkQChAF",
    };
    return filterMap[filter] || undefined;
  }

  private parseSearchResults(data: any) {
    const results: any[] = [];
    let continuationToken: string | null = null;

    // Handle continuation
    const actions = data?.onResponseReceivedCommands || [];
    for (const action of actions) {
      const items = action?.appendContinuationItemsAction?.continuationItems || [];
      for (const entry of items) {
        if (entry.musicShelfRenderer || entry.musicShelfContinuation) {
          const shelf = entry.musicShelfRenderer || entry.musicShelfContinuation;
          for (const item of shelf.contents || []) {
            const parsed = this.parseMusicItem(item.musicResponsiveListItemRenderer);
            if (parsed) results.push(parsed);
          }
          continuationToken = shelf.continuations?.[0]?.nextContinuationData?.continuation || continuationToken;
        }
        if (entry.continuationItemRenderer) {
          continuationToken = entry.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token || continuationToken;
        }
      }
    }

    // Handle initial results
    if (results.length === 0) {
      const sections = data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
      for (const section of sections) {
        // Handle top result card (musicCardShelfRenderer)
        if (section.musicCardShelfRenderer) {
          const card = section.musicCardShelfRenderer;
          const topResult = this.parseTopResultCard(card);
          if (topResult) results.push(topResult);
        }
        // Handle regular shelf results
        if (section.musicShelfRenderer) {
          for (const item of section.musicShelfRenderer.contents || []) {
            const parsed = this.parseMusicItem(item.musicResponsiveListItemRenderer);
            if (parsed) results.push(parsed);
          }
          continuationToken = section.musicShelfRenderer.continuations?.[0]?.nextContinuationData?.continuation || continuationToken;
        }
      }
    }

    return { results, continuationToken };
  }

  private parseTopResultCard(card: any) {
    if (!card) return null;
    
    const title = card.title?.runs?.[0]?.text;
    const subtitleRuns = card.subtitle?.runs || [];
    const thumbnail = card.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url;
    
    // Extract video ID from various possible locations
    const videoId = card.onTap?.watchEndpoint?.videoId ||
                    card.buttons?.[0]?.buttonRenderer?.command?.watchEndpoint?.videoId;
    
    // Extract browse ID for artists/albums
    const browseId = card.onTap?.browseEndpoint?.browseId;
    
    // Determine type from subtitle
    const subtitleText = subtitleRuns.map((r: any) => r.text).join("");
    let resultType = "song";
    if (subtitleText.toLowerCase().includes("video") || subtitleText.toLowerCase().includes("vidéo")) {
      resultType = "video";
    } else if (subtitleText.toLowerCase().includes("artist") || subtitleText.toLowerCase().includes("artiste")) {
      resultType = "artist";
    } else if (subtitleText.toLowerCase().includes("album")) {
      resultType = "album";
    } else if (subtitleText.toLowerCase().includes("playlist")) {
      resultType = "playlist";
    }
    
    // Extract artist name from subtitle
    const artistRun = subtitleRuns.find((r: any) => 
      r.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs?.browseEndpointContextMusicConfig?.pageType === "MUSIC_PAGE_TYPE_ARTIST"
    );
    const artists = artistRun ? [{ name: artistRun.text, id: artistRun.navigationEndpoint?.browseEndpoint?.browseId }] : [];
    
    return {
      title,
      thumbnails: [{ url: thumbnail }],
      videoId,
      browseId,
      artists,
      resultType,
      isTopResult: true,
      subtitle: subtitleText,
    };
  }

  private parseSuggestions(data: any): string[] {
    const suggestions: string[] = [];
    const contents = data?.contents?.[0]?.searchSuggestionsSectionRenderer?.contents || data?.contents || [];
    
    for (const content of contents) {
      const runs = content?.searchSuggestionRenderer?.suggestion?.runs || [];
      const text = runs.map((r: any) => r.text).join("");
      if (text) suggestions.push(text);
    }
    return suggestions;
  }

  private parseMusicItem(item: any) {
    if (!item) return null;

    const title = item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
    const thumbnail = item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url;
    const videoId = item.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer
      ?.playNavigationEndpoint?.watchEndpoint?.videoId;
    const browseId = item.navigationEndpoint?.browseEndpoint?.browseId;

    const subtitle = item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
    const artists = subtitle
      .filter((r: any) => r.navigationEndpoint?.browseEndpoint?.browseEndpointContextSupportedConfigs
        ?.browseEndpointContextMusicConfig?.pageType === "MUSIC_PAGE_TYPE_ARTIST")
      .map((r: any) => ({ name: r.text, id: r.navigationEndpoint?.browseEndpoint?.browseId }));

    const duration = item.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text?.runs?.[0]?.text;

    return {
      title,
      thumbnails: [{ url: thumbnail }],
      videoId,
      browseId,
      artists,
      duration,
      resultType: videoId ? "song" : browseId?.startsWith("UC") ? "artist" : "album",
    };
  }

  private parseTracksFromContents(contents: any[]): any[] {
    const tracks: any[] = [];
    for (const section of contents) {
      const items = section.musicShelfRenderer?.contents || [];
      for (const item of items) {
        const parsed = this.parseMusicItem(item.musicResponsiveListItemRenderer);
        if (parsed) tracks.push(parsed);
      }
    }
    return tracks;
  }

  private parseChartsData(data: any) {
    const results: any[] = [];
    
    // Try different response structures
    const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    
    for (const section of contents) {
      // Handle musicCarouselShelfRenderer (common for charts)
      if (section.musicCarouselShelfRenderer) {
        const title = section.musicCarouselShelfRenderer?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text;
        const items = (section.musicCarouselShelfRenderer?.contents || []).map((item: any) => {
          const renderer = item.musicTwoRowItemRenderer || item.musicResponsiveListItemRenderer;
          return this.parseTwoRowItem(renderer);
        }).filter(Boolean);
        if (title && items.length) results.push({ title, items });
      }
      // Handle musicShelfRenderer
      if (section.musicShelfRenderer) {
        const title = section.musicShelfRenderer?.title?.runs?.[0]?.text;
        const items = (section.musicShelfRenderer?.contents || []).map((item: any) => 
          this.parseMusicItem(item.musicResponsiveListItemRenderer)
        ).filter(Boolean);
        if (title && items.length) results.push({ title, items });
      }
    }
    
    return results;
  }

  private parseMoodsData(data: any) {
    const results: any[] = [];
    const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];
    
    for (const section of contents) {
      if (section.gridRenderer) {
        const items = (section.gridRenderer?.items || []).map((item: any) => {
          const nav = item.musicNavigationButtonRenderer;
          if (!nav) return null;
          return {
            title: nav.buttonText?.runs?.[0]?.text,
            browseId: nav.clickCommand?.browseEndpoint?.browseId,
            color: nav.solid?.leftStripeColor,
          };
        }).filter(Boolean);
        if (items.length) results.push({ title: "Moods & Genres", items });
      }
      if (section.musicCarouselShelfRenderer) {
        const title = section.musicCarouselShelfRenderer?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text;
        const items = (section.musicCarouselShelfRenderer?.contents || []).map((item: any) => {
          const nav = item.musicNavigationButtonRenderer;
          if (!nav) return null;
          return {
            title: nav.buttonText?.runs?.[0]?.text,
            browseId: nav.clickCommand?.browseEndpoint?.browseId,
            color: nav.solid?.leftStripeColor,
          };
        }).filter(Boolean);
        if (title && items.length) results.push({ title, items });
      }
    }
    
    return results;
  }

  private parseTwoRowItem(item: any) {
    if (!item) return null;
    return {
      title: item.title?.runs?.[0]?.text,
      subtitle: item.subtitle?.runs?.map((r: any) => r.text).join(""),
      thumbnails: item.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails,
      videoId: item.navigationEndpoint?.watchEndpoint?.videoId,
      browseId: item.navigationEndpoint?.browseEndpoint?.browseId,
      playlistId: item.navigationEndpoint?.watchEndpoint?.playlistId,
    };
  }
}


// ============ YOUTUBE SEARCH ============

export class YouTubeSearch {
  private searchURL = "https://www.youtube.com/results";
  private continuationURL = "https://www.youtube.com/youtubei/v1/search";
  private suggestionsURL = "https://suggestqueries-clients6.youtube.com/complete/search";
  private apiKey: string | null = null;
  private clientVersion: string | null = null;

  async searchVideos(query: string | null, continuationToken?: string) {
    if (continuationToken) {
      return this.fetchContinuation(continuationToken, "video");
    }
    if (!query) throw new Error("Query is required for initial search");

    // Normalize the query to handle Arabic and other Unicode characters properly
    const normalizedQuery = query.normalize("NFC");
    const response = await fetch(`${this.searchURL}?search_query=${encodeURIComponent(normalizedQuery)}&sp=EgIQAQ%253D%253D`);
    const html = await response.text();
    this.extractAPIConfig(html);
    return this.parseVideoResults(html);
  }

  async searchChannels(query: string | null, continuationToken?: string) {
    if (continuationToken) {
      return this.fetchContinuation(continuationToken, "channel");
    }
    if (!query) throw new Error("Query is required for initial search");

    // Normalize the query to handle Arabic and other Unicode characters properly
    const normalizedQuery = query.normalize("NFC");
    const response = await fetch(`${this.searchURL}?search_query=${encodeURIComponent(normalizedQuery)}&sp=EgIQAg%253D%253D`);
    const html = await response.text();
    this.extractAPIConfig(html);
    return this.parseChannelResults(html);
  }

  async searchPlaylists(query: string | null, continuationToken?: string) {
    if (continuationToken) {
      return this.fetchContinuation(continuationToken, "playlist");
    }
    if (!query) throw new Error("Query is required for initial search");

    // Normalize the query to handle Arabic and other Unicode characters properly
    const normalizedQuery = query.normalize("NFC");
    const response = await fetch(`${this.searchURL}?search_query=${encodeURIComponent(normalizedQuery)}&sp=EgIQAw%253D%253D`);
    const html = await response.text();
    this.extractAPIConfig(html);
    return this.parsePlaylistResults(html);
  }

  async getSuggestions(query: string): Promise<string[]> {
    try {
      // Normalize the query to handle Arabic and other Unicode characters properly
      const normalizedQuery = query.normalize("NFC");
      const url = `${this.suggestionsURL}?ds=yt&client=youtube&q=${encodeURIComponent(normalizedQuery)}`;
      const response = await fetch(url);
      const text = await response.text();
      
      // Parse JSONP response
      const start = text.indexOf("(");
      const end = text.lastIndexOf(")");
      if (start === -1 || end === -1) return this.getStaticSuggestions(query);
      
      const json = JSON.parse(text.slice(start + 1, end));
      return (json[1] || []).map((item: any) => Array.isArray(item) ? item[0] : item).slice(0, 10);
    } catch {
      return this.getStaticSuggestions(query);
    }
  }

  private extractAPIConfig(html: string) {
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    const clientVersionMatch = html.match(/"clientVersion":"([^"]+)"/);
    if (apiKeyMatch) this.apiKey = apiKeyMatch[1];
    if (clientVersionMatch) this.clientVersion = clientVersionMatch[1];
  }

  private async fetchContinuation(token: string, type: string) {
    if (!this.apiKey) throw new Error("API key not initialized");

    const response = await fetch(`${this.continuationURL}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        continuation: token,
        context: { client: { clientName: "WEB", clientVersion: this.clientVersion || "2.20231219.01.00" } },
      }),
    });
    const data = await response.json();
    return this.parseContinuationResults(data, type);
  }

  private parseVideoResults(html: string) {
    const results: any[] = [];
    let continuationToken: string | null = null;

    const jsonMatch = html.match(/var ytInitialData = ({.+?});/);
    if (!jsonMatch) return { results, continuationToken };

    const data = JSON.parse(jsonMatch[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    const items = sections[0]?.itemSectionRenderer?.contents || [];

    for (const item of items) {
      if (item.videoRenderer) {
        results.push(this.parseVideoRenderer(item.videoRenderer));
      }
    }

    continuationToken = this.extractContinuationToken(data);
    return { results, continuationToken };
  }

  private parseChannelResults(html: string) {
    const results: any[] = [];
    let continuationToken: string | null = null;

    const jsonMatch = html.match(/var ytInitialData = ({.+?});/);
    if (!jsonMatch) return { results, continuationToken };

    const data = JSON.parse(jsonMatch[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    for (const section of sections) {
      for (const item of section?.itemSectionRenderer?.contents || []) {
        if (item.channelRenderer) {
          results.push(this.parseChannelRenderer(item.channelRenderer));
        }
      }
    }

    continuationToken = this.extractContinuationToken(data);
    return { results, continuationToken };
  }

  private parsePlaylistResults(html: string) {
    const results: any[] = [];
    let continuationToken: string | null = null;

    const jsonMatch = html.match(/var ytInitialData = ({.+?});/);
    if (!jsonMatch) return { results, continuationToken };

    const data = JSON.parse(jsonMatch[1]);
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    for (const section of sections) {
      for (const item of section?.itemSectionRenderer?.contents || []) {
        if (item.playlistRenderer) {
          results.push(this.parsePlaylistRenderer(item.playlistRenderer));
        }
      }
    }

    continuationToken = this.extractContinuationToken(data);
    return { results, continuationToken };
  }

  private parseContinuationResults(data: any, type: string) {
    const results: any[] = [];
    let continuationToken: string | null = null;

    const actions = data?.onResponseReceivedCommands || [];
    for (const action of actions) {
      const items = action?.appendContinuationItemsAction?.continuationItems || [];
      for (const item of items) {
        if (item.continuationItemRenderer) {
          continuationToken = item.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
          continue;
        }
        if (type === "video" && item.videoRenderer) {
          results.push(this.parseVideoRenderer(item.videoRenderer));
        } else if (type === "channel" && item.channelRenderer) {
          results.push(this.parseChannelRenderer(item.channelRenderer));
        } else if (type === "playlist" && item.playlistRenderer) {
          results.push(this.parsePlaylistRenderer(item.playlistRenderer));
        }
        if (item.itemSectionRenderer?.contents) {
          for (const inner of item.itemSectionRenderer.contents) {
            if (type === "video" && inner.videoRenderer) results.push(this.parseVideoRenderer(inner.videoRenderer));
            else if (type === "channel" && inner.channelRenderer) results.push(this.parseChannelRenderer(inner.channelRenderer));
            else if (type === "playlist" && inner.playlistRenderer) results.push(this.parsePlaylistRenderer(inner.playlistRenderer));
          }
        }
      }
    }

    return { results, continuationToken };
  }

  private extractContinuationToken(data: any): string | null {
    const sections = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
    for (const section of sections) {
      if (section.continuationItemRenderer) {
        return section.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token || null;
      }
    }
    return null;
  }

  private parseVideoRenderer(v: any) {
    return {
      type: "video",
      id: v.videoId,
      title: v.title?.runs?.[0]?.text,
      duration: v.lengthText?.simpleText,
      channel: {
        id: v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId,
        name: v.ownerText?.runs?.[0]?.text,
      },
      thumbnails: v.thumbnail?.thumbnails,
      publishedTime: v.publishedTimeText?.simpleText,
      viewCount: { text: v.viewCountText?.simpleText },
      link: `https://www.youtube.com/watch?v=${v.videoId}`,
    };
  }

  private parseChannelRenderer(c: any) {
    return {
      type: "channel",
      channelId: c.channelId,
      title: c.title?.simpleText,
      thumbnail: c.thumbnail?.thumbnails?.[0]?.url,
      subscriberCount: c.subscriberCountText?.simpleText,
      videoCount: c.videoCountText?.simpleText,
      url: `https://www.youtube.com/channel/${c.channelId}`,
    };
  }

  private parsePlaylistRenderer(p: any) {
    return {
      type: "playlist",
      playlistId: p.playlistId,
      title: p.title?.simpleText,
      thumbnail: p.thumbnails?.[0]?.thumbnails?.[0]?.url,
      videoCount: p.videoCount,
      author: p.shortBylineText?.runs?.[0]?.text,
      url: `https://www.youtube.com/playlist?list=${p.playlistId}`,
    };
  }

  private getStaticSuggestions(query: string): string[] {
    return [query, `${query} video`, `${query} 2024`, `${query} tutorial`, `${query} song`];
  }
}


// ============ LAST.FM ============

export const LastFM = {
  API_KEY: "0867bcb6f36c879398969db682a7b69b",

  async getSimilarTracks(title: string, artist: string, limit = "5") {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&api_key=${this.API_KEY}&limit=${limit}&format=json`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data?.error) return { error: data.message || "Last.fm error" };
      
      return (data?.similartracks?.track || [])
        .map((t: any) => ({ title: t.name, artist: t?.artist?.name }))
        .filter((t: any) => t.title && t.artist);
    } catch {
      return { error: "Failed to fetch similar tracks" };
    }
  },
};

// ============ STREAMING SOURCES ============

let instancesCache: any = null;
let instancesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function getDynamicInstances() {
  const now = Date.now();
  if (instancesCache && (now - instancesCacheTime) < CACHE_DURATION) {
    return instancesCache;
  }

  try {
    const response = await fetch("https://raw.githubusercontent.com/n-ce/Uma/main/dynamic_instances.json");
    instancesCache = await response.json();
    instancesCacheTime = now;
    return instancesCache;
  } catch {
    return {
      piped: ["https://api.piped.private.coffee"],
      invidious: ["https://invidious.nikkosphere.com", "https://yt.omada.cafe"],
    };
  }
}

export async function fetchFromPiped(videoId: string) {
  const instances = await getDynamicInstances();
  const pipedInstances = instances.piped || [];

  for (const instance of pipedInstances) {
    try {
      const response = await fetch(`${instance}/streams/${videoId}`);
      const data = await response.json();

      if (data?.audioStreams?.length) {
        return {
          success: true,
          instance,
          streamingUrls: data.audioStreams.map((s: any) => ({
            url: s.url,
            quality: s.quality,
            mimeType: s.mimeType,
            bitrate: s.bitrate,
          })),
          metadata: {
            id: videoId,
            title: data.title,
            uploader: data.uploader,
            thumbnail: data.thumbnailUrl,
            duration: data.duration,
            views: data.views,
          },
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
            url: f.url,
            bitrate: f.bitrate,
            type: f.type,
            audioQuality: f.audioQuality,
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

// ============ LYRICS (LRCLib - Free, No API Key) ============

export async function getLyrics(title: string, artist: string, duration?: number) {
  try {
    // Try exact match first
    let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
    if (duration) url += `&duration=${duration}`;
    
    let response = await fetch(url);
    let data = await response.json();
    
    // If no exact match, try search
    if (!data || data.statusCode === 404) {
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${title} ${artist}`)}`;
      response = await fetch(searchUrl);
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        data = results[0];
      }
    }
    
    if (!data || data.statusCode) {
      return { success: false, error: "Lyrics not found" };
    }
    
    return {
      success: true,
      trackName: data.trackName,
      artistName: data.artistName,
      albumName: data.albumName,
      duration: data.duration,
      plainLyrics: data.plainLyrics,
      syncedLyrics: data.syncedLyrics, // LRC format with timestamps
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ============ TRENDING MUSIC (YouTube Music Search by Country) ============

export async function getTrendingMusic(country = "United States", ytmusic?: YTMusic) {
  try {
    if (ytmusic) {
      const searchQueries = [
        `${country}n music 2026`,
        `${country}n songs`,
        `${country}n hits`,
        `popular ${country}n music`,
        `new ${country}n songs 2026`,
      ];
      
      const allTracks: any[] = [];
      const seenIds = new Set<string>();
      
      for (const query of searchQueries) {
        if (allTracks.length >= 30) break;
        
        const results = await ytmusic.search(query, "songs");
        if (results.results) {
          for (const t of results.results) {
            if (t.videoId && !seenIds.has(t.videoId)) {
              seenIds.add(t.videoId);
              allTracks.push({
                name: t.title,
                artist: t.artists?.map((a: any) => a.name).join(", "),
                videoId: t.videoId,
                thumbnail: t.thumbnails?.[0]?.url,
                duration: t.duration,
              });
            }
            if (allTracks.length >= 30) break;
          }
        }
      }
      
      if (allTracks.length > 0) {
        return {
          success: true,
          country: country,
          tracks: allTracks,
        };
      }
    }
    
    return { success: false, error: "Could not fetch trending" };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ============ RADIO (Infinite Mix based on song) ============

export async function getRadio(videoId: string, ytmusic: YTMusic) {
  try {
    // Use YouTube Music's radio feature
    const data = await ytmusic.getWatchPlaylist(videoId, undefined, true, false, 50);
    
    if (data.tracks && data.tracks.length > 0) {
      return {
        success: true,
        seedVideoId: videoId,
        tracks: data.tracks,
      };
    }
    
    return { success: false, error: "Could not generate radio" };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ============ TOP ARTISTS BY COUNTRY (YouTube Music Search) ============

export async function getTopArtists(country?: string, limit = 20, ytmusic?: YTMusic) {
  try {
    if (country && ytmusic) {
      // More specific search queries for artists FROM that country
      const searchQueries = [
        `${country}n artist`, // Tunisian artist
        `${country}n singer`,
        `${country}n rapper`,
        `${country}n musician`,
        `artist from ${country}`,
        `singer from ${country}`,
      ];
      
      const allArtists: any[] = [];
      const seenIds = new Set<string>();
      
      for (const query of searchQueries) {
        if (allArtists.length >= limit) break;
        
        const results = await ytmusic.search(query, "artists");
        if (results.results) {
          for (const a of results.results) {
            if (a.browseId && !seenIds.has(a.browseId)) {
              seenIds.add(a.browseId);
              allArtists.push({
                name: a.title,
                browseId: a.browseId,
                thumbnail: a.thumbnails?.[0]?.url,
              });
            }
            if (allArtists.length >= limit) break;
          }
        }
      }
      
      if (allArtists.length > 0) {
        return {
          success: true,
          country: country,
          artists: allArtists.slice(0, limit),
        };
      }
    }
    
    // Fallback to Last.fm global charts
    const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettopartists&api_key=${LastFM.API_KEY}&limit=${limit}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    
    const artists = data?.artists?.artist || [];
    
    return {
      success: true,
      country: "Global",
      artists: artists.map((a: any) => ({
        name: a.name,
        playcount: a.playcount,
        listeners: a.listeners,
        url: a.url,
        image: a.image?.find((i: any) => i.size === "large")?.["#text"],
      })),
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ============ TOP TRACKS BY COUNTRY (YouTube Music Search) ============

export async function getTopTracks(country?: string, limit = 20, ytmusic?: YTMusic) {
  try {
    if (country && ytmusic) {
      // More specific search queries for music FROM that country
      const searchQueries = [
        `${country}n music`, // Tunisian music
        `${country}n songs`,
        `${country}n rap`,
        `${country}n hits 2026`,
        `music from ${country}`,
        `songs from ${country}`,
      ];
      
      const allTracks: any[] = [];
      const seenIds = new Set<string>();
      
      for (const query of searchQueries) {
        if (allTracks.length >= limit) break;
        
        const results = await ytmusic.search(query, "songs");
        if (results.results) {
          for (const t of results.results) {
            if (t.videoId && !seenIds.has(t.videoId)) {
              seenIds.add(t.videoId);
              allTracks.push({
                name: t.title,
                artist: t.artists?.map((a: any) => a.name).join(", "),
                videoId: t.videoId,
                thumbnail: t.thumbnails?.[0]?.url,
                duration: t.duration,
              });
            }
            if (allTracks.length >= limit) break;
          }
        }
      }
      
      if (allTracks.length > 0) {
        return {
          success: true,
          country: country,
          tracks: allTracks.slice(0, limit),
        };
      }
    }
    
    // Fallback to Last.fm global charts
    const url = `https://ws.audioscrobbler.com/2.0/?method=chart.gettoptracks&api_key=${LastFM.API_KEY}&limit=${limit}&format=json`;
    const response = await fetch(url);
    const data = await response.json();
    
    const tracks = data?.tracks?.track || [];
    
    return {
      success: true,
      country: "Global",
      tracks: tracks.map((t: any) => ({
        name: t.name,
        artist: t.artist?.name,
        playcount: t.playcount,
        listeners: t.listeners,
        url: t.url,
      })),
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ============ ARTIST INFO (Last.fm) ============

export async function getArtistInfo(artist: string) {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${LastFM.API_KEY}&format=json`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data?.error) {
      return { success: false, error: data.message };
    }
    
    const a = data?.artist;
    return {
      success: true,
      name: a?.name,
      bio: a?.bio?.summary?.replace(/<[^>]*>/g, ""), // Strip HTML
      tags: a?.tags?.tag?.map((t: any) => t.name) || [],
      similar: a?.similar?.artist?.map((s: any) => s.name) || [],
      stats: {
        listeners: a?.stats?.listeners,
        playcount: a?.stats?.playcount,
      },
      image: a?.image?.find((i: any) => i.size === "large")?.["#text"],
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ============ TRACK INFO (Last.fm) ============

export async function getTrackInfo(title: string, artist: string) {
  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&api_key=${LastFM.API_KEY}&format=json`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data?.error) {
      return { success: false, error: data.message };
    }
    
    const t = data?.track;
    return {
      success: true,
      name: t?.name,
      artist: t?.artist?.name,
      album: t?.album?.title,
      duration: t?.duration,
      listeners: t?.listeners,
      playcount: t?.playcount,
      tags: t?.toptags?.tag?.map((tag: any) => tag.name) || [],
      wiki: t?.wiki?.summary?.replace(/<[^>]*>/g, ""),
    };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
