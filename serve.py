import http.server, socketserver, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
# same security policy as the hosting config (vercel.json / _headers), minus the https-only bits
CSP=("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
     "font-src https://fonts.gstatic.com; img-src 'self' data: blob: https://*.mzstatic.com https://i.ytimg.com; media-src 'self' blob: https://*.itunes.apple.com; connect-src 'self' https://itunes.apple.com; frame-src https://www.youtube-nocookie.com; "
     "object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'")
HIDDEN={'/serve.py','/start-lofi.bat','/vercel.json','/_headers','/.vercelignore'}
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.split('?')[0] in HIDDEN: self.send_error(404); return
        if self.path.startswith('/api/yt'): return self.yt()
        super().do_GET()
    # dev copy of functions/api/yt.js: find a song on YouTube by name -> {"ids":[...]} (played in YouTube's own player)
    YT_CACHE={}
    def yt(self):
        import urllib.parse, urllib.request, re, json
        q=(urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query).get('q',[''])[0]).strip()[:120]
        ids=self.YT_CACHE.get(q.lower())
        if ids is None:
            ids=[]
            try:
                req=urllib.request.Request('https://www.youtube.com/results?hl=en&gl=US&sp=EgIQAQ%253D%253D&search_query='+urllib.parse.quote(q),
                    headers={'accept-language':'en-US,en;q=0.8','user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36','cookie':'SOCS=CAI; CONSENT=YES+1'})
                t=urllib.request.urlopen(req,timeout=10).read().decode('utf-8','replace')
                for m in re.finditer(r'"videoRenderer":\{"videoId":"([\w-]{11})"',t):
                    if m.group(1) not in ids: ids.append(m.group(1))
                    if len(ids)>=5: break
            except Exception: pass
            if ids: self.YT_CACHE[q.lower()]=ids
        body=json.dumps({'ids':ids}).encode()
        self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body)
    def list_directory(self,path): self.send_error(404); return None
    # dev only: the page can POST a PNG frame to /__shot?name=x, saved into ./_shots for review
    def do_POST(self):
        if not self.path.startswith('/__shot'): self.send_error(404); return
        import urllib.parse, re
        q=urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query); name=re.sub(r'[^a-z0-9_-]','',(q.get('name',['shot'])[0]).lower())[:40] or 'shot'
        n=int(self.headers.get('Content-Length','0')); data=self.rfile.read(n)
        os.makedirs('_shots',exist_ok=True); open(os.path.join('_shots',name+'.png'),'wb').write(data)
        self.send_response(204); self.end_headers()
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('Content-Security-Policy',CSP)
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('X-Frame-Options','DENY')
        self.send_header('Referrer-Policy','strict-origin-when-cross-origin')
        super().end_headers()
    def log_message(self,*a): pass
port=int(sys.argv[1]) if len(sys.argv)>1 else 5174
socketserver.ThreadingTCPServer.allow_reuse_address=True
socketserver.ThreadingTCPServer.daemon_threads=True
# only this computer can reach the dev server
with socketserver.ThreadingTCPServer(('127.0.0.1',port),H) as s: s.serve_forever()
