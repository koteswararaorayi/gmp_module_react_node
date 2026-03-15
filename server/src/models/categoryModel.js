const { pool } = require("../config/database");

async function getAll(companyId) {
  const [rows] = await pool.execute(
    `SELECT id, category AS category_name, description, is_active, created_date
     FROM items_categories
     WHERE company_id = ? AND is_active = 0
    ORDER BY category ASC`,
    [companyId],
  );
  return rows;
}

async function getById(id, companyId) {
  const [rows] = await pool.execute(
    `SELECT id, category AS category_name, description, is_active, created_date, updated_date
     FROM items_categories
     WHERE id = ? AND company_id = ? LIMIT 1`,
    [id, companyId],
  );
  return rows[0] || null;
}

async function nameExists(name, companyId, excludeId = null) {
  let sql = `SELECT id FROM items_categories WHERE LOWER(category) = LOWER(?) AND company_id = ? AND is_active = 0`;
  const params = [name, companyId];
  if (excludeId) {
    sql += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

async function create({ companyId, categoryName, description, createdBy }) {
  const [result] = await pool.execute(
    `INSERT INTO items_categories (company_id, category, description, is_active, created_date, created_by)
     VALUES (?, ?, ?, 0, NOW(), ?)`,
    [companyId, categoryName, description || null, createdBy],
  );
  return result.insertId;
}

async function update(id, companyId, { categoryName, description, updatedBy }) {
  const [result] = await pool.execute(
    `UPDATE items_categories
     SET category = ?, description = ?, updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [categoryName, description || null, updatedBy, id, companyId],
  );
  return result.affectedRows;
}

async function softDelete(id, companyId, updatedBy) {
  const [result] = await pool.execute(
    `UPDATE items_categories
     SET is_active = 1, updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [updatedBy, id, companyId],
  );
  return result.affectedRows;
}

module.exports = { getAll, getById, nameExists, create, update, softDelete };
