-- AI-GENERATED
-- Seed: Dữ liệu mẫu cho môi trường dev/local
-- ⚠️  CHỈ DÙNG CHO DEV/LOCAL — không dùng trên production

-- Thông báo mẫu (user_id là placeholder UUID)
INSERT INTO notifications (user_id, title, content, type, tenant_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Chao mung den he thong', 'Ban da dang nhap thanh cong vao Student Management Portal.', 'success', 'dev-tenant'),
  ('00000000-0000-0000-0000-000000000001', 'Lich hoc thay doi', 'Lop CS2026A da thay doi lich hoc sang thu 3.', 'info', 'dev-tenant')
ON CONFLICT DO NOTHING;
