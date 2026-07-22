/* ==========================================================================
   SEVİLGEN MOBİLYA - EXPRESS & SQLITE / MYSQL VERİTABANI API SUNUCUSU
   ========================================================================== */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DB_PATH = path.join(__dirname, 'sevilgen_mobilya.db');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// SQLite Veritabanı Bağlantısı
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err.message);
  } else {
    console.log('Sevilgen Mobilya SQLite Veritabanı Başarıyla Bağlandı.');
    initDatabase();
  }
});

function initDatabase() {
  db.run(`
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
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS hesaplama_analitik (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mobilya_turu TEXT,
      malzeme_sinifi TEXT,
      boyut_olcu TEXT,
      fiyat REAL,
      tarih DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS giris_loglari (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kullanici_adi TEXT NOT NULL,
      durum TEXT NOT NULL,
      ip_adresi TEXT NOT NULL,
      tarih DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// REST API Endpoints
app.post('/api/admin/log-giris', (req, res) => {
  const { kullanici_adi, durum, ip_adresi } = req.body;
  const clientIp = ip_adresi || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  db.run(`
    INSERT INTO giris_loglari (kullanici_adi, durum, ip_adresi)
    VALUES (?, ?, ?)
  `, [kullanici_adi || 'Bilinmeyen', durum || 'HATALI GİRİŞ', clientIp], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.get('/api/admin/giris-loglari', (req, res) => {
  db.all(`SELECT * FROM giris_loglari ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, data: rows });
  });
});

app.post('/api/teklif-gonder', (req, res) => {
  const { ad_soyad, telefon, eposta, mobilya_turu, malzeme_sinifi, boyut_olcu, hesaplanan_fiyat, proje_detaylari } = req.body;

  const query = `
    INSERT INTO teklifler (ad_soyad, telefon, eposta, mobilya_turu, malzeme_sinifi, boyut_olcu, hesaplanan_fiyat, proje_detaylari)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    ad_soyad || 'İsimsiz',
    telefon || '-',
    eposta || '',
    mobilya_turu || '-',
    malzeme_sinifi || '-',
    boyut_olcu || '-',
    parseFloat(hesaplanan_fiyat) || 0.0,
    proje_detaylari || ''
  ], function (err) {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, id: this.lastID, message: 'Teklif veritabanına kaydedildi' });
  });
});

app.post('/api/fiyat-kaydet', (req, res) => {
  const { mobilya_turu, malzeme_sinifi, boyut_olcu, fiyat } = req.body;

  const query = `
    INSERT INTO hesaplama_analitik (mobilya_turu, malzeme_sinifi, boyut_olcu, fiyat)
    VALUES (?, ?, ?, ?)
  `;

  db.run(query, [
    mobilya_turu || '-',
    malzeme_sinifi || '-',
    boyut_olcu || '-',
    parseFloat(fiyat) || 0.0
  ], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.get('/api/admin/teklifler', (req, res) => {
  db.all(`SELECT * FROM teklifler ORDER BY id DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

app.patch('/api/admin/teklif/:id/durum', (req, res) => {
  const { id } = req.params;
  const { durum } = req.body;

  db.run(`UPDATE teklifler SET durum = ? WHERE id = ?`, [durum, id], function (err) {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, updated: this.changes });
  });
});

app.delete('/api/admin/teklif/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM teklifler WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true, deleted: this.changes });
  });
});

app.listen(PORT, () => {
  console.log(`Sevilgen Mobilya Express API Sunucusu http://localhost:${PORT} üzerinde çalışıyor.`);
});
