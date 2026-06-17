import { getDb } from './db';

// ─────────────────────────────────────────────
//  CREATE — Thêm liên hệ mới
//  Dùng Transaction để đảm bảo atomicity
// ─────────────────────────────────────────────
export const createContact = async (name, phone, email = '') => {
  const db = await getDb();
  let insertedId = null;

  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
      [name.trim(), phone.trim(), email.trim()]
    );
    insertedId = result.lastInsertRowId;
  });

  return insertedId;
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
//  UPDATE — Cập nhật thông tin liên hệ
//  Dùng Transaction để đảm bảo tính toàn vẹn
// ─────────────────────────────────────────────
export const updateContact = async (id, name, phone, email = '') => {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE contacts SET name = ?, phone = ?, email = ? WHERE id = ?',
      [name.trim(), phone.trim(), email.trim(), id]
    );
  });
};

// ─────────────────────────────────────────────
//  DELETE — Xóa liên hệ theo ID
//  Dùng Transaction để đảm bảo atomicity
// ─────────────────────────────────────────────
export const deleteContact = async (id) => {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM contacts WHERE id = ?', [id]);
  });
};

// ─────────────────────────────────────────────
//  BULK INSERT — Demo Transaction gộp nhiều lệnh
//  1 Transaction > N lệnh riêng lẻ (nhanh hơn nhiều)
// ─────────────────────────────────────────────
export const bulkInsertContacts = async (contacts) => {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    for (const { name, phone, email } of contacts) {
      await db.runAsync(
        'INSERT INTO contacts (name, phone, email) VALUES (?, ?, ?)',
        [name, phone, email || '']
      );
    }
  });
};

// ─────────────────────────────────────────────
//  COUNT — Đếm tổng số liên hệ
// ─────────────────────────────────────────────
export const countContacts = async () => {
  const db = await getDb();
  const row = await db.getFirstAsync('SELECT COUNT(*) as total FROM contacts');
  return row?.total ?? 0;
};
