const { ERROR_CODES } = require("../config/constants");
const itemModel = require("../models/itemModel");
const categoryModel = require("../models/categoryModel");
const itemTypeModel = require("../models/itemTypeModel");
const uomModel = require("../models/uomModel");
const supplierModel = require("../models/supplierModel");
const manufacturerModel = require("../models/manufacturerModel");
const { sendSuccess, sendError } = require("../utils/responseHandler");

function buildFilters(query) {
  return {
    search: query.search?.trim() || "",
    categoryId: query.category_id ? Number(query.category_id) : null,
    itemTypeId: query.item_type_id ? Number(query.item_type_id) : null,
    supplierId: query.supplier_id ? Number(query.supplier_id) : null,
    manufacturerId: query.manufacturer_id ? Number(query.manufacturer_id) : null,
  };
}

async function getAll(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const page = Math.max(Number(req.query.page || 1), 1);
    const offset = (page - 1) * limit;

    const sortRaw = String(req.query.sort || "created_date:desc");
    const [sort, order] = sortRaw.split(":");

    const filters = buildFilters(req.query);
    const { rows, total } = await itemModel.getItems({
      companyId: req.user.companyId,
      ...filters,
      sort,
      order,
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Items retrieved",
      data: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      error: null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const item = await itemModel.getById(Number(req.params.id), req.user.companyId);
    if (!item) return sendError(res, "Item not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    return sendSuccess(res, item, "Item retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function exportItems(req, res, next) {
  try {
    const filters = buildFilters(req.query);
    const rows = await itemModel.getForExport({ companyId: req.user.companyId, ...filters });

    const header = "item_code,item_name,item_type,category,uom,supplier,manufacturer,created_date";
    const csvRows = rows.map((r) => {
      const escape = (v) => `"${String(v || "").replace(/"/g, '""')}"`;
      const date = r.created_date ? new Date(r.created_date).toISOString().split("T")[0] : "";
      return [
        escape(r.item_code),
        escape(r.item_name),
        escape(r.item_type_name),
        escape(r.category_name),
        escape(r.uom_name),
        escape(r.supplier_name),
        escape(r.manufacturer_name),
        escape(date),
      ].join(",");
    });

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="items_export_${dateStr}.csv"`);
    return res.send([header, ...csvRows].join("\n"));
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { item_code, item_name, item_type_id, category_id, uom_id, supplier_id, manufacturer_id, description } = req.body;

    if (!item_code?.trim()) {
      return sendError(res, "item_code is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(item_code.trim())) {
      return sendError(res, "item_code must be alphanumeric (hyphens/underscores allowed, max 50 chars).", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!item_name?.trim()) {
      return sendError(res, "item_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (item_name.trim().length > 255) {
      return sendError(res, "item_name must be 255 characters or fewer.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!item_type_id) {
      return sendError(res, "item_type_id is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!category_id) {
      return sendError(res, "category_id is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!uom_id) {
      return sendError(res, "uom_id is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const [codeExists, typeValid, catValid, uomValid] = await Promise.all([
      itemModel.itemCodeExists(item_code.trim(), req.user.companyId),
      itemTypeModel.getById(Number(item_type_id), req.user.companyId),
      categoryModel.getById(Number(category_id), req.user.companyId),
      uomModel.getById(Number(uom_id), req.user.companyId),
    ]);

    if (codeExists) return sendError(res, "Item code already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    if (!typeValid) return sendError(res, "Invalid or inactive item_type_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    if (!catValid) return sendError(res, "Invalid or inactive category_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    if (!uomValid) return sendError(res, "Invalid or inactive uom_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);

    if (supplier_id) {
      const sup = await supplierModel.getById(Number(supplier_id), req.user.companyId);
      if (!sup) return sendError(res, "Invalid or inactive supplier_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
      var resolvedSupplier = sup.supplier_name;
    }
    if (manufacturer_id) {
      const mfr = await manufacturerModel.getById(Number(manufacturer_id), req.user.companyId);
      if (!mfr) return sendError(res, "Invalid or inactive manufacturer_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
      var resolvedManufacturer = mfr.manufacturer_name;
    }

    const id = await itemModel.create({
      companyId: req.user.companyId,
      itemCode: item_code.trim().toUpperCase(),
      itemName: item_name.trim(),
      itemType: String(item_type_id),
      itemCategory: String(category_id),
      uom: String(uom_id),
      supplier: resolvedSupplier || null,
      manufacturer: resolvedManufacturer || null,
      description: description?.trim() || null,
      createdBy: req.user.userId,
    });

    return sendSuccess(res, { item_id: id }, "Item created successfully", 201);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { item_name, item_type_id, category_id, uom_id, supplier_id, manufacturer_id, description } = req.body;

    if (!item_name?.trim()) {
      return sendError(res, "item_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (item_name.trim().length > 255) {
      return sendError(res, "item_name must be 255 characters or fewer.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!item_type_id) return sendError(res, "item_type_id is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    if (!category_id) return sendError(res, "category_id is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    if (!uom_id) return sendError(res, "uom_id is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);

    const existing = await itemModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Item not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    const [typeValid, catValid, uomValid] = await Promise.all([
      itemTypeModel.getById(Number(item_type_id), req.user.companyId),
      categoryModel.getById(Number(category_id), req.user.companyId),
      uomModel.getById(Number(uom_id), req.user.companyId),
    ]);

    if (!typeValid) return sendError(res, "Invalid or inactive item_type_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    if (!catValid) return sendError(res, "Invalid or inactive category_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    if (!uomValid) return sendError(res, "Invalid or inactive uom_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);

    if (supplier_id) {
      const sup = await supplierModel.getById(Number(supplier_id), req.user.companyId);
      if (!sup) return sendError(res, "Invalid or inactive supplier_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
      var resolvedSupplier = sup.supplier_name;
    }
    if (manufacturer_id) {
      const mfr = await manufacturerModel.getById(Number(manufacturer_id), req.user.companyId);
      if (!mfr) return sendError(res, "Invalid or inactive manufacturer_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
      var resolvedManufacturer = mfr.manufacturer_name;
    }

    await itemModel.update(id, req.user.companyId, {
      itemName: item_name.trim(),
      itemType: String(item_type_id),
      itemCategory: String(category_id),
      uom: String(uom_id),
      supplier: resolvedSupplier || null,
      manufacturer: resolvedManufacturer || null,
      description: description?.trim() || null,
      updatedBy: req.user.userId,
    });

    return sendSuccess(res, { item_id: id }, "Item updated successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await itemModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Item not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    await itemModel.softDelete(id, req.user.companyId, req.user.userId);
    return sendSuccess(res, null, "Item deleted successfully", 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAll, getById, exportItems, create, update, remove };
