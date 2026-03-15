const { ERROR_CODES } = require("../config/constants");
const itemTypeModel = require("../models/itemTypeModel");
const { sendSuccess, sendError } = require("../utils/responseHandler");

async function getAll(req, res, next) {
  try {
    const types = await itemTypeModel.getAll(req.user.companyId);
    return sendSuccess(res, types, "Item types retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const type = await itemTypeModel.getById(Number(req.params.id), req.user.companyId);
    if (!type) return sendError(res, "Item type not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    return sendSuccess(res, type, "Item type retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { item_type_name, description } = req.body;

    if (!item_type_name?.trim()) {
      return sendError(res, "item_type_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (item_type_name.trim().length > 255) {
      return sendError(res, "item_type_name must be 255 characters or fewer.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const exists = await itemTypeModel.nameExists(item_type_name.trim(), req.user.companyId);
    if (exists) {
      return sendError(res, "Item type name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    const id = await itemTypeModel.create({
      companyId: req.user.companyId,
      itemTypeName: item_type_name.trim(),
      description: description?.trim() || null,
      createdBy: req.user.userId,
    });

    return sendSuccess(res, { item_type_id: id }, "Item type created successfully", 201);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { item_type_name, description } = req.body;

    if (!item_type_name?.trim()) {
      return sendError(res, "item_type_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const existing = await itemTypeModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Item type not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    const dup = await itemTypeModel.nameExists(item_type_name.trim(), req.user.companyId, id);
    if (dup) {
      return sendError(res, "Item type name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    await itemTypeModel.update(id, req.user.companyId, {
      itemTypeName: item_type_name.trim(),
      description: description?.trim() || null,
      updatedBy: req.user.userId,
    });

    return sendSuccess(res, { item_type_id: id }, "Item type updated successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await itemTypeModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Item type not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    await itemTypeModel.softDelete(id, req.user.companyId, req.user.userId);
    return sendSuccess(res, null, "Item type deleted successfully", 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
