const { ERROR_CODES } = require("../config/constants");
const manufacturerModel = require("../models/manufacturerModel");
const { sendSuccess, sendError } = require("../utils/responseHandler");

async function getAll(req, res, next) {
  try {
    const manufacturers = await manufacturerModel.getAll(req.user.companyId);
    return sendSuccess(res, manufacturers, "Manufacturers retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const manufacturer = await manufacturerModel.getById(Number(req.params.id), req.user.companyId);
    if (!manufacturer) return sendError(res, "Manufacturer not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    return sendSuccess(res, manufacturer, "Manufacturer retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { manufacturer_name, address, contact } = req.body;

    if (!manufacturer_name?.trim()) {
      return sendError(res, "manufacturer_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (manufacturer_name.trim().length > 255) {
      return sendError(res, "manufacturer_name must be 255 characters or fewer.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const exists = await manufacturerModel.nameExists(manufacturer_name.trim(), req.user.companyId);
    if (exists) {
      return sendError(res, "Manufacturer name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    const id = await manufacturerModel.create({
      companyId: req.user.companyId,
      manufacturerName: manufacturer_name.trim(),
      address: address?.trim() || null,
      contact: contact?.trim() || null,
      createdBy: req.user.userId,
    });

    return sendSuccess(res, { manufacturer_id: id }, "Manufacturer created successfully", 201);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { manufacturer_name, address, contact } = req.body;

    if (!manufacturer_name?.trim()) {
      return sendError(res, "manufacturer_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const existing = await manufacturerModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Manufacturer not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    const dup = await manufacturerModel.nameExists(manufacturer_name.trim(), req.user.companyId, id);
    if (dup) {
      return sendError(res, "Manufacturer name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    await manufacturerModel.update(id, req.user.companyId, {
      manufacturerName: manufacturer_name.trim(),
      address: address?.trim() || null,
      contact: contact?.trim() || null,
      updatedBy: req.user.userId,
    });

    return sendSuccess(res, { manufacturer_id: id }, "Manufacturer updated successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await manufacturerModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Manufacturer not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    await manufacturerModel.softDelete(id, req.user.companyId, req.user.userId);
    return sendSuccess(res, null, "Manufacturer deleted successfully", 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
