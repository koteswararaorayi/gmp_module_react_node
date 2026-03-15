const { ERROR_CODES } = require("../config/constants");
const categoryModel = require("../models/categoryModel");
const { sendSuccess, sendError } = require("../utils/responseHandler");

async function getAll(req, res, next) {
  try {
    const categories = await categoryModel.getAll(req.user.companyId);
    return sendSuccess(res, categories, "Categories retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function getById(req, res, next) {
  try {
    const category = await categoryModel.getById(Number(req.params.id), req.user.companyId);
    if (!category) return sendError(res, "Category not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    return sendSuccess(res, category, "Category retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { category_name, description } = req.body;

    if (!category_name?.trim()) {
      return sendError(res, "category_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (category_name.trim().length > 255) {
      return sendError(res, "category_name must be 255 characters or fewer.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const exists = await categoryModel.nameExists(category_name.trim(), req.user.companyId);
    if (exists) {
      return sendError(res, "Category name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    const id = await categoryModel.create({
      companyId: req.user.companyId,
      categoryName: category_name.trim(),
      description: description?.trim() || null,
      createdBy: req.user.userId,
    });

    return sendSuccess(res, { category_id: id }, "Category created successfully", 201);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { category_name, description } = req.body;

    if (!category_name?.trim()) {
      return sendError(res, "category_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const existing = await categoryModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Category not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    const dup = await categoryModel.nameExists(category_name.trim(), req.user.companyId, id);
    if (dup) {
      return sendError(res, "Category name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    await categoryModel.update(id, req.user.companyId, {
      categoryName: category_name.trim(),
      description: description?.trim() || null,
      updatedBy: req.user.userId,
    });

    return sendSuccess(res, { category_id: id }, "Category updated successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await categoryModel.getById(id, req.user.companyId);
    if (!existing) return sendError(res, "Category not found.", ERROR_CODES.ERR_NOT_FOUND, 404);

    await categoryModel.softDelete(id, req.user.companyId, req.user.userId);
    return sendSuccess(res, null, "Category deleted successfully", 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
