/**
 * Virome API - UI HTML Template
 */

export const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Virome API</title>
  <link rel="icon" href="/assets/logo.png">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#000;min-height:100vh;color:#fff}
    .container{max-width:1000px;margin:0 auto;padding:60px 24px 200px}
    .header{display:flex;align-items:center;gap:16px;margin-bottom:48px}
    .logo{width:48px;height:48px;border-radius:12px}
    .brand{font-size:2rem;font-weight:700;background:linear-gradient(90deg,#00d4aa,#00a8cc);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .badge{background:linear-gradient(90deg,#a855f7,#ec4899,#f97316,#a855f7);background-size:300% 100%;color:#fff;font-size:.55rem;font-weight:600;padding:2px 6px;border-radius:4px;animation:gradientShift 3s ease infinite;position:absolute;top:0;right:-70px;text-transform:uppercase;letter-spacing:.5px}
    @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    .brand-wrap{position:relative;display:inline-block}
    .cards{display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-bottom:48px}
    @media(max-width:640px){.cards{grid-template-columns:1fr}}
    .card{padding:24px 0}
    .card-label{font-size:.7rem;font-weight:600;padding:4px 10px;border-radius:4px;display:inline-block;margin-bottom:12px;text-transform:uppercase}
    .card-label.green{background:rgba(34,197,94,.15);color:#22c55e}
    .card-label.purple{background:rgba(168,85,247,.15);color:#a855f7}
    .card-label.blue{background:rgba(59,130,246,.15);color:#3b82f6}
    .card-label.pink{background:rgba(236,72,153,.15);color:#ec4899}
    .card-title{font-size:1.25rem;font-weight:600;margin-bottom:8px}
    .card-desc{font-size:.9rem;color:#6b7280;line-height:1.5}
    .tabs{display:flex;gap:0;margin-bottom:32px;border-bottom:1px solid #1a1a1a}
    .tab{padding:14px 24px;background:none;border:none;color:#6b7280;font-size:.9rem;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px}
    .tab:hover{color:#00d4aa}.tab.active{color:#00d4aa;border-bottom-color:#00d4aa}
    .tab-content{display:none}.tab-content.active{display:block}
    .section-title{font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:#00d4aa;margin:32px 0 16px;font-weight:600}
    .api-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}
    .api-card{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;padding:16px;transition:border-color .2s}
    .api-card:hover{border-color:#00d4aa}
    .api-method{display:inline-block;font-size:.6rem;font-weight:700;padding:3px 8px;border-radius:4px;margin-right:10px;background:rgba(34,197,94,.15);color:#22c55e}
    .api-path{font-family:monospace;font-size:.85rem;color:#e5e5e5}
    .api-desc{font-size:.8rem;color:#525252;margin-top:8px}
    .search-box{display:flex;gap:12px;margin-bottom:24px}
    .search-input{flex:1;background:#0a0a0a;border:1px solid #1a1a1a;padding:14px 18px;border-radius:10px;color:#fff;font-size:1rem}
    .search-input:focus{outline:none;border-color:#00d4aa}
    .search-input::placeholder{color:#525252}
    .btn{background:linear-gradient(135deg,#00d4aa,#00a8cc);color:#000;border:none;padding:14px 28px;border-radius:10px;font-size:.9rem;font-weight:600;cursor:pointer}
    .btn:hover{opacity:.9}.btn:disabled{opacity:.5}
    .btn-sm{padding:12px 20px;font-size:.85rem}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="/assets/logo.png" alt="Virome" class="logo">
      <span class="brand-wrap"><span class="brand">Virome API</span><span class="badge">UNOFFICIAL</span></span>
    </div>
    <div class="cards">
      <div class="card">
        <span class="card-label green">Get Started</span>
        <h3 class="card-title">Explore the Docs</h3>
        <p class="card-desc">Check out the documentation to learn how to use the Virome API for music search and streaming.</p>
      </div>
      <div class="card">
        <span class="card-label purple">Open Source</span>
        <h3 class="card-title">Open Source</h3>
        <p class="card-desc">Virome API is open-source. Built with Deno for fast, secure music data access.</p>
      </div>
      <div class="card">
        <span class="card-label blue">Features</span>
        <h3 class="card-title">What You Can Do</h3>
        <p class="card-desc">Search songs, albums, artists. Get streaming URLs, related tracks, and more.</p>
      </div>
      <div class="card">
        <span class="card-label pink">Try It</span>
        <h3 class="card-title">Test the Player</h3>
        <p class="card-desc">Use the built-in player to search and play music directly from the API.</p>
      </div>
    </div>
    <div class="tabs">
      <button class="tab active" onclick="switchTab('docs')">Documentation</button>
      <button class="tab" onclick="switchTab('player')">Player</button>
      <button class="tab" onclick="switchTab('api')">API Tester</button>
    </div>
    <div id="docsTab" class="tab-content active">
      <div class="section-title">Search Endpoints</div>
      <div class="api-grid">
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/search</span><div class="api-desc">Search YouTube Music. Params: q, filter (songs/albums/artists)</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/yt_search</span><div class="api-desc">Search YouTube. Params: q, filter (videos/channels/playlists)</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/search/suggestions</span><div class="api-desc">Get search suggestions. Params: q</div></div>
      </div>
      <div class="section-title">Content Endpoints</div>
      <div class="api-grid">
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/songs/:videoId</span><div class="api-desc">Get song details by video ID</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/albums/:browseId</span><div class="api-desc">Get album details and tracks</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/artists/:browseId</span><div class="api-desc">Get artist info and top songs</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/playlists/:playlistId</span><div class="api-desc">Get playlist details and tracks</div></div>
      </div>
      <div class="section-title">Discovery Endpoints</div>
      <div class="api-grid">
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/related/:videoId</span><div class="api-desc">Get related songs for a video</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/similar</span><div class="api-desc">Find similar tracks. Params: title, artist</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/trending</span><div class="api-desc">Most played songs in a country</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/radio</span><div class="api-desc">Generate radio mix. Params: videoId</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/top/artists</span><div class="api-desc">Most listened artists in a country</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/top/tracks</span><div class="api-desc">Most listened tracks in a country</div></div>
      </div>
      <div class="section-title">Info Endpoints</div>
      <div class="api-grid">
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/lyrics</span><div class="api-desc">Get lyrics. Params: title, artist</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/artist/info</span><div class="api-desc">Artist bio and stats. Params: artist</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/track/info</span><div class="api-desc">Track details. Params: title, artist</div></div>
      </div>
      <div class="section-title">Streaming Endpoints</div>
      <div class="api-grid">
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/stream</span><div class="api-desc">Get stream URLs. Params: id</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/api/watch_playlist</span><div class="api-desc">Get watch playlist. Params: videoId or playlistId</div></div>
        <div class="api-card"><span class="api-method">GET</span><span class="api-path">/health</span><div class="api-desc">Health check endpoint</div></div>
      </div>
    </div>

    <div id="playerTab" class="tab-content">
      <style>
        .results-list{max-height:50vh;overflow-y:auto}
        .result-item{display:flex;align-items:center;gap:14px;padding:14px;border-radius:10px;cursor:pointer;transition:background .2s}
        .result-item:hover{background:#0a0a0a}
        .result-item.active{background:#0f0f0f;border:1px solid #1a1a1a}
        .result-thumb{width:52px;height:52px;border-radius:8px;object-fit:cover;background:#1a1a1a}
        .result-info{flex:1;min-width:0}
        .result-title{font-size:.95rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .result-artist{font-size:.8rem;color:#525252;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .result-duration{font-size:.8rem;color:#3f3f3f}
        .no-results{padding:48px;text-align:center;color:#3f3f3f}
        .loading{padding:48px;text-align:center;color:#00d4aa;display:none}
        .player{position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,.95);backdrop-filter:blur(20px);border-top:1px solid #1a1a1a;padding:16px 24px;display:none}
        .player.visible{display:block}
        .player-content{max-width:1000px;margin:0 auto}
        .player-main{display:flex;align-items:center;gap:16px;margin-bottom:12px}
        .player-thumb{width:52px;height:52px;border-radius:8px;object-fit:cover;background:#1a1a1a}
        .player-info{flex:1;min-width:0}
        .player-title{font-size:.9rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .player-artist{color:#525252;font-size:.75rem}
        .player-controls{display:flex;align-items:center;gap:10px}
        .ctrl-btn{width:40px;height:40px;border-radius:50%;background:#1a1a1a;color:#fff;border:none;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center}
        .ctrl-btn:hover{background:#262626}
        .ctrl-btn.play{background:linear-gradient(135deg,#00d4aa,#00a8cc);color:#000;width:48px;height:48px}
        .progress-wrap{display:flex;align-items:center;gap:12px}
        .progress-time{font-size:.7rem;color:#525252;min-width:40px}
        .progress-bar{flex:1;height:4px;background:#1a1a1a;border-radius:2px;cursor:pointer}
        .progress-fill{height:100%;background:linear-gradient(90deg,#00d4aa,#00a8cc);border-radius:2px;width:0%}
        .api-row{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap}
        .api-select{background:#0a0a0a;border:1px solid #1a1a1a;padding:14px 18px;border-radius:10px;color:#fff;font-size:.9rem;min-width:220px}
        .api-select:focus{outline:none;border-color:#00d4aa}
        .api-select option{background:#000}
        .api-input{background:#0a0a0a;border:1px solid #1a1a1a;padding:14px 18px;border-radius:10px;color:#fff;font-size:.9rem;flex:1;min-width:150px}
        .api-input:focus{outline:none;border-color:#00d4aa}
        .api-input::placeholder{color:#525252}
        .country-select-wrap{position:relative;flex:1;min-width:200px}
        .country-list{display:none;position:absolute;top:100%;left:0;right:0;background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;max-height:200px;overflow-y:auto;z-index:100;margin-top:4px}
        .country-item{padding:10px 14px;cursor:pointer;font-size:.85rem;color:#fff}
        .country-item:hover{background:#1a1a1a;color:#00d4aa}
        .api-response{background:#0a0a0a;border:1px solid #1a1a1a;border-radius:10px;padding:20px;margin-top:20px;max-height:400px;overflow:auto}
        .api-response pre{font-family:monospace;font-size:.8rem;color:#00d4aa;white-space:pre-wrap;word-break:break-all}
        .api-url{font-family:monospace;font-size:.8rem;color:#525252;margin-bottom:16px;padding:12px 16px;background:#0a0a0a;border-radius:8px;border:1px solid #1a1a1a}
        footer{margin-top:48px;color:#3f3f3f;font-size:.75rem;text-align:center}
      </style>
      <div class="search-box">
        <select class="api-select" id="searchType" style="min-width:120px">
          <option value="">All</option>
          <option value="songs">Songs</option>
          <option value="videos">Videos</option>
          <option value="artists">Artists</option>
          <option value="albums">Albums</option>
          <option value="playlists">Playlists</option>
        </select>
        <input type="text" class="search-input" id="searchInput" placeholder="Search for songs, artists, or albums...">
        <button class="btn" id="searchBtn" onclick="doSearch()">Search</button>
      </div>
      <div class="loading" id="loading">Searching...</div>
      <div class="results-list" id="resultsList"></div>
    </div>
    <div id="apiTab" class="tab-content">
      <div class="api-row">
        <select class="api-select" id="apiEndpoint" onchange="updateApiInputs()">
          <option value="search">Search Songs</option>
          <option value="stream">Get Stream URLs</option>
          <option value="song">Get Song Details</option>
          <option value="album">Get Album</option>
          <option value="artist">Get Artist</option>
          <option value="playlist">Get Playlist</option>
          <option value="related">Get Related Songs</option>
          <option value="similar">Get Similar Tracks</option>
          <option value="lyrics">Get Lyrics</option>
          <option value="trending">Trending Music</option>
          <option value="radio">Generate Radio</option>
          <option value="topartists">Top Artists</option>
          <option value="toptracks">Top Tracks</option>
          <option value="artistinfo">Artist Info</option>
          <option value="trackinfo">Track Info</option>
          <option value="suggestions">Search Suggestions</option>
        </select>
      </div>
      <div class="api-row" id="apiInputs"></div>
      <div class="api-url" id="apiUrl">GET /api/search?q=Drake</div>
      <button class="btn btn-sm" onclick="testApi()">Test Endpoint</button>
      <div class="api-response" id="apiResponse"><pre>Click "Test Endpoint" to see the response...</pre></div>
    </div>
    <footer>Virome API</footer>
  </div>
  <div class="player" id="player">
    <div class="player-content">
      <div class="player-main">
        <img class="player-thumb" id="playerThumb" src="" alt="">
        <div class="player-info">
          <div class="player-title" id="playerTitle">-</div>
          <div class="player-artist" id="playerArtist">-</div>
        </div>
        <div class="player-controls">
          <button class="ctrl-btn" onclick="prevSong()">⏮</button>
          <button class="ctrl-btn play" id="playBtn" onclick="togglePlay()">▶</button>
          <button class="ctrl-btn" onclick="nextSong()">⏭</button>
        </div>
      </div>
      <div class="progress-wrap">
        <span class="progress-time" id="currentTime">0:00</span>
        <div class="progress-bar" id="progressBar" onclick="seek(event)">
          <div class="progress-fill" id="progressFill"></div>
        </div>
        <span class="progress-time" id="duration">0:00</span>
      </div>
    </div>
  </div>
  <div id="ytplayer"></div>
  <script>
    (function(){var oe=console.error;console.error=function(){var m=arguments[0]||'';if(typeof m==='string'&&(m.includes('postMessage')||m.includes('youtube.com')||m.includes('ERR_BLOCKED')))return;oe.apply(console,arguments)}})();
    var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';document.head.appendChild(tag);
    var songs=[],player=null,playerReady=false,isPlaying=false,currentIndex=-1,progressInterval=null;
    document.getElementById('searchInput').onkeypress=e=>{if(e.key==='Enter')doSearch()};
    function switchTab(t){document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.tab-content').forEach(x=>x.classList.remove('active'));document.querySelector('.tab[onclick*="'+t+'"]').classList.add('active');document.getElementById(t+'Tab').classList.add('active')}
    function onYouTubeIframeAPIReady(){player=new YT.Player('ytplayer',{height:'0',width:'0',playerVars:{autoplay:1,controls:0,disablekb:1,fs:0,iv_load_policy:3,modestbranding:1,rel:0},events:{onReady:()=>{playerReady=true},onStateChange:onState,onError:onErr}})}
    function onErr(e){if(e.data===150||e.data===101){if(currentIndex<songs.length-1)setTimeout(()=>playSong(currentIndex+1),500)}}
    function onState(e){if(e.data===1){isPlaying=true;document.getElementById('playBtn').textContent='⏸';startProg()}else if(e.data===2){isPlaying=false;document.getElementById('playBtn').textContent='▶';stopProg()}else if(e.data===0){isPlaying=false;document.getElementById('playBtn').textContent='▶';stopProg();nextSong()}}
    function startProg(){stopProg();progressInterval=setInterval(updateProg,500)}
    function stopProg(){if(progressInterval){clearInterval(progressInterval);progressInterval=null}}
    function updateProg(){if(!player||!playerReady)return;var c=player.getCurrentTime()||0,t=player.getDuration()||0;document.getElementById('currentTime').textContent=fmt(c);document.getElementById('duration').textContent=fmt(t);document.getElementById('progressFill').style.width=t>0?(c/t*100)+'%':'0%'}
    function fmt(s){var m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec}
    function seek(e){if(!player||!playerReady)return;var bar=document.getElementById('progressBar'),rect=bar.getBoundingClientRect(),pct=(e.clientX-rect.left)/rect.width;player.seekTo(pct*(player.getDuration()||0),true)}
    async function doSearch(){var q=document.getElementById('searchInput').value.trim();if(!q)return;var filter=document.getElementById('searchType').value;document.getElementById('searchBtn').disabled=true;document.getElementById('loading').style.display='block';document.getElementById('resultsList').innerHTML='';try{var url='/api/search?q='+encodeURIComponent(q);if(filter)url+='&filter='+filter;var res=await fetch(url);var data=await res.json();songs=data.results||[];renderResults(filter)}catch(e){songs=[];renderResults(filter)}document.getElementById('searchBtn').disabled=false;document.getElementById('loading').style.display='none'}
    function renderResults(filter){var list=document.getElementById('resultsList');if(!songs.length){list.innerHTML='<div class="no-results">No results found</div>';return}if(filter==='artists'){list.innerHTML=songs.map((s,i)=>'<div class="result-item" onclick="openArtist(\\''+s.browseId+'\\')"><img class="result-thumb" style="border-radius:50%" src="'+(s.thumbnails?.[0]?.url||'')+'"><div class="result-info"><div class="result-title">'+esc(s.title||'Unknown')+'</div><div class="result-artist">Artist</div></div></div>').join('')}else if(filter==='albums'){list.innerHTML=songs.map((s,i)=>'<div class="result-item" onclick="openAlbum(\\''+s.browseId+'\\')"><img class="result-thumb" src="'+(s.thumbnails?.[0]?.url||'')+'"><div class="result-info"><div class="result-title">'+esc(s.title||'Unknown')+'</div><div class="result-artist">'+esc(s.artists?.map(a=>a.name).join(', ')||'Album')+'</div></div></div>').join('')}else{list.innerHTML=songs.map((s,i)=>{var isPlayable=s.videoId&&(s.resultType==='song'||s.resultType==='video'||!s.resultType);var onclick=isPlayable?'playSong('+i+')':s.resultType==='artist'?'openArtist(\\''+s.browseId+'\\')':s.resultType==='album'?'openAlbum(\\''+s.browseId+'\\')':'';var typeLabel=s.isTopResult?'<span style="color:#00d4aa;font-size:.65rem;margin-left:6px">TOP</span>':s.resultType&&s.resultType!=='song'?'<span style="color:#525252;font-size:.65rem;margin-left:6px">'+s.resultType.toUpperCase()+'</span>':'';return '<div class="result-item'+(i===currentIndex?' active':'')+'" onclick="'+onclick+'"><img class="result-thumb" src="'+(s.thumbnails?.[0]?.url||(s.videoId?'https://img.youtube.com/vi/'+s.videoId+'/mqdefault.jpg':''))+'"><div class="result-info"><div class="result-title">'+esc(s.title||'Unknown')+typeLabel+'</div><div class="result-artist">'+esc(s.artists?.map(a=>a.name).join(', ')||(s.subtitle||'Unknown'))+'</div></div><div class="result-duration">'+(s.duration||'')+'</div></div>'}).join('')}}
    function openArtist(id){switchTab('api');document.getElementById('apiEndpoint').value='artist';updateApiInputs();document.getElementById('api_browseId').value=id;updateApiUrl();testApi()}
    function openAlbum(id){switchTab('api');document.getElementById('apiEndpoint').value='album';updateApiInputs();document.getElementById('api_browseId').value=id;updateApiUrl();testApi()}
    function playSong(i){if(!songs[i])return;if(!playerReady){setTimeout(()=>playSong(i),300);return}currentIndex=i;var s=songs[i];document.getElementById('playerTitle').textContent=s.title||'Unknown';document.getElementById('playerArtist').textContent=s.artists?.map(a=>a.name).join(', ')||'Unknown';document.getElementById('playerThumb').src=s.thumbnails?.[0]?.url||'https://img.youtube.com/vi/'+s.videoId+'/mqdefault.jpg';document.getElementById('player').className='player visible';document.querySelectorAll('.result-item').forEach((el,idx)=>el.className=idx===i?'result-item active':'result-item');player.loadVideoById(s.videoId);isPlaying=true;document.getElementById('playBtn').textContent='⏸'}
    function togglePlay(){if(!playerReady)return;if(isPlaying)player.pauseVideo();else player.playVideo()}
    function prevSong(){if(currentIndex>0)playSong(currentIndex-1)}
    function nextSong(){if(currentIndex<songs.length-1)playSong(currentIndex+1)}
    function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}
    var apiCfg={search:{inputs:[{n:'q',p:'Search query',v:"Drake God's Plan"},{n:'filter',p:'Filter',v:'songs'}],url:'/api/search'},stream:{inputs:[{n:'id',p:'Video ID',v:'xpVfcZ0ZcFM'}],url:'/api/stream'},song:{inputs:[{n:'videoId',p:'Video ID',v:'xpVfcZ0ZcFM'}],url:'/api/songs/{videoId}'},album:{inputs:[{n:'browseId',p:'Album ID',v:'MPREb_K5gbGpJwFbv'}],url:'/api/albums/{browseId}'},artist:{inputs:[{n:'browseId',p:'Artist ID',v:'UCU6cE7pdJPc6DU2jSrKEsdQ'}],url:'/api/artists/{browseId}'},playlist:{inputs:[{n:'playlistId',p:'Playlist ID',v:'RDCLAK5uy_n9Fbdw7e6ap-98_A-8JYBmPv64v-Uaq1g'}],url:'/api/playlists/{playlistId}'},related:{inputs:[{n:'id',p:'Video ID',v:'xpVfcZ0ZcFM'}],url:'/api/related/{id}'},similar:{inputs:[{n:'title',p:'Song title',v:"God's Plan"},{n:'artist',p:'Artist',v:'Drake'}],url:'/api/similar'},lyrics:{inputs:[{n:'title',p:'Song title',v:"Blinding Lights"},{n:'artist',p:'Artist',v:'The Weeknd'}],url:'/api/lyrics'},trending:{inputs:[{n:'country',p:'Country',v:'Tunisia',type:'country'}],url:'/api/trending'},radio:{inputs:[{n:'videoId',p:'Video ID',v:'xpVfcZ0ZcFM'}],url:'/api/radio'},topartists:{inputs:[{n:'country',p:'Country',v:'Tunisia',type:'country'},{n:'limit',p:'Limit',v:'20'}],url:'/api/top/artists'},toptracks:{inputs:[{n:'country',p:'Country',v:'Tunisia',type:'country'},{n:'limit',p:'Limit',v:'20'}],url:'/api/top/tracks'},artistinfo:{inputs:[{n:'artist',p:'Artist name',v:'Drake'}],url:'/api/artist/info'},trackinfo:{inputs:[{n:'title',p:'Song title',v:"God's Plan"},{n:'artist',p:'Artist',v:'Drake'}],url:'/api/track/info'},suggestions:{inputs:[{n:'q',p:'Query',v:'Drake'}],url:'/api/search/suggestions'}};
    var countries=["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"];
    function updateApiInputs(){var ep=document.getElementById('apiEndpoint').value,cfg=apiCfg[ep];var html='';cfg.inputs.forEach(function(i){if(i.type==='country'){html+='<div class="country-select-wrap"><input class="api-input country-search" id="api_'+i.n+'" placeholder="Search country..." value="'+(i.v||'')+'" autocomplete="off" onfocus="showCountryList(this)" oninput="filterCountries(this)"><div class="country-list" id="countryList_'+i.n+'"></div></div>'}else{html+='<input class="api-input" id="api_'+i.n+'" placeholder="'+i.p+'" value="'+(i.v||'')+'">'}});document.getElementById('apiInputs').innerHTML=html;updateApiUrl()}
    function showCountryList(input){var listId='countryList_'+input.id.replace('api_','');var list=document.getElementById(listId);list.innerHTML=countries.map(c=>'<div class="country-item" onclick="selectCountry(\\''+input.id+'\\',\\''+c+'\\')">'+c+'</div>').join('');list.style.display='block'}
    function filterCountries(input){var listId='countryList_'+input.id.replace('api_','');var list=document.getElementById(listId);var val=input.value.toLowerCase();var filtered=countries.filter(c=>c.toLowerCase().includes(val));list.innerHTML=filtered.map(c=>'<div class="country-item" onclick="selectCountry(\\''+input.id+'\\',\\''+c+'\\')">'+c+'</div>').join('');list.style.display='block';updateApiUrl()}
    function selectCountry(inputId,country){document.getElementById(inputId).value=country;document.getElementById('countryList_'+inputId.replace('api_','')).style.display='none';updateApiUrl()}
    document.addEventListener('click',function(e){if(!e.target.classList.contains('country-search')){document.querySelectorAll('.country-list').forEach(l=>l.style.display='none')}});
    function updateApiUrl(){var ep=document.getElementById('apiEndpoint').value,cfg=apiCfg[ep],url=cfg.url,params=new URLSearchParams();cfg.inputs.forEach(i=>{var val=document.getElementById('api_'+i.n)?.value?.trim()||i.v||'';if(val){if(url.includes('{'+i.n+'}'))url=url.replace('{'+i.n+'}',encodeURIComponent(val));else params.append(i.n,val)}});var qs=params.toString();if(qs)url+='?'+qs;document.getElementById('apiUrl').textContent='GET '+url}
    document.getElementById('apiInputs').oninput=updateApiUrl;
    async function testApi(){var ep=document.getElementById('apiEndpoint').value,cfg=apiCfg[ep],url=cfg.url,params=new URLSearchParams();cfg.inputs.forEach(i=>{var val=document.getElementById('api_'+i.n)?.value?.trim();if(val){if(url.includes('{'+i.n+'}'))url=url.replace('{'+i.n+'}',encodeURIComponent(val));else params.append(i.n,val)}});var qs=params.toString();if(qs)url+='?'+qs;document.getElementById('apiResponse').innerHTML='<pre style="color:#00d4aa">Loading...</pre>';try{var res=await fetch(url);var data=await res.json();document.getElementById('apiResponse').innerHTML='<pre>'+JSON.stringify(data,null,2)+'</pre>'}catch(e){document.getElementById('apiResponse').innerHTML='<pre style="color:#ef4444">Error: '+e.message+'</pre>'}}
    updateApiInputs();
  </script>
</body>
</html>`;
