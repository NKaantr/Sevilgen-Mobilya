-- ==========================================================================
-- SEVİLGEN MOBİLYA - MYSQL & SQL SERVER VERİTABANI OLUŞTURMA SCRIPT'LERİ
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. MYSQL VERİTABANI & TABLO ŞEMASI
-- --------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS sevilgen_mobilya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sevilgen_mobilya;

-- Formlar & Müşteri Teklif Talepleri Tablosu
CREATE TABLE IF NOT EXISTS teklifler (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ad_soyad VARCHAR(150) NOT NULL,
    telefon VARCHAR(50) NOT NULL,
    eposta VARCHAR(150),
    mobilya_turu VARCHAR(150),
    malzeme_sinifi VARCHAR(150),
    boyut_olcu VARCHAR(100),
    hesaplanan_fiyat DECIMAL(10,2) DEFAULT 0.00,
    proje_detaylari TEXT,
    durum VARCHAR(50) DEFAULT 'Yeni',
    tarih DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ölçü & Fiyat Analitiği Tablosu
CREATE TABLE IF NOT EXISTS hesaplama_analitik (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mobilya_turu VARCHAR(150),
    malzeme_sinifi VARCHAR(150),
    boyut_olcu VARCHAR(100),
    fiyat DECIMAL(10,2),
    tarih DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Güvenlik & Giriş Logları Tablosu (IP Adresi & Hatalı Girişler)
CREATE TABLE IF NOT EXISTS giris_loglari (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kullanici_adi VARCHAR(100) NOT NULL,
    durum VARCHAR(50) NOT NULL, -- 'BAŞARILI' veya 'HATALI GİRİŞ'
    ip_adresi VARCHAR(100) NOT NULL,
    tarih DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Örnek Demo Verileri (MySQL)
INSERT INTO teklifler (ad_soyad, telefon, eposta, mobilya_turu, malzeme_sinifi, boyut_olcu, hesaplanan_fiyat, proje_detaylari, durum) VALUES
('Ahmet Yılmaz', '0532 111 22 33', 'ahmet@example.com', 'Lüks Köşe Koltuk Takımı', 'Masif Ceviz & İthal İtalyan Kumaş', 'Geniş Salon / Dubleks Ölçü', 45500.00, 'Seyhan villamız için özel köşe takımı istiyoruz.', 'Yeni'),
('Mehmet Özkan', '0544 999 88 77', 'mehmet@example.com', 'Masif Ahşap Yemek Masası & Sandalye Seti', 'Özel İşçilikli Oymalı Masif Ahşap', 'Özel Villa / Malikane Ölçü', 78400.00, '12 kişilik ceviz masa takımı.', 'Arandı');

INSERT INTO giris_loglari (kullanici_adi, durum, ip_adresi) VALUES
('admin', 'BAŞARILI', '127.0.0.1'),
('hacker', 'HATALI GİRİŞ', '185.220.101.5'),
('root', 'HATALI GİRİŞ', '194.26.29.112');


-- --------------------------------------------------------------------------
-- 2. MICROSOFT SQL SERVER (T-SQL) VERİTABANI & TABLO ŞEMASI
-- --------------------------------------------------------------------------
/*
CREATE DATABASE SevilgenMobilyaDB;
GO

USE SevilgenMobilyaDB;
GO

CREATE TABLE Teklifler (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    AdSoyad NVARCHAR(150) NOT NULL,
    Telefon NVARCHAR(50) NOT NULL,
    Eposta NVARCHAR(150),
    MobilyaTuru NVARCHAR(150),
    MalzemeSinifi NVARCHAR(150),
    BoyutOlcu NVARCHAR(100),
    HesaplananFiyat DECIMAL(10,2) DEFAULT 0.00,
    ProjeDetaylari NVARCHAR(MAX),
    Durum NVARCHAR(50) DEFAULT N'Yeni',
    Tarih DATETIME DEFAULT GETDATE()
);

CREATE TABLE GirisLoglari (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    KullaniciAdi NVARCHAR(100) NOT NULL,
    Durum NVARCHAR(50) NOT NULL, -- N'BAŞARILI' veya N'HATALI GİRİŞ'
    IpAdresi NVARCHAR(100) NOT NULL,
    Tarih DATETIME DEFAULT GETDATE()
);
GO
*/
