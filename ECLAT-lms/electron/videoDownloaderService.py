import os
import sys
import json
import re
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

PORT = 5179

def get_desktop_dir():
    user_profile = os.environ.get('USERPROFILE') or os.path.expanduser('~')
    desktop = os.path.join(user_profile, 'Desktop', 'Eclat_Tutor_Courses')
    os.makedirs(desktop, exist_ok=True)
    return desktop

def sanitize_filename(name):
    clean = re.sub(r'[^\w\s\.-]', '_', name).strip()
    return clean[:80] or 'Eclat_Course_Video'

class TutorVideoHandler(BaseHTTPRequestHandler):
    def _set_cors(self, status=200):
        self.send_response(status)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors(200)

    def do_GET(self):
        if self.path == '/status':
            self._set_cors(200)
            desktop = get_desktop_dir()
            files = []
            if os.path.exists(desktop):
                for f in os.listdir(desktop):
                    fp = os.path.join(desktop, f)
                    if os.path.isfile(fp):
                        files.append({
                            'filename': f,
                            'size': os.path.getsize(fp),
                            'path': fp
                        })
            self.wfile.write(json.dumps({'status': 'online', 'saveDirectory': desktop, 'files': files}).encode('utf-8'))
        else:
            self._set_cors(404)
            self.wfile.write(json.dumps({'error': 'Not found'}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/download':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            try:
                data = json.loads(body)
                video_url = data.get('videoUrl', '').strip()
                title = data.get('title', 'Tutor_Course_Video').strip()
                tutor_name = data.get('tutorName', 'Tutor').strip()

                if not video_url:
                    self._set_cors(400)
                    self.wfile.write(json.dumps({'error': 'Video URL required'}).encode('utf-8'))
                    return

                desktop = get_desktop_dir()
                clean_title = sanitize_filename(f"{tutor_name}_{title}")
                ext = '.mp4'
                if '.' in video_url.split('?')[0]:
                    possible_ext = os.path.splitext(video_url.split('?')[0])[1].lower()
                    if possible_ext in ['.mp4', '.m4v', '.webm', '.mov', '.avi', '.mkv']:
                        ext = possible_ext

                target_filename = f"{clean_title}{ext}"
                target_path = os.path.join(desktop, target_filename)

                # Background download thread
                def run_dl(url, dest):
                    try:
                        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
                        with urllib.request.urlopen(req, timeout=30) as response, open(dest, 'wb') as out_file:
                            while True:
                                chunk = response.read(64 * 1024)
                                if not chunk:
                                    break
                                out_file.write(chunk)
                        print(f"[SUCCESS] Downloaded to: {dest}")
                    except Exception as e:
                        print(f"[ERROR] Failed download: {e}")

                thread = threading.Thread(target=run_dl, args=(video_url, target_path), daemon=True)
                thread.start()

                self._set_cors(200)
                self.wfile.write(json.dumps({
                    'success': True,
                    'message': f"Video downloading directly to Desktop folder: {target_filename}",
                    'savedFilename': target_filename,
                    'savedPath': target_path,
                    'directory': desktop
                }).encode('utf-8'))

            except Exception as e:
                self._set_cors(500)
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self._set_cors(404)
            self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode('utf-8'))

def run_server():
    server = HTTPServer(('127.0.0.1', PORT), TutorVideoHandler)
    print(f"[Éclat Video Bridge] Listening on http://127.0.0.1:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass

if __name__ == '__main__':
    run_server()
