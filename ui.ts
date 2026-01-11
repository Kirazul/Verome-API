/**
 * Virome API - Clean Professional UI
 */

export const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Virome API</title>
  <link rel="icon" href="/assets/logo.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{--accent:#10b981;--accent-dim:rgba(16,185,129,.15);--bg:#0a0a0a;--surface:#111;--surface2:#1a1a1a;--border:#222;--text:#fff;--muted:#888;--dim:#555}
    body{font-family:'Inter',system-ui,sans-serif;min-height:100vh;color:var(--text);background:var(--bg)}
    .bg{position:fixed;inset:0;z-index:-1;background:radial-gradient(ellipse 80% 50% at 50% -20%,rgba(16,185,129,.08),transparent)}
    .container{max-width:900px;margin:0 auto;padding:60px 24px 180px}
    .hero{text-align:center;margin-bottom:80px}
    .logo{width:160px;height:160px;margin-bottom:32px;filter:drop-shadow(0 20px 50px rgba(16,185,129,.4));animation:float 6s ease-in-out infinite}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    .title{font-size:3rem;font-weight:700;margin-bottom:12px;letter-spacing:-1px}
    .subtitle{color:var(--muted);font-size:1.1rem;font-weight:400}
    .nav{display:flex;justify-content:center;gap:8px;margin-bottom:48px}
    .nav-btn{padding:12px 28px;background:transparent;border:1px solid var(--border);color:var(--muted);font-size:.9rem;font-weight:500;cursor:pointer;border-radius:10px;transition:all .3s;font-family:inherit}
    .nav-btn:hover{color:var(--text);border-color:#444;transform:translateY(-2px)}
    .nav-btn.active{color:var(--accent);border-color:var(--accent);background:var(--accent-dim);transform:translateY(-2px)}
    .tab{display:none;opacity:0;transform:translateY(20px);transition:opacity .4s,transform .4s}
    .tab.active{display:block;opacity:1;transform:translateY(0)}
    .section{margin-bottom:40px}
    .section-title{font-size:.7rem;text-transform:uppercase;letter-spacing:1.5px;color:var(--accent);margin-bottom:16px;font-weight:600}
    .api-list{display:flex;flex-direction:column;gap:8px}
    .api-item{display:flex;align-items:center;gap:16px;padding:16px 20px;background:var(--surface);border:1px solid var(--border);border-radius:12px;transition:all .15s;cursor:pointer}
    .api-item:hover{border-color:#333;transform:translateX(4px)}
    .method{font-size:.65rem;font-weight:700;padding:5px 10px;border-radius:6px;background:var(--accent-dim);color:var(--accent);min-width:42px;text-align:center}
    .path{font-family:'SF Mono',Monaco,monospace;font-size:.85rem;flex:1}
    .desc{font-size:.75rem;color:var(--dim);max-width:280px;text-align:right}
    .search-row{display:flex;gap:12px;margin-bottom:24px}
    .input{flex:1;background:var(--surface);border:1px solid var(--border);padding:14px 18px;border-radius:10px;color:var(--text);font-size:.95rem;font-family:inherit}
    .input:focus{outline:none;border-color:var(--accent)}
    .input::placeholder{color:var(--dim)}
    .select{background:var(--surface);border:1px solid var(--border);padding:14px 18px;border-radius:10px;color:var(--text);font-size:.9rem;font-family:inherit;cursor:pointer;min-width:120px}
    .select:focus{outline:none;border-color:var(--accent)}
    .select option{background:var(--bg)}
    .btn{background:var(--accent);color:#000;border:none;padding:14px 28px;border-radius:10px;font-size:.9rem;font-weight:600;font-family:inherit;cursor:pointer;transition:all .15s}
    .btn:hover{opacity:.9}
    .btn:disabled{opacity:.4}
    .results{max-height:50vh;overflow-y:auto}
    .result{display:flex;align-items:center;gap:14px;padding:12px;border-radius:10px;cursor:pointer;transition:all .15s}
    .result:hover{background:var(--surface)}
    .result.active{background:var(--accent-dim)}
    .thumb{width:52px;height:52px;border-radius:8px;object-fit:cover;background:var(--surface2)}
    .info{flex:1;min-width:0}
    .name{font-size:.9rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .artist{font-size:.8rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .dur{font-size:.75rem;color:var(--dim);font-family:monospace}
    .empty{padding:48px;text-align:center;color:var(--dim)}
    .loading{display:none;padding:48px;text-align:center;color:var(--accent)}
    .tester-row{display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap}
    .url-preview{font-family:monospace;font-size:.8rem;color:var(--muted);padding:12px 16px;background:var(--surface);border-radius:8px;margin-bottom:16px;border:1px solid var(--border)}
    .response{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;margin-top:20px;max-height:400px;overflow:auto}
    .response pre{font-family:'SF Mono',Monaco,monospace;font-size:.75rem;color:var(--accent);white-space:pre-wrap;word-break:break-all}
    .player{position:fixed;bottom:0;left:0;right:0;background:rgba(10,10,10,.95);backdrop-filter:blur(20px);border-top:1px solid var(--border);padding:16px 24px;display:none;z-index:100}
    .player.visible{display:block}
    .player-inner{max-width:900px;margin:0 auto}
    .player-row{display:flex;align-items:center;gap:16px;margin-bottom:12px}
    .player-thumb{width:48px;height:48px;border-radius:8px;object-fit:cover;background:var(--surface)}
    .player-info{flex:1;min-width:0}
    .player-title{font-size:.9rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .player-artist{font-size:.8rem;color:var(--muted)}
    .controls{display:flex;align-items:center;gap:8px}
    .ctrl{width:40px;height:40px;border-radius:50%;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s}
    .ctrl:hover{background:var(--surface2)}
    .ctrl.play{background:var(--accent);border:none;color:#000;width:44px;height:44px}
    .progress-row{display:flex;align-items:center;gap:12px}
    .time{font-size:.7rem;color:var(--muted);min-width:40px;font-family:monospace}
    .bar{flex:1;height:4px;background:var(--surface2);border-radius:2px;cursor:pointer}
    .fill{height:100%;background:var(--accent);border-radius:2px;width:0%}
    @media(max-width:600px){.container{padding:40px 16px 180px}.logo{width:80px;height:80px}.title{font-size:2rem}.desc{display:none}.search-row{flex-direction:column}}
  </style>
</head>
<body>
  <div class="bg"></div>
  <div class="container">
    <div class="hero">
      <img src="/assets/logo.png" alt="Virome" class="logo">
      <h1 class="title">Virome API</h1>
      <p class="subtitle">Music API for YouTube Music, Lyrics & Streaming</p>
    </div>
    
    <div class="nav">
      <button class="nav-btn active" onclick="showTab('docs')">Docs</button>
      <button class="nav-btn" onclick="showTab('player')">Player</button>
      <button class="nav-btn" onclick="showTab('tester')">Tester</button>
    </div>
    
    <div id="docs" class="tab active">
      <div class="section">
        <div class="section-title">Search</div>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/search</span><span class="desc">Search songs, albums, artists</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/search/suggestions</span><span class="desc">Autocomplete suggestions</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/yt_search</span><span class="desc">YouTube video search</span></div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Content</div>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/songs/:videoId</span><span class="desc">Song + artist/album links</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/albums/:browseId</span><span class="desc">Album + tracks + artist</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/artists/:browseId</span><span class="desc">Artist + discography</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/playlists/:playlistId</span><span class="desc">Playlist tracks</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/chain/:videoId</span><span class="desc">Song -> Artist -> Albums</span></div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Discovery</div>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/related/:videoId</span><span class="desc">Related songs</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/radio?videoId=</span><span class="desc">Generate radio mix</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/similar?title=&artist=</span><span class="desc">Similar tracks</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/charts?country=</span><span class="desc">Music charts</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/trending?country=</span><span class="desc">Trending music</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/moods</span><span class="desc">Mood categories</span></div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Streaming & Lyrics</div>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/stream?id=</span><span class="desc">Audio stream URLs</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/proxy?url=</span><span class="desc">Audio proxy (CORS)</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/lyrics?title=&artist=</span><span class="desc">Synced lyrics (LRC)</span></div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Info</div>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/artist/info?artist=</span><span class="desc">Artist bio (Last.fm)</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/track/info?title=&artist=</span><span class="desc">Track info (Last.fm)</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/top/artists?country=</span><span class="desc">Top artists</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/top/tracks?country=</span><span class="desc">Top tracks</span></div>
        </div>
      </div>
    </div>
    
    <div id="player-tab" class="tab">
      <div class="search-row">
        <select class="select" id="filter">
          <option value="">All</option>
          <option value="songs">Songs</option>
          <option value="albums">Albums</option>
          <option value="artists">Artists</option>
        </select>
        <input type="text" class="input" id="query" placeholder="Search music...">
        <button class="btn" id="searchBtn" onclick="search()">Search</button>
      </div>
      <div class="loading" id="loading">Searching...</div>
      <div class="results" id="results"></div>
    </div>
    
    <div id="tester" class="tab">
      <div class="tester-row">
        <select class="select" id="endpoint" onchange="updateInputs()" style="min-width:200px">
          <option value="search">Search</option>
          <option value="stream">Stream URLs</option>
          <option value="song">Song Details</option>
          <option value="album">Album</option>
          <option value="artist">Artist</option>
          <option value="playlist">Playlist</option>
          <option value="chain">Full Chain</option>
          <option value="related">Related</option>
          <option value="radio">Radio</option>
          <option value="lyrics">Lyrics</option>
          <option value="charts">Charts</option>
        </select>
      </div>
      <div class="tester-row" id="inputs"></div>
      <div class="url-preview" id="urlPreview">GET /api/search?q=coldplay</div>
      <button class="btn" onclick="testApi()">Test</button>
      <div class="response" id="response"><pre>Response will appear here...</pre></div>
    </div>
  </div>
  
  <div class="player" id="playerBar">
    <div class="player-inner">
      <div class="player-row">
        <img class="player-thumb" id="pThumb" src="">
        <div class="player-info">
          <div class="player-title" id="pTitle">-</div>
          <div class="player-artist" id="pArtist">-</div>
        </div>
        <div class="controls">
          <button class="ctrl" onclick="prev()">⏮</button>
          <button class="ctrl play" id="playBtn" onclick="toggle()">▶</button>
          <button class="ctrl" onclick="next()">⏭</button>
        </div>
      </div>
      <div class="progress-row">
        <span class="time" id="cur">0:00</span>
        <div class="bar" id="bar" onclick="seek(event)"><div class="fill" id="fill"></div></div>
        <span class="time" id="total">0:00</span>
      </div>
    </div>
  </div>
  
  <div id="ytplayer"></div>
</body>
<script>
// Completely disable ALL console output
(function(){
  console.log=function(){};
  console.warn=function(){};
  console.error=function(){};
  console.info=function(){};
  console.debug=function(){};
  console.trace=function(){};
  console.dir=function(){};
  console.dirxml=function(){};
  console.table=function(){};
  console.group=function(){};
  console.groupCollapsed=function(){};
  console.groupEnd=function(){};
  console.clear=function(){};
  console.count=function(){};
  console.countReset=function(){};
  console.assert=function(){};
  console.profile=function(){};
  console.profileEnd=function(){};
  console.time=function(){};
  console.timeLog=function(){};
  console.timeEnd=function(){};
  console.timeStamp=function(){};
  // Suppress window errors
  window.onerror=function(){return true};
  window.onunhandledrejection=function(e){e.preventDefault();return true};
})();
// Use nocookie domain for less tracking
var tag=document.createElement('script');tag.src='https://www.youtube.com/iframe_api';document.head.appendChild(tag);
var songs=[],yt=null,ready=false,playing=false,idx=-1,interval=null;
document.getElementById('query').onkeypress=e=>{if(e.key==='Enter')search()};

function showTab(t){
  document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(t==='player'?'player-tab':t).classList.add('active');
  document.querySelector('.nav-btn[onclick*="'+t+'"]').classList.add('active');
}

function onYouTubeIframeAPIReady(){
  yt=new YT.Player('ytplayer',{height:'0',width:'0',host:'https://www.youtube-nocookie.com',playerVars:{autoplay:1,controls:0,disablekb:1,fs:0,modestbranding:1,rel:0},events:{onReady:()=>ready=true,onStateChange:onState,onError:onErr}});
}
function onErr(e){
  if(e.data===150||e.data===101||e.data===100){
    var s=songs[idx];
    if(s&&s.fallbackVideoId&&!s.triedFallback){
      s.triedFallback=true;yt.loadVideoById(s.fallbackVideoId);
    }else if(s&&!s.triedSearch){
      s.triedSearch=true;
      searchYouTube(s.title,s.artists?.[0]?.name||'').then(vid=>{if(vid)yt.loadVideoById(vid)});
    }
  }
}
async function searchYouTube(title,artist){
  try{var res=await fetch('/api/yt_search?q='+encodeURIComponent(title+' '+artist+' official')+'&filter=videos');var data=await res.json();var alt=data.results?.find(v=>v.channel?.name&&!v.channel.name.includes('Topic')&&v.id);return alt?.id||null}catch(e){return null}
}
function onState(e){
  if(e.data===1){playing=true;document.getElementById('playBtn').textContent='⏸';startProgress()}
  else if(e.data===2){playing=false;document.getElementById('playBtn').textContent='▶';stopProgress()}
  else if(e.data===0){playing=false;stopProgress();next()}
}
function startProgress(){stopProgress();interval=setInterval(updateProgress,500)}
function stopProgress(){if(interval){clearInterval(interval);interval=null}}
function updateProgress(){if(!yt||!ready)return;var c=yt.getCurrentTime()||0,t=yt.getDuration()||0;document.getElementById('cur').textContent=fmt(c);document.getElementById('total').textContent=fmt(t);document.getElementById('fill').style.width=t>0?(c/t*100)+'%':'0%'}
function fmt(s){var m=Math.floor(s/60),sec=Math.floor(s%60);return m+':'+(sec<10?'0':'')+sec}
function seek(e){if(!yt||!ready)return;var bar=document.getElementById('bar'),rect=bar.getBoundingClientRect(),pct=(e.clientX-rect.left)/rect.width;yt.seekTo(pct*(yt.getDuration()||0),true)}

async function search(){
  var q=document.getElementById('query').value.trim();if(!q)return;
  var f=document.getElementById('filter').value;
  document.getElementById('searchBtn').disabled=true;document.getElementById('loading').style.display='block';document.getElementById('results').innerHTML='';
  try{var url='/api/search?q='+encodeURIComponent(q);if(f)url+='&filter='+f;var res=await fetch(url);var data=await res.json();songs=data.results||[];render(f)}catch(e){songs=[];render(f)}
  document.getElementById('searchBtn').disabled=false;document.getElementById('loading').style.display='none';
}

function render(f,append){
  var el=document.getElementById('results');
  if(!songs.length){if(!append)el.innerHTML='<div class="empty">No results</div>';return}
  var html=songs.map((s,i)=>{
    var type=s.resultType||'song';
    var playable=s.videoId&&(type==='song'||type==='video');
    var click='';
    // Check browseId prefix to determine actual type
    var bid=s.browseId||'';
    var isPlaylist=bid.startsWith('VL')||bid.startsWith('RDCLAK')||type==='playlist';
    var isAlbum=bid.startsWith('MPRE')&&!isPlaylist;
    var isArtist=bid.startsWith('UC')||type==='artist';
    
    if(playable){
      click='play('+i+')';
    }else if(isPlaylist&&bid){
      click="viewPlaylist('"+bid+"')";
      type='playlist';
    }else if(isAlbum&&bid){
      click="viewAlbum('"+bid+"')";
      type='album';
    }else if(isArtist&&bid){
      click="viewArtist('"+bid+"')";
      type='artist';
    }else if(bid){
      click="viewArtist('"+bid+"')";
    }
    var img=s.thumbnails?.[0]?.url||(s.videoId?'https://img.youtube.com/vi/'+s.videoId+'/mqdefault.jpg':'');
    var badge=type!=='song'&&type!=='video'?'<span style="font-size:.65rem;color:var(--accent);margin-left:8px;text-transform:uppercase">'+type+'</span>':'';
    return '<div class="result'+(i===idx?' active':'')+'" onclick="'+click+'" style="cursor:pointer"><img class="thumb" src="'+img+'"><div class="info"><div class="name">'+esc(s.title||s.name||'Unknown')+badge+'</div><div class="artist">'+esc(s.artists?.map(a=>a.name).join(', ')||s.subtitle||'')+'</div></div><div class="dur">'+(s.duration||'')+'</div></div>';
  }).join('');
  if(append)el.innerHTML+=html;
  else el.innerHTML=html;
}

function play(i){
  if(!songs[i]||!ready)return;idx=i;var s=songs[i];
  document.getElementById('pTitle').textContent=s.title||'Unknown';
  document.getElementById('pArtist').textContent=s.artists?.map(a=>a.name).join(', ')||'';
  document.getElementById('pThumb').src=s.thumbnails?.[0]?.url||'https://img.youtube.com/vi/'+s.videoId+'/mqdefault.jpg';
  document.getElementById('playerBar').className='player visible';
  document.querySelectorAll('.result').forEach((el,x)=>el.className=x===i?'result active':'result');
  yt.loadVideoById(s.videoId);playing=true;document.getElementById('playBtn').textContent='⏸';
}
function toggle(){if(!ready)return;playing?yt.pauseVideo():yt.playVideo()}
function prev(){if(idx>0)play(idx-1)}
function next(){if(idx<songs.length-1)play(idx+1)}
function esc(t){var d=document.createElement('div');d.textContent=t;return d.innerHTML}

async function viewArtist(id){
  document.getElementById('loading').style.display='block';
  document.getElementById('results').innerHTML='';
  try{
    var res=await fetch('/api/artists/'+encodeURIComponent(id));
    var data=await res.json();
    var artist=data.artist||data;
    var tracks=[];
    // Get songs from artist - check both structures
    if(data.topSongs)tracks.push(...data.topSongs.map(s=>({...s,resultType:'song',videoId:s.videoId,thumbnails:[{url:s.thumbnail}]})));
    if(data.songs?.results)tracks.push(...data.songs.results.map(s=>({...s,resultType:'song'})));
    if(data.albums){
      data.albums.forEach(a=>{tracks.push({...a,resultType:'album',browseId:a.browseId,thumbnails:[{url:a.thumbnail}]})});
    }
    if(data.singles){
      data.singles.forEach(a=>{tracks.push({...a,resultType:'album',browseId:a.browseId,thumbnails:[{url:a.thumbnail}]})});
    }
    songs=tracks;
    // Show artist header
    var thumb=artist.thumbnail||artist.thumbnails?.[0]?.url||'';
    var header='<div style="display:flex;align-items:center;gap:20px;padding:20px;margin-bottom:20px;background:var(--surface);border-radius:12px;border:1px solid var(--border)"><img src="'+thumb+'" style="width:80px;height:80px;border-radius:50%;object-fit:cover;background:var(--surface2)"><div><div style="font-size:1.2rem;font-weight:600">'+esc(artist.name||'Artist')+'</div><div style="color:var(--muted);font-size:.85rem">'+(artist.subscribers||'')+'</div><button class="btn" style="margin-top:10px;padding:8px 16px;font-size:.8rem" onclick="goBack()">Back to Search</button></div></div>';
    document.getElementById('results').innerHTML=header;
    render(null,true);
  }catch(e){document.getElementById('results').innerHTML='<div class="empty">Failed to load artist</div>';}
  document.getElementById('loading').style.display='none';
}

async function viewAlbum(id){
  document.getElementById('loading').style.display='block';
  document.getElementById('results').innerHTML='';
  try{
    var res=await fetch('/api/albums/'+encodeURIComponent(id));
    var data=await res.json();
    var album=data.album||data;
    var albumThumb=album.thumbnail||album.thumbnails?.[0]?.url||'';
    songs=(data.tracks||[]).map(t=>({...t,resultType:'song',thumbnails:[{url:albumThumb}]}));
    // Show album header
    var artistName=data.artist?.name||album.artists?.map(a=>a.name).join(', ')||'';
    var header='<div style="display:flex;align-items:center;gap:20px;padding:20px;margin-bottom:20px;background:var(--surface);border-radius:12px;border:1px solid var(--border)"><img src="'+albumThumb+'" style="width:80px;height:80px;border-radius:8px;object-fit:cover;background:var(--surface2)"><div><div style="font-size:1.2rem;font-weight:600">'+esc(album.title||'Album')+'</div><div style="color:var(--muted);font-size:.85rem">'+esc(artistName)+'</div><div style="color:var(--dim);font-size:.75rem">'+(album.year||'')+' - '+(album.trackCount||songs.length)+' tracks</div><button class="btn" style="margin-top:10px;padding:8px 16px;font-size:.8rem" onclick="goBack()">Back to Search</button></div></div>';
    document.getElementById('results').innerHTML=header;
    render(null,true);
  }catch(e){document.getElementById('results').innerHTML='<div class="empty">Failed to load album</div>';}
  document.getElementById('loading').style.display='none';
}

async function viewPlaylist(id){
  document.getElementById('loading').style.display='block';
  document.getElementById('results').innerHTML='';
  try{
    // Handle both VL prefix and raw playlist IDs
    var playlistId=id.startsWith('VL')?id.substring(2):id;
    var res=await fetch('/api/playlists/'+encodeURIComponent(playlistId));
    var data=await res.json();
    var playlistThumb=data.thumbnail||data.thumbnails?.[0]?.url||'';
    songs=(data.tracks||[]).map(t=>({...t,resultType:'song'}));
    // Show playlist header
    var header='<div style="display:flex;align-items:center;gap:20px;padding:20px;margin-bottom:20px;background:var(--surface);border-radius:12px;border:1px solid var(--border)"><img src="'+playlistThumb+'" style="width:80px;height:80px;border-radius:8px;object-fit:cover;background:var(--surface2)"><div><div style="font-size:1.2rem;font-weight:600">'+esc(data.title||'Playlist')+'</div><div style="color:var(--muted);font-size:.85rem">'+esc(data.author||'')+'</div><div style="color:var(--dim);font-size:.75rem">'+(data.trackCount||songs.length)+' tracks</div><button class="btn" style="margin-top:10px;padding:8px 16px;font-size:.8rem" onclick="goBack()">Back to Search</button></div></div>';
    document.getElementById('results').innerHTML=header;
    render(null,true);
  }catch(e){document.getElementById('results').innerHTML='<div class="empty">Failed to load playlist</div>';}
  document.getElementById('loading').style.display='none';
}

var lastSearch='';
function goBack(){
  var q=document.getElementById('query').value.trim();
  if(q)search();
  else{songs=[];document.getElementById('results').innerHTML='<div class="empty">Search for music</div>';}
}

var cfg={
  search:{inputs:[{n:'q',p:'Query',v:'coldplay'}],url:'/api/search'},
  stream:{inputs:[{n:'id',p:'Video ID',v:'dQw4w9WgXcQ'}],url:'/api/stream'},
  song:{inputs:[{n:'videoId',p:'Video ID',v:'dQw4w9WgXcQ'}],url:'/api/songs/{videoId}'},
  album:{inputs:[{n:'browseId',p:'Album ID',v:'MPREb_PvMNqFUp1oW'}],url:'/api/albums/{browseId}'},
  artist:{inputs:[{n:'browseId',p:'Artist ID',v:'UCIaFw5VBEK8qaW6nRpx_qnw'}],url:'/api/artists/{browseId}'},
  playlist:{inputs:[{n:'playlistId',p:'Playlist ID',v:'RDCLAK5uy_k'}],url:'/api/playlists/{playlistId}'},
  chain:{inputs:[{n:'videoId',p:'Video ID',v:'9qnqYL0eNNI'}],url:'/api/chain/{videoId}'},
  related:{inputs:[{n:'id',p:'Video ID',v:'dQw4w9WgXcQ'}],url:'/api/related/{id}'},
  radio:{inputs:[{n:'videoId',p:'Video ID',v:'9qnqYL0eNNI'}],url:'/api/radio'},
  lyrics:{inputs:[{n:'title',p:'Title',v:'Yellow'},{n:'artist',p:'Artist',v:'Coldplay'}],url:'/api/lyrics'},
  charts:{inputs:[{n:'country',p:'Country',v:'US'}],url:'/api/charts'}
};

function updateInputs(){
  var ep=document.getElementById('endpoint').value,c=cfg[ep];
  document.getElementById('inputs').innerHTML=c.inputs.map(i=>'<input class="input" id="api_'+i.n+'" placeholder="'+i.p+'" value="'+i.v+'" oninput="updateUrl()">').join('');
  updateUrl();
}
function updateUrl(){
  var ep=document.getElementById('endpoint').value,c=cfg[ep],url=c.url,params=new URLSearchParams();
  c.inputs.forEach(i=>{var v=document.getElementById('api_'+i.n)?.value||i.v;if(v){if(url.includes('{'+i.n+'}'))url=url.replace('{'+i.n+'}',encodeURIComponent(v));else params.append(i.n,v)}});
  var qs=params.toString();if(qs)url+='?'+qs;document.getElementById('urlPreview').textContent='GET '+url;
}
async function testApi(){
  var ep=document.getElementById('endpoint').value,c=cfg[ep],url=c.url,params=new URLSearchParams();
  c.inputs.forEach(i=>{var v=document.getElementById('api_'+i.n)?.value||i.v;if(v){if(url.includes('{'+i.n+'}'))url=url.replace('{'+i.n+'}',encodeURIComponent(v));else params.append(i.n,v)}});
  var qs=params.toString();if(qs)url+='?'+qs;
  document.getElementById('response').innerHTML='<pre>Loading...</pre>';
  try{var res=await fetch(url);var data=await res.json();document.getElementById('response').innerHTML='<pre>'+JSON.stringify(data,null,2)+'</pre>'}catch(e){document.getElementById('response').innerHTML='<pre>Error: '+e.message+'</pre>'}
}
updateInputs();
</script>
</html>`;
