<p align="center">
  <img src="assets/Logo.png" alt="Virome API" width="120">
</p>

<h1 align="center">Virome API</h1>

<p align="center">
  A music API built with Deno for searching, streaming, and exploring music data from YouTube Music, YouTube, and Last.fm.
</p>

---

## Overview

Virome API provides a unified interface to access music data from multiple sources. It includes a built-in web UI for testing endpoints and playing music directly in the browser.

## Features

- Search songs, albums, artists, and playlists
- Get song lyrics with synced timestamps
- Stream audio from YouTube via Piped/Invidious proxies
- Generate radio mixes based on a song
- Get trending music and top artists by country
- Artist and track information from Last.fm
- Built-in music player with YouTube IFrame API

## Installation

### Requirements

- Deno 1.40 or higher

### Run Locally

```bash
cd deno-music-api
deno run --allow-net --allow-env --allow-read mod.ts
```

The server starts at `http://localhost:8000`

### Deploy to Deno Deploy

1. Push the code to a GitHub repository
2. Go to https://dash.deno.com
3. Create a new project and link your repository
4. Set the entry point to `mod.ts`

## API Endpoints

### Search

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| GET /api/search | Search YouTube Music | q, filter (songs/albums/artists) |
| GET /api/yt_search | Search YouTube | q, filter (videos/channels/playlists) |
| GET /api/search/suggestions | Get search suggestions | q |

### Content

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| GET /api/songs/:videoId | Get song details | videoId |
| GET /api/albums/:browseId | Get album tracks | browseId |
| GET /api/artists/:browseId | Get artist info | browseId |
| GET /api/playlists/:playlistId | Get playlist tracks | playlistId |

### Discovery

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| GET /api/related/:videoId | Get related songs | videoId |
| GET /api/similar | Find similar tracks | title, artist |
| GET /api/trending | Trending music by country | country |
| GET /api/radio | Generate radio mix | videoId |
| GET /api/top/artists | Top artists by country | country, limit |
| GET /api/top/tracks | Top tracks by country | country, limit |

### Info

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| GET /api/lyrics | Get song lyrics | title, artist |
| GET /api/artist/info | Artist bio and stats | artist |
| GET /api/track/info | Track details | title, artist |

### Streaming

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| GET /api/stream | Get stream URLs | id |
| GET /api/watch_playlist | Get watch playlist | videoId or playlistId |
| GET /health | Health check | - |

## Usage Examples

### Search for songs

```
GET /api/search?q=Blinding%20Lights&filter=songs
```

### Get lyrics

```
GET /api/lyrics?title=Blinding%20Lights&artist=The%20Weeknd
```

### Get stream URLs

```
GET /api/stream?id=4NRXx6U8ABQ
```

### Get top artists from a country

```
GET /api/top/artists?country=Tunisia&limit=20
```

### Generate radio from a song

```
GET /api/radio?videoId=4NRXx6U8ABQ
```

## Project Structure

```
deno-music-api/
  mod.ts      - Main server and route handlers
  lib.ts      - API clients (YouTube Music, YouTube, Last.fm)
  ui.ts       - Web UI HTML template
  deno.json   - Deno configuration
  assets/
    Logo.png  - Project logo
```

## Data Sources

- YouTube Music API (unofficial)
- YouTube Data (via Invidious/Piped)
- Last.fm API (artist info, similar tracks)
- LRCLib (lyrics)

## License

MIT

## Disclaimer

This is an unofficial API for educational purposes. It is not affiliated with YouTube, Google, or Last.fm.
