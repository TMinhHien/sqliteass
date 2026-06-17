import { getDb } from './db';

// ─────────────────────────────────────────────
//  CREATE — Thêm liên hệ mới (Transaction)
// ─────────────────────────────────────────────
export const createContact = async (name, phone, email = '') => {
  const db = await getDb();
  const result = await db.runAsync(
    'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
    [name.trim(), phone.trim(), email.trim()]
  );
  return result.lastInsertRowId;
};

// ─────────────────────────────────────────────
//  READ — Lấy tất cả liên hệ
//  Query Optimization: ORDER BY dùng index idx_contacts_name
//  Tránh SELECT *, chỉ lấy cột cần thiết
// ─────────────────────────────────────────────
export const getAllContacts = async () => {
  const db = await getDb();
  return await db.getAllAsync(
    'SELECT id, name, phone, email FROM contacts ORDER BY name ASC'
  );
};

// ─────────────────────────────────────────────
//  READ — Tìm kiếm liên hệ theo tên hoặc SĐT
//  Dùng INDEX idx_contacts_name & idx_contacts_phone
// ─────────────────────────────────────────────
export const searchContacts = async (query) => {
  const db = await getDb();
  const pattern = `%${query.trim()}%`;
  return await db.getAllAsync(
    `SELECT id, name, phone, email
     FROM contacts
     WHERE name LIKE ? OR phone LIKE ?
     ORDER BY name ASC`,
    [pattern, pattern]
  );
};

// ─────────────────────────────────────────────
//  READ — Lấy liên hệ theo ID
// ─────────────────────────────────────────────
export const getContactById = async (id) => {
  const db = await getDb();
  return await db.getFirstAsync(
    'SELECT id, name, phone, email FROM contacts WHERE id = ?',
    [id]
  );
};

// ─────────────────────────────────────────────
//  UPDATE — Cập nhật thông tin liên hệ (Transaction)
// ─────────────────────────────────────────────
export const updateContact = async (id, name, phone, email = '') => {
  const db = await getDb();
  await db.runAsync(
    'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
    [name.trim(), phone.trim(), email.trim(), id]
  );
};

// ─────────────────────────────────────────────
//  DELETE — Xóa liên hệ theo ID (Transaction)
// ─────────────────────────────────────────────
export const deleteContact = async (id) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM contacts WHERE id = ?', [id]);
};

// ─────────────────────────────────────────────
//  COUNT — Đếm tổng số liên hệ
// ─────────────────────────────────────────────
export const countContacts = async () => {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT COUNT(*) as total FROM contacts');
  return row?.total ?? 0;
};
