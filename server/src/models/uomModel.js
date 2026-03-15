const { pool } = require("../config/database");

async function getAll(companyId) {
  const [rows] = await pool.execute(
    `SELECT id, measurement AS uom_code, description AS uom_name, is_active
     FROM unit_of_measurements
     WHERE company_id = ? AND is_active = 0
     ORDER BY measurement ASC`,
    [companyId],
  );
  return rows;
}

async function getById(id, companyId) {
  const [rows] = await pool.execute(
    `SELECT id, measurement AS uom_code, description AS uom_name, is_active
     FROM unit_of_measurements
     WHERE id = ? AND company_id = ? LIMIT 1`,
    [id, companyId],
  );
  return rows[0] || null;
}

async function codeExists(uomCode, companyId, excludeId = null) {
  let sql = `SELECT id FROM unit_of_measurements WHERE LOWER(measurement) = LOWER(?) AND company_id = ?`;
  const params = [uomCode, companyId];
  if (excludeId) {
    sql += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

async function create({ companyId, uomCode, uomName }) {
  const [result] = await pool.execute(
    `INSERT INTO unit_of_measurements (company_id, measurement, description, is_active)
     VALUES (?, ?, ?, 0)`,
    [companyId, uomCode, uomName],
  );
  return result.insertId;
}

async function update(id, companyId, { uomCode, uomName }) {
  const [result] = await pool.execute(
    `UPDATE unit_of_measurements SET measurement = ?, description = ? WHERE id = ? AND company_id = ?`,
    [uomCode, uomName, id, companyId],
  );
  return result.affectedRows;
}

async function softDelete(id, companyId) {
  const [result] = await pool.execute(
    `UPDATE unit_of_measurements SET is_active = 1 WHERE id = ? AND company_id = ?`,
    [id, companyId],
  );
  return result.affectedRows;
}

module.exports = { getAll, getById, codeExists, create, update, softDelete };
