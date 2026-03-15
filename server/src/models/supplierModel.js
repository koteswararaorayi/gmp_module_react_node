const { pool } = require("../config/database");

async function getAll(companyId) {
  const [rows] = await pool.execute(
    `SELECT id, supplier_name, address, phone_number AS contact, email_id AS email, is_active, created_date
     FROM suppliers
     WHERE company_id = ? AND is_active = 0
     ORDER BY supplier_name ASC`,
    [companyId],
  );
  return rows;
}

async function getById(id, companyId) {
  const [rows] = await pool.execute(
    `SELECT id, supplier_name, address, phone_number AS contact, email_id AS email, is_active, created_date, updated_date
     FROM suppliers
     WHERE id = ? AND company_id = ? LIMIT 1`,
    [id, companyId],
  );
  return rows[0] || null;
}

async function nameExists(name, companyId, excludeId = null) {
  let sql = `SELECT id FROM suppliers WHERE LOWER(supplier_name) = LOWER(?) AND company_id = ? AND is_active = 0`;
  const params = [name, companyId];
  if (excludeId) {
    sql += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

async function create({ companyId, supplierName, address, contact, email, createdBy }) {
  const [result] = await pool.execute(
    `INSERT INTO suppliers (company_id, supplier_name, address, phone_number, email_id, is_active, current_status, status_date, created_by)
     VALUES (?, ?, ?, ?, ?, 0, 0, CURDATE(), ?)`,
    [companyId, supplierName, address || null, contact || null, email || null, createdBy],
  );
  return result.insertId;
}

async function update(id, companyId, { supplierName, address, contact, email, updatedBy }) {
  const [result] = await pool.execute(
    `UPDATE suppliers
     SET supplier_name = ?, address = ?, phone_number = ?, email_id = ?, updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [supplierName, address || null, contact || null, email || null, updatedBy, id, companyId],
  );
  return result.affectedRows;
}

async function softDelete(id, companyId, updatedBy) {
  const [result] = await pool.execute(
    `UPDATE suppliers
     SET is_active = 1, updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [updatedBy, id, companyId],
  );
  return result.affectedRows;
}

module.exports = { getAll, getById, nameExists, create, update, softDelete };
