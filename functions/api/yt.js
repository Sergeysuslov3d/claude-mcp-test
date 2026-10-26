// Cloudflare Pages Function: GET /api/yt?q=<artist title>  ->  { ids: ["videoId", ...] }
// Finds a song on YouTube so the page can play it in YouTube's own embedded player (nothing is downloaded).
// With a YT_KEY secret set (YouTube Data API key) it uses the official search API; otherwise it reads the
// public results page. Answers are cached for a day so repeated names cost nothing.
const json=(o,status=200,extra={})=>new Response(JSON.stringify(o),{ status, headers:{ 'content-type':'application/json; charset=utf-8', 'x-content-type-options':'nosniff', ...extra } });

export async function onRequestGet({ request, env }){
  const q=(new URL(request.url).searchParams.get('q')||'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,120);
  if(q.length<2) return json({ error:'query too short' },400);
  const cache=caches.default, key=new Request('https://yt-lookup.internal/v1/'+encodeURIComponent(q.toLowerCase()));
  const hit=await cache.match(key); if(hit) return hit;
  let ids=[];
  try{
    if(env.YT_KEY){
      const r=await fetch('https://www.googleapis.com/youtube/v3/search?part=id&type=video&videoEmbeddable=true&videoCategoryId=10&maxResults=5&q='+encodeURIComponent(q)+'&key='+env.YT_KEY);
      const j=await r.json(); ids=(j.items||[]).map(x=>x.id&&x.id.videoId).filter(Boolean);
    }
    if(!ids.length){
      const r=await fetch('https://www.youtube.com/results?hl=en&gl=US&sp=EgIQAQ%253D%253D&search_query='+encodeURIComponent(q),
        { headers:{ 'accept-language':'en-US,en;q=0.8', 'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'cookie':'SOCS=CAI; CONSENT=YES+1' } });
      const t=await r.text(), seen=new Set();
      for(const m of t.matchAll(/"videoRenderer":\{"videoId":"([\w-]{11})"/g)){ if(!seen.has(m[1])){ seen.add(m[1]); ids.push(m[1]); } if(ids.length>=5) break; }
    }
  }catch(e){ return json({ ids:[], error:'lookup failed' },502); }
  const res=json({ ids },200,{ 'cache-control':'public, max-age=86400' });
  if(ids.length) await cache.put(key,res.clone());
  return res;
}
