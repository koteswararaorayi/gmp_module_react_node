const { ERROR_CODES } = require("../config/constants");
const uomModel = require("../models/uomModel");
const { sendSuccess, sendError } = require("../utils/responseHandler");

async function getAll(req, res, next) {
  try {
  const uoms = await uomModel.getAll(req.user.companyId);
    return sendSuccess(res, uoms, "UOMs retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
  const uom = await uomModel.getById(Number(req.params.id), req.user.companyId);
    if (!uom) return sendError(res, "UOM not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    return sendSuccess(res, uom, "UOM retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { uom_code, uom_name } = req.body;

    if (!uom_code?.trim()) {
      return sendError(res, "uom_code is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!uom_name?.trim()) {
      return sendError(res, "uom_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (uom_code.trim().length > 20) {
      return sendError(res, "uom_code must be 20 characters or fewer.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

  const exists = await uomModel.codeExists(uom_code.trim(), req.user.companyId);
    if (exists) {
      return sendError(res, "UOM code already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    const id = await uomModel.create({
        companyId: req.user.companyId,
        uomCode: uom_code.trim().toUpperCase(),
        uomName: uom_name.trim(),
    });

    return sendSuccess(res, { uom_id: id }, "UOM created successfully", 201);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { uom_code, uom_name } = req.body;

    if (!uom_code?.trim()) {
      return sendError(res, "uom_code is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!uom_name?.trim()) {
      return sendError(res, "uom_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

  const existing = await uomModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "UOM not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

  const dup = await uomModel.codeExists(uom_code.trim(), req.user.companyId, id);
    if (dup) {
      return sendError(res, "UOM code already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

  await uomModel.update(id, req.user.companyId, {
      uomCode: uom_code.trim().toUpperCase(),
      uomName: uom_name.trim(),
    });

    return sendSuccess(res, { uom_id: id }, "UOM updated successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
  const existing = await uomModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "UOM not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

  await uomModel.softDelete(id, req.user.companyId);
    return sendSuccess(res, null, "UOM deleted successfully", 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
