const { pool } = require("../config/database");

async function getLocations({ companyId, warehouseId, search = "", limit = 20, offset = 0 }) {
  const conditions = [
    "l.company_id = ?",
    "l.warehouse_id = ?",
    "l.is_active = 0",
  ];
  const params = [companyId, warehouseId];

  if (search) {
    conditions.push("(l.location_code LIKE ? OR l.location_name LIKE ? OR l.zone LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = conditions.join(" AND ");

  const listSql = `
    SELECT
      l.id,
      l.company_id,
      l.warehouse_id,
      w.warehouse_name,
      l.location_code,
      l.location_name,
      l.\`row\`,
      l.\`column\`,
      l.shelf,
      l.zone,
      l.capacity,
      l.is_active,
      l.created_date,
      l.created_by,
      l.updated_date,
      l.updated_by
    FROM locations l
    LEFT JOIN warehouses w ON w.id = l.warehouse_id
    WHERE ${where}
    ORDER BY l.created_date DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM locations l
    WHERE ${where}
  `;

  const [rows] = await pool.execute(listSql, [...params, limit, offset]);
  const [countRows] = await pool.execute(countSql, params);

  return {
    rows,
    total: Number(countRows[0]?.total || 0),
  };
}

async function getById(id, companyId) {
  const [rows] = await pool.execute(
    `SELECT
       l.id,
       l.company_id,
       l.warehouse_id,
       w.warehouse_name,
       l.location_code,
       l.location_name,
       l.\`row\`,
       l.\`column\`,
       l.shelf,
       l.zone,
       l.capacity,
       l.is_active,
       l.created_date,
       l.created_by,
       l.updated_date,
       l.updated_by
     FROM locations l
     LEFT JOIN warehouses w ON w.id = l.warehouse_id
     WHERE l.id = ? AND l.company_id = ?
     LIMIT 1`,
    [id, companyId],
  );
  return rows[0] || null;
}

async function codeExists(warehouseId, locationCode, companyId, excludeId = null) {
  let sql = `
    SELECT id
    FROM locations
    WHERE warehouse_id = ?
      AND LOWER(location_code) = LOWER(?)
      AND company_id = ?
      AND is_active = 0
  `;

  const params = [warehouseId, locationCode, companyId];

  if (excludeId) {
    sql += " AND id <> ?";
    params.push(excludeId);
  }

  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

async function create({
  companyId,
  warehouseId,
  locationCode,
  locationName,
  row,
  column,
  shelf,
  zone,
  capacity,
  createdBy,
}) {
  const [result] = await pool.execute(
    `INSERT INTO locations
      (company_id, warehouse_id, location_code, location_name, \`row\`, \`column\`, shelf, zone, capacity,
       location, description,
       is_active, current_status, status_date, created_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW(), NOW(), ?)`,
    [
      companyId,
      warehouseId,
      locationCode,
      locationName,
      row || null,
      column || null,
      shelf || null,
      zone || null,
      capacity || 0,
      locationName,
      zone || null,
      createdBy,
    ],
  );

  return result.insertId;
}

async function update(id, companyId, {
  warehouseId,
  locationCode,
  locationName,
  row,
  column,
  shelf,
  zone,
  capacity,
  updatedBy,
}) {
  const [result] = await pool.execute(
    `UPDATE locations
     SET warehouse_id = ?, location_code = ?, location_name = ?,
         \`row\` = ?, \`column\` = ?, shelf = ?, zone = ?, capacity = ?,
         location = ?, description = ?,
         updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [
      warehouseId,
      locationCode,
      locationName,
      row || null,
      column || null,
      shelf || null,
      zone || null,
      capacity || 0,
      locationName,
      zone || null,
      updatedBy,
      id,
      companyId,
    ],
  );

  return result.affectedRows;
}

async function softDelete(id, companyId, updatedBy) {
  const [result] = await pool.execute(
    `UPDATE locations
     SET is_active = 1, updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [updatedBy, id, companyId],
  );
  return result.affectedRows;
}

module.exports = {
  getLocations,
  getById,
  codeExists,
  create,
  update,
  softDelete,
};
