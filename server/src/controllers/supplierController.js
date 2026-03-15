const { ERROR_CODES } = require("../config/constants");
const supplierModel = require("../models/supplierModel");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getAll(req, res, next) {
  try {
    const suppliers = await supplierModel.getAll(req.user.companyId);
    return sendSuccess(res, suppliers, "Suppliers retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const supplier = await supplierModel.getById(Number(req.params.id), req.user.companyId);
    if (!supplier) return sendError(res, "Supplier not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    return sendSuccess(res, supplier, "Supplier retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { supplier_name, address, contact, email } = req.body;

    if (!supplier_name?.trim()) {
      return sendError(res, "supplier_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (supplier_name.trim().length > 255) {
      return sendError(res, "supplier_name must be 255 characters or fewer.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (email && !EMAIL_REGEX.test(email.trim())) {
      return sendError(res, "Invalid email format.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const exists = await supplierModel.nameExists(supplier_name.trim(), req.user.companyId);
    if (exists) {
      return sendError(res, "Supplier name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    const id = await supplierModel.create({
      companyId: req.user.companyId,
      supplierName: supplier_name.trim(),
      address: address?.trim() || null,
      contact: contact?.trim() || null,
      email: email?.trim() || null,
      createdBy: req.user.userId,
    });

    return sendSuccess(res, { supplier_id: id }, "Supplier created successfully", 201);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { supplier_name, address, contact, email } = req.body;

    if (!supplier_name?.trim()) {
      return sendError(res, "supplier_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (email && !EMAIL_REGEX.test(email.trim())) {
      return sendError(res, "Invalid email format.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const existing = await supplierModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Supplier not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    const dup = await supplierModel.nameExists(supplier_name.trim(), req.user.companyId, id);
    if (dup) {
      return sendError(res, "Supplier name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    await supplierModel.update(id, req.user.companyId, {
      supplierName: supplier_name.trim(),
      address: address?.trim() || null,
      contact: contact?.trim() || null,
      email: email?.trim() || null,
      updatedBy: req.user.userId,
    });

    return sendSuccess(res, { supplier_id: id }, "Supplier updated successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await supplierModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Supplier not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    await supplierModel.softDelete(id, req.user.companyId, req.user.userId);
    return sendSuccess(res, null, "Supplier deleted successfully", 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
