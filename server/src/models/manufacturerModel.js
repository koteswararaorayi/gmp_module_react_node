const { pool } = require("../config/database");

async function getAll(companyId) {
  const [rows] = await pool.execute(
    `SELECT id, manufacturer AS manufacturer_name, description AS address, is_active, created_date
     FROM manufacturer
     WHERE company_id = ? AND is_active = 1
     ORDER BY manufacturer ASC`,
    [companyId],
  );
  return rows;
}

async function getById(id, companyId) {
  const [rows] = await pool.execute(
    `SELECT id, manufacturer AS manufacturer_name, description AS address, is_active, created_date, updated_date
     FROM manufacturer
     WHERE id = ? AND company_id = ? LIMIT 1`,
    [id, companyId],
  );
  return rows[0] || null;
}

async function nameExists(name, companyId, excludeId = null) {
  let sql = `SELECT id FROM manufacturer WHERE LOWER(manufacturer) = LOWER(?) AND company_id = ? AND is_active = 1`;
  const params = [name, companyId];
  if (excludeId) {
    sql += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

async function create({ companyId, manufacturerName, address, contact, createdBy }) {
  const [result] = await pool.execute(
    `INSERT INTO manufacturer (company_id, manufacturer, description, is_active, created_date, created_by)
     VALUES (?, ?, ?, 1, NOW(), ?)`,
    [companyId, manufacturerName, address || null, createdBy],
  );
  return result.insertId;
}

async function update(id, companyId, { manufacturerName, address, contact, updatedBy }) {
  const [result] = await pool.execute(
    `UPDATE manufacturer
     SET manufacturer = ?, description = ?, updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [manufacturerName, address || null, updatedBy, id, companyId],
  );
  return result.affectedRows;
}

async function softDelete(id, companyId, updatedBy) {
  const [result] = await pool.execute(
    `UPDATE manufacturer
     SET is_active = 0, updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [updatedBy, id, companyId],
  );
  return result.affectedRows;
}

module.exports = { getAll, getById, nameExists, create, update, softDelete };
