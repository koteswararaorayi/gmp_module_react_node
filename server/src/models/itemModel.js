const { pool } = require("../config/database");

const ALLOWED_SORT = {
  item_code: "i.item_code",
  item_name: "i.item_name",
  category: "ic.category",
  created_date: "i.created_date",
};

async function getItems({
  companyId,
  search = "",
  categoryId,
  itemTypeId,
  supplierId,
  manufacturerId,
  isActive = 0,
  sort = "created_date",
  order = "DESC",
  limit = 20,
  offset = 0,
}) {
  const conditions = ["i.company_id = ?", "i.is_active = ?"];
  const baseParams = [companyId, isActive];

  if (search) {
    conditions.push("(i.item_code LIKE ? OR i.item_name LIKE ?)");
    baseParams.push(`%${search}%`, `%${search}%`);
  }
  if (categoryId) {
    conditions.push("i.item_category = ?");
    baseParams.push(String(categoryId));
  }
  if (itemTypeId) {
    conditions.push("i.item_type = ?");
    baseParams.push(String(itemTypeId));
  }
  if (supplierId) {
    conditions.push("i.supplier LIKE ?");
    baseParams.push(`%${supplierId}%`);
  }
  if (manufacturerId) {
    conditions.push("i.manufacturer LIKE ?");
    baseParams.push(`%${manufacturerId}%`);
  }

  const sortCol = ALLOWED_SORT[sort] || "i.created_date";
  const sortDir = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const where = conditions.join(" AND ");

  const listSql = `
    SELECT
      i.id, i.item_code, i.item_name, i.description,
      i.item_type, it.type AS item_type_name,
      i.item_category, ic.category AS category_name,
      i.uom, u.measurement AS uom_name,
      i.supplier AS supplier_name,
      i.manufacturer AS manufacturer_name,
      i.is_active, i.created_date, i.created_by, i.updated_date, i.updated_by
    FROM items i
    LEFT JOIN item_types it ON it.id = CAST(i.item_type AS UNSIGNED)
    LEFT JOIN items_categories ic ON ic.id = CAST(i.item_category AS UNSIGNED)
    LEFT JOIN unit_of_measurements u ON u.id = CAST(i.uom AS UNSIGNED)
    WHERE ${where}
    ORDER BY ${sortCol} ${sortDir}
    LIMIT ? OFFSET ?
  `;

  const countSql = `
    SELECT COUNT(*) AS total
    FROM items i
    WHERE ${where}
  `;

  const [rows] = await pool.execute(listSql, [...baseParams, limit, offset]);
  const [countRows] = await pool.execute(countSql, baseParams);

  return {
    rows,
    total: Number(countRows[0]?.total || 0),
  };
}

async function getById(id, companyId) {
  const [rows] = await pool.execute(
    `SELECT
       i.*,
       it.type AS item_type_name,
       ic.category AS category_name,
       u.measurement AS uom_code, u.measurement AS uom_name,
       i.supplier AS supplier_name,
       i.manufacturer AS manufacturer_name
     FROM items i
     LEFT JOIN item_types it ON it.id = CAST(i.item_type AS UNSIGNED)
     LEFT JOIN items_categories ic ON ic.id = CAST(i.item_category AS UNSIGNED)
     LEFT JOIN unit_of_measurements u ON u.id = CAST(i.uom AS UNSIGNED)
     WHERE i.id = ? AND i.company_id = ? LIMIT 1`,
    [id, companyId],
  );
  return rows[0] || null;
}

async function itemCodeExists(itemCode, companyId, excludeId = null) {
  let sql = `SELECT id FROM items WHERE LOWER(item_code) = LOWER(?) AND company_id = ?`;
  const params = [itemCode, companyId];
  if (excludeId) {
    sql += ` AND id <> ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

async function create({
  companyId,
  itemCode,
  itemName,
  itemType,
  itemCategory,
  uom,
  supplier,
  manufacturer,
  description,
  createdBy,
}) {
  const [result] = await pool.execute(
    `INSERT INTO items
       (company_id, item_code, item_name, item_type, item_category, uom,
        supplier, manufacturer, description, is_active, created_date, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), ?)`,
    [
      companyId,
      itemCode,
      itemName,
      itemType || null,
      itemCategory || null,
      uom || null,
      supplier || null,
      manufacturer || null,
      description || null,
      createdBy,
    ],
  );
  return result.insertId;
}

async function update(
  id,
  companyId,
  {
    itemName,
    itemType,
    itemCategory,
    uom,
    supplier,
    manufacturer,
    description,
    updatedBy,
  },
) {
  const [result] = await pool.execute(
    `UPDATE items
     SET item_name = ?, item_type = ?, item_category = ?, uom = ?,
         supplier = ?, manufacturer = ?, description = ?,
         updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [
      itemName,
      itemType || null,
      itemCategory || null,
      uom || null,
      supplier || null,
      manufacturer || null,
      description || null,
      updatedBy,
      id,
      companyId,
    ],
  );
  return result.affectedRows;
}

async function softDelete(id, companyId, updatedBy) {
  const [result] = await pool.execute(
    `UPDATE items
     SET is_active = 1, updated_date = NOW(), updated_by = ?
     WHERE id = ? AND company_id = ?`,
    [updatedBy, id, companyId],
  );
  return result.affectedRows;
}

async function getForExport({
  companyId,
  search = "",
  categoryId,
  itemTypeId,
  supplierId,
  manufacturerId,
}) {
  const conditions = ["i.company_id = ?", "i.is_active = 0"];
  const params = [companyId];

  if (search) {
    conditions.push("(i.item_code LIKE ? OR i.item_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (categoryId) {
    conditions.push("i.item_category = ?");
    params.push(String(categoryId));
  }
  if (itemTypeId) {
    conditions.push("i.item_type = ?");
    params.push(String(itemTypeId));
  }
  if (supplierId) {
    conditions.push("i.supplier LIKE ?");
    params.push(`%${supplierId}%`);
  }
  if (manufacturerId) {
    conditions.push("i.manufacturer LIKE ?");
    params.push(`%${manufacturerId}%`);
  }

  const [rows] = await pool.execute(
    `SELECT
       i.item_code, i.item_name,
       it.type AS item_type_name, ic.category AS category_name,
       u.measurement AS uom_name,
       i.supplier AS supplier_name, i.manufacturer AS manufacturer_name,
       i.created_date
     FROM items i
     LEFT JOIN item_types it ON it.id = CAST(i.item_type AS UNSIGNED)
     LEFT JOIN items_categories ic ON ic.id = CAST(i.item_category AS UNSIGNED)
     LEFT JOIN unit_of_measurements u ON u.id = CAST(i.uom AS UNSIGNED)
     WHERE ${conditions.join(" AND ")}
     ORDER BY i.created_date DESC`,
    params,
  );
  return rows;
}

module.exports = {
  getItems,
  getById,
  itemCodeExists,
  create,
  update,
  softDelete,
  getForExport,
};
