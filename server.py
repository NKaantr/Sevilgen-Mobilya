# ==========================================================================
# SEVİLGEN MOBİLYA - VERİTABANI REST API SUNUCUSU (Python + SQLite)
# ==========================================================================

import http.server
import socketserver
import json
import sqlite3
import os
from urllib.parse import urlparse, parse_qs

PORT = 8080
DB_FILE = os.path.join(os.path.dirname(__file__), "sevilgen_mobilya.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Teklifler Tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS teklifler (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ad_soyad TEXT NOT NULL,
            telefon TEXT NOT NULL,
            eposta TEXT,
            mobilya_turu TEXT,
            malzeme_sinifi TEXT,
            boyut_olcu TEXT,
            hesaplanan_fiyat REAL DEFAULT 0.0,
            proje_detaylari TEXT,
            durum TEXT DEFAULT 'Yeni',
            tarih DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Analitik Tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hesaplama_analitik (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mobilya_turu TEXT,
            malzeme_sinifi TEXT,
            boyut_olcu TEXT,
            fiyat REAL,
            tarih DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Giriş Logları Tablosu
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS giris_loglari (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kullanici_adi TEXT NOT NULL,
            durum TEXT NOT NULL,
            ip_adresi TEXT NOT NULL,
            tarih DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Örnek Demo Verisi Ekleyelim
    cursor.execute("SELECT COUNT(*) FROM teklifler")
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
            INSERT INTO teklifler (ad_soyad, telefon, eposta, mobilya_turu, malzeme_sinifi, boyut_olcu, hesaplanan_fiyat, proje_detaylari, durum)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', [
            ('Ahmet Yılmaz', '0532 111 22 33', 'ahmet@example.com', 'Lüks Köşe Koltuk Takımı', 'Masif Ceviz & İthal İtalyan Kumaş', 'Geniş Salon / Dubleks Ölçü', 45500.0, 'Seyhan villamız için özel köşe takımı istiyoruz.', 'Yeni'),
            ('Mehmet Özkan', '0544 999 88 77', 'mehmet@example.com', 'Masif Ahşap Yemek Masası & Sandalye Seti', 'Özel İşçilikli Oymalı Masif Ahşap', 'Özel Villa / Malikane Ölçü', 78400.0, '12 kişilik ceviz masa takımı.', 'Arandı')
        ])
    
    cursor.execute("SELECT COUNT(*) FROM giris_loglari")
    if cursor.fetchone()[0] == 0:
        cursor.executemany('''
            INSERT INTO giris_loglari (kullanici_adi, durum, ip_adresi)
            VALUES (?, ?, ?)
        ''', [
            ('admin', 'BAŞARILI', '127.0.0.1'),
            ('hacker', 'HATALI GİRİŞ', '185.220.101.5')
        ])

    conn.commit()
    conn.close()

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def get_client_ip(self):
        # Client IP extraction
        forwarded = self.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return self.client_address[0]

    def do_GET(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        if path == '/api/admin/teklifler':
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM teklifler ORDER BY id DESC")
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'data': rows}, ensure_ascii=False).encode('utf-8'))

        elif path == '/api/admin/giris-loglari':
            conn = sqlite3.connect(DB_FILE)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM giris_loglari ORDER BY id DESC")
            rows = [dict(row) for row in cursor.fetchall()]
            conn.close()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'data': rows}, ensure_ascii=False).encode('utf-8'))
        else:
            super().do_GET()

    def do_POST(self):
        parsed_url = urlparse(self.path)
        path = parsed_url.path

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        if path == '/api/admin/log-giris':
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            ip_addr = payload.get('ip_adresi') or self.get_client_ip()
            cursor.execute('''
                INSERT INTO giris_loglari (kullanici_adi, durum, ip_adresi)
                VALUES (?, ?, ?)
            ''', (
                payload.get('kullanici_adi', 'Bilinmeyen'),
                payload.get('durum', 'HATALI GİRİŞ'),
                ip_addr
            ))
            conn.commit()
            conn.close()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True}).encode('utf-8'))

        elif path == '/api/teklif-gonder':
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO teklifler (ad_soyad, telefon, eposta, mobilya_turu, malzeme_sinifi, boyut_olcu, hesaplanan_fiyat, proje_detaylari)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                payload.get('ad_soyad', 'İsimsiz'),
                payload.get('telefon', '-'),
                payload.get('eposta', ''),
                payload.get('mobilya_turu', '-'),
                payload.get('malzeme_sinifi', '-'),
                payload.get('boyut_olcu', '-'),
                float(payload.get('hesaplanan_fiyat', 0)),
                payload.get('proje_detaylari', '')
            ))
            conn.commit()
            new_id = cursor.lastrowid
            conn.close()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({'success': True, 'id': new_id}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    init_db()
    os.chdir(os.path.dirname(__file__))
    print(f"==================================================")
    print(f"SEVİLGEN MOBİLYA VERİTABANI REST API BAŞLATILDI")
    print(f"Adres: http://localhost:{PORT}")
    print(f"==================================================")
    with socketserver.TCPServer(("", PORT), APIHandler) as httpd:
        httpd.serve_forever()
