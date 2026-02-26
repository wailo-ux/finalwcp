CREATE DATABASE db_wcp4;
GO

USE db_wcp4;
GO


CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    security_question VARCHAR(255),
    security_answer VARCHAR(255),
    role VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending'
);
GO


INSERT INTO users (username, password, full_name, role, status) 
VALUES ('shetopsolid', 'turanggaA1', 'Super Admin HSE', 'spv', 'active');
GO


CREATE TABLE rain_logs (
    id INT PRIMARY KEY IDENTITY(1,1),
    waktu_mulai VARCHAR(50),
    waktu_selesai VARCHAR(50),
    durasi_menit INT,
    total_hujan FLOAT
);
GO

PRINT 'Database db_wcp4 dan seluruh tabel berhasil dibuat!';