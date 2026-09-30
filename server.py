import http.server, socketserver, json, os, base64, secrets, mimetypes
from email.parser import BytesParser
from email.policy import default
from urllib.parse import urlparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
IMG = ROOT / "images"
PORT = 8765
SESSIONS = set()

def read_json(name, default):
    p = DATA/name
    try:
        return json.loads(p.read_text(encoding="utf-8"))
    except Exception:
        return default

def write_json(name, value):
    (DATA/name).write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")

def safe_name(name):
    return "".join(c for c in name if c.isalnum() or c in "._-").strip(".") or "image.jpg"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_json(self, obj, code=200):
        raw=json.dumps(obj,ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type","application/json; charset=utf-8")
        self.send_header("Content-Length",str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def logged(self):
        cookie=self.headers.get("Cookie","")
        return any(x.startswith("sid=") and x[4:] in SESSIONS for x in cookie.split("; "))

    def body(self):
        n=int(self.headers.get("Content-Length","0"))
        return json.loads(self.rfile.read(n).decode("utf-8"))

    def do_GET(self):
        path=urlparse(self.path).path
        if path == "/api/products":
            self.send_json(read_json("products.json",[])); return
        if path == "/api/settings":
            self.send_json(read_json("settings.json",{})); return
        if path == "/api/orders":
            if not self.logged(): self.send_json({"error":"auth"},401); return
            self.send_json(read_json("orders.json",[])); return
        if path == "/api/me":
            self.send_json({"ok":self.logged()}); return
        if path == "/admin":
            self.path="/admin.html"
        super().do_GET()

    def do_POST(self):
        path=urlparse(self.path).path
        try: data=self.body()
        except Exception: self.send_json({"error":"Неверные данные"},400); return

        if path=="/api/login":
            pwd=read_json("admin.json",{"password":"admin123"}).get("password","admin123")
            if str(data.get("password","")) != str(pwd):
                self.send_json({"error":"Неверный пароль"},403); return
            sid=secrets.token_urlsafe(24); SESSIONS.add(sid)
            self.send_response(200); self.send_header("Content-Type","application/json")
            self.send_header("Set-Cookie",f"sid={sid}; Path=/; HttpOnly; SameSite=Lax")
            self.end_headers(); self.wfile.write(b'{"ok":true}'); return

        if path=="/api/logout":
            cookie=self.headers.get("Cookie","")
            for x in cookie.split("; "):
                if x.startswith("sid="): SESSIONS.discard(x[4:])
            self.send_json({"ok":True}); return

        if not self.logged():
            self.send_json({"error":"Нужен вход в админку"},401); return

        if path=="/api/products/save":
            products=data.get("products",[])
            write_json("products.json",products); self.send_json({"ok":True}); return

        if path=="/api/settings/save":
            write_json("settings.json",data); self.send_json({"ok":True}); return

        if path=="/api/password":
            if not data.get("password"): self.send_json({"error":"Пароль пустой"},400); return
            write_json("admin.json",{"password":data["password"]}); self.send_json({"ok":True}); return

        if path=="/api/orders/delete":
            orders=read_json("orders.json",[])
            oid=data.get("id")
            write_json("orders.json",[o for o in orders if o.get("id")!=oid]); self.send_json({"ok":True}); return

        if path=="/api/upload":
            # Local server accepts both the old JSON/base64 format and multipart uploads.
            ctype=self.headers.get("Content-Type","")
            if ctype.startswith("multipart/form-data"):
                n=int(self.headers.get("Content-Length","0"))
                raw_body=self.rfile.read(n)
                msg=BytesParser(policy=default).parsebytes((f"Content-Type: {ctype}\r\nMIME-Version: 1.0\r\n\r\n").encode()+raw_body)
                part=next((p for p in msg.iter_parts() if p.get_name()=="file"),None)
                if part is None: self.send_json({"error":"Файл не найден"},400); return
                filename=safe_name(part.get_filename() or "photo.jpg")
                raw_bytes=part.get_payload(decode=True) or b""
            else:
                raw=data.get("data","")
                if "," in raw: raw=raw.split(",",1)[1]
                filename=safe_name(data.get("filename","photo.jpg"))
                raw_bytes=base64.b64decode(raw)
            ext=Path(filename).suffix.lower()
            if ext not in {".jpg",".jpeg",".png",".webp"}: ext=".jpg"
            filename=Path(filename).stem[:60]+ext
            out=IMG/filename
            out.write_bytes(raw_bytes)
            self.send_json({"ok":True,"image":"images/"+filename}); return

        if path=="/api/order":
            orders=read_json("orders.json",[])
            data["id"]=secrets.token_hex(5)
            import datetime
            data["date"]=datetime.datetime.now().strftime("%d.%m.%Y %H:%M")
            orders.append(data); write_json("orders.json",orders)
            self.send_json({"ok":True,"id":data["id"]}); return

        self.send_json({"error":"Неизвестный запрос"},404)

if __name__=="__main__":
    print("="*55)
    print(" PARADISO ITALY — локальный магазин")
    print(" Сайт на ПК: http://127.0.0.1:8765/")
    print(" Для телефона в той же Wi-Fi: http://IP_ВАШЕГО_ПК:8765/")
    print(" Админ:  http://127.0.0.1:8765/admin.html")
    print(" Пароль: admin123")
    print("="*55)
    with socketserver.ThreadingTCPServer(("0.0.0.0",PORT),Handler) as httpd:
        httpd.serve_forever()
