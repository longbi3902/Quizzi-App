-- ============================================
-- RESET DATABASE SCRIPT
-- Script này xóa và tạo lại database từ đầu
-- CHỈ SỬ DỤNG CHO MÔI TRƯỜNG DEVELOPMENT!
-- ============================================

-- Xóa database nếu tồn tại
DROP DATABASE IF EXISTS quizziapp;

-- Tạo lại database
CREATE DATABASE quizziapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE quizziapp;

-- Chạy schema.sql
-- (Nội dung schema.sql sẽ được thực thi ở đây hoặc chạy riêng)

