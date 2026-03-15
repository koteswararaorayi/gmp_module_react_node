const { pool } = require("../config/database");

async function getWarehouses({ companyId, search = "", isActive = 0, limit = 20, offset = 0 }) {
  const conditions = ["w.company_id = ?", "w.is_active = ?"];
  const params = [companyId, isActive];

  if (search) {
    conditions.push("(w.warehouse_name LIKE ? OR w.warehouse_type LIKE ? OR w.address LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const where = conditions.join(" AND ");

  const listSql = `
    SELECT
      w.id,
      w.warehouse_name,
      w.warehouse_type,
      w.address,
      w.manager_id,
      au.username AS manager_name,
      w.capacity,
      w.is_active,
      w.created_date,
      COUNT(l.id) AS location_count
    FROM warehouses w
    LEFT JOIN locations l ON l.warehouse_id = w.id AND l.is_active = 0
    LEFT JOIN application_users au ON au.id = w.manager_id
    WHERE ${where}
    GROUP BY w.id
    ORDER BY w.created_date DESC
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM warehouses w
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
       w.id,
       w.company_id,
       w.warehouse_name,
       w.warehouse_type,
       w.address,
       w.manager_id,
       au.username AS manager_name,
       w.capacity,
       w.is_active,
       w.created_date,
       w.created_by,
       w.updated_date,
       w.updated_by,
       COUNT(l.id) AS location_count
     FROM warehouses w
     LEFT JOIN locations l ON l.warehouse_id = w.id AND l.is_active = 0
     LEFT JOIN application_users au ON au.id = w.manager_id
     WHERE w.id = ? AND w.company_id = ?
     GROUP BY w.id
     LIMIT 1`,
    [id, companyId],
  );

  return rows[0] || null;
}

async function nameExists(name, companyId, excludeId = null) {
  let sql = `
    SELECT id
    FROM warehouses
    WHERE LOWER(warehouse_name) = LOWER(?)
      AND company_id = ?
      AND is_active = 0
  `;
  const params = [name, companyId];

  if (excludeId) {
    sql += " AND id <> ?";
    params.push(excludeId);
  }

  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

async function create({ companyId, warehouseName, warehouseType, address, managerId, capacity, createdBy }) {
  const [result] = await pool.execute(
    `INSERT INTO warehouses
      (company_id, warehouse_name, warehouse_type, address, manager_id, capacity,
       warehouse, short_code, description,
       is_active, current_status, status_date, created_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NOW(), NOW(), ?)`,
    [
      companyId,
      warehouseName,
      warehouseType || null,
      address || null,
      managerId || null,
      capacity || 0,
      warehouseName,
      warehouseType || null,
      address || null,
      createdBy,
    ],
  );

  return result.insertId;
}

async function update(id, companyId, { warehouseName, warehouseType, address, managerId, capacity, updatedBy }) {
  const [result] = await pool.execute(
    `UPDATE warehouses
     SET warehouse_name = ?, warehouse_type = ?, address = ?, manager_id = ?, capacity = ?,
         warehouse = ?, short_code = ?, description = ?,
         updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [
      warehouseName,
      warehouseType || null,
      address || null,
      managerId || null,
      capacity || 0,
      warehouseName,
      warehouseType || null,
      address || null,
      updatedBy,
      id,
      companyId,
    ],
  );

  return result.affectedRows;
}

async function softDelete(id, companyId, updatedBy) {
  const [result] = await pool.execute(
    `UPDATE warehouses
     SET is_active = 1, updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [updatedBy, id, companyId],
  );
  return result.affectedRows;
}

async function getLocationsByWarehouse(id, companyId) {
  const [rows] = await pool.execute(
    `SELECT
       id,
       warehouse_id,
       location_code,
       location_name,
       \`row\`,
       \`column\`,
       shelf,
       zone,
       capacity,
       is_active,
       created_date,
       updated_date
     FROM locations
     WHERE warehouse_id = ? AND company_id = ? AND is_active = 0
     ORDER BY location_name ASC`,
    [id, companyId],
  );

  return rows;
}

async function getCapacityStatus(id, companyId) {
  const [whRows] = await pool.execute(
    `SELECT id, warehouse_name, capacity
     FROM warehouses
     WHERE id = ? AND company_id = ? AND is_active = 0
     LIMIT 1`,
    [id, companyId],
  );

  const warehouse = whRows[0] || null;
  if (!warehouse) return null;

  const [locRows] = await pool.execute(
    `SELECT
       COUNT(*) AS location_count,
       COALESCE(SUM(capacity), 0) AS allocated_capacity
     FROM locations
     WHERE warehouse_id = ? AND company_id = ? AND is_active = 0`,
    [id, companyId],
  );

  const allocated = Number(locRows[0]?.allocated_capacity || 0);
  const total = Number(warehouse.capacity || 0);
  const available = Math.max(total - allocated, 0);
  const utilization = total > 0 ? Number(((allocated / total) * 100).toFixed(2)) : 0;

  return {
    warehouse_id: warehouse.id,
    warehouse_name: warehouse.warehouse_name,
    total_capacity: total,
    allocated_capacity: allocated,
    available_capacity: available,
    utilization_percent: utilization,
    location_count: Number(locRows[0]?.location_count || 0),
  };
}

module.exports = {
  getWarehouses,
  getById,
  nameExists,
  create,
  update,
  softDelete,
  getLocationsByWarehouse,
  getCapacityStatus,
};
