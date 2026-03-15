const { ERROR_CODES } = require("../config/constants");
const warehouseModel = require("../models/warehouseModel");
const locationModel = require("../models/locationModel");
const { sendSuccess, sendError } = require("../utils/responseHandler");

async function getAll(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const page = Math.max(Number(req.query.page || 1), 1);
    const offset = (page - 1) * limit;

    const { rows, total } = await warehouseModel.getWarehouses({
      companyId: req.user.companyId,
      search: req.query.search?.trim() || "",
      isActive: req.query.is_active ? Number(req.query.is_active) : 0,
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Warehouses retrieved",
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
    const warehouse = await warehouseModel.getById(Number(req.params.id), req.user.companyId);
    if (!warehouse) {
      return sendError(res, "Warehouse not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    }
    return sendSuccess(res, warehouse, "Warehouse retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const { warehouse_name, warehouse_type, address, manager_id, capacity } = req.body;

    if (!warehouse_name?.trim()) {
      return sendError(res, "warehouse_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const cap = capacity == null || capacity === "" ? 0 : Number(capacity);
    if (!Number.isFinite(cap) || cap < 0) {
      return sendError(res, "capacity must be a positive number.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const exists = await warehouseModel.nameExists(warehouse_name.trim(), req.user.companyId);
    if (exists) {
      return sendError(res, "Warehouse name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    const id = await warehouseModel.create({
      companyId: req.user.companyId,
      warehouseName: warehouse_name.trim(),
      warehouseType: warehouse_type?.trim() || null,
      address: address?.trim() || null,
      managerId: manager_id ? Number(manager_id) : null,
      capacity: cap,
      createdBy: req.user.userId,
    });

    return sendSuccess(res, { warehouse_id: id }, "Warehouse created successfully", 201);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { warehouse_name, warehouse_type, address, manager_id, capacity } = req.body;

    if (!warehouse_name?.trim()) {
      return sendError(res, "warehouse_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const cap = capacity == null || capacity === "" ? 0 : Number(capacity);
    if (!Number.isFinite(cap) || cap < 0) {
      return sendError(res, "capacity must be a positive number.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const existing = await warehouseModel.getById(id, req.user.companyId);
    if (!existing) {
      return sendError(res, "Warehouse not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    }

    const duplicate = await warehouseModel.nameExists(warehouse_name.trim(), req.user.companyId, id);
    if (duplicate) {
      return sendError(res, "Warehouse name already exists.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    await warehouseModel.update(id, req.user.companyId, {
      warehouseName: warehouse_name.trim(),
      warehouseType: warehouse_type?.trim() || null,
      address: address?.trim() || null,
      managerId: manager_id ? Number(manager_id) : null,
      capacity: cap,
      updatedBy: req.user.userId,
    });

    return sendSuccess(res, { warehouse_id: id }, "Warehouse updated successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await warehouseModel.getById(id, req.user.companyId);
    if (!existing) {
      return sendError(res, "Warehouse not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    }

    await warehouseModel.softDelete(id, req.user.companyId, req.user.userId);
    return sendSuccess(res, null, "Warehouse deleted successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function getWarehouseLocations(req, res, next) {
  try {
    const warehouseId = Number(req.params.id);
    const warehouse = await warehouseModel.getById(warehouseId, req.user.companyId);
    if (!warehouse) {
      return sendError(res, "Warehouse not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    }

    const locations = await warehouseModel.getLocationsByWarehouse(warehouseId, req.user.companyId);
    return sendSuccess(res, locations, "Warehouse locations retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function getCapacityStatus(req, res, next) {
  try {
    const warehouseId = Number(req.params.id);
    const status = await warehouseModel.getCapacityStatus(warehouseId, req.user.companyId);
    if (!status) {
      return sendError(res, "Warehouse not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    }

    return sendSuccess(res, status, "Warehouse capacity status retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function getLocations(req, res, next) {
  try {
    const warehouseId = Number(req.query.warehouse_id || 0);
    if (!warehouseId) {
      return sendError(res, "warehouse_id is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const warehouse = await warehouseModel.getById(warehouseId, req.user.companyId);
    if (!warehouse) {
      return sendError(res, "Invalid warehouse_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const page = Math.max(Number(req.query.page || 1), 1);
    const offset = (page - 1) * limit;

    const { rows, total } = await locationModel.getLocations({
      companyId: req.user.companyId,
      warehouseId,
      search: req.query.search?.trim() || "",
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      message: "Locations retrieved",
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

async function getLocationById(req, res, next) {
  try {
    const location = await locationModel.getById(Number(req.params.id), req.user.companyId);
    if (!location) {
      return sendError(res, "Location not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    }

    return sendSuccess(res, location, "Location retrieved", 200);
  } catch (error) {
    return next(error);
  }
}

async function createLocation(req, res, next) {
  try {
    const { warehouse_id, location_code, location_name, row, column, shelf, zone, capacity } = req.body;

    if (!warehouse_id) {
      return sendError(res, "warehouse_id is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!location_code?.trim()) {
      return sendError(res, "location_code is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!location_name?.trim()) {
      return sendError(res, "location_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const cap = capacity == null || capacity === "" ? 0 : Number(capacity);
    if (!Number.isFinite(cap) || cap < 0) {
      return sendError(res, "capacity must be a positive number.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const warehouse = await warehouseModel.getById(Number(warehouse_id), req.user.companyId);
    if (!warehouse) {
      return sendError(res, "Invalid warehouse_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const duplicate = await locationModel.codeExists(
      Number(warehouse_id),
      location_code.trim(),
      req.user.companyId,
    );
    if (duplicate) {
      return sendError(res, "Location code already exists for this warehouse.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    const id = await locationModel.create({
      companyId: req.user.companyId,
      warehouseId: Number(warehouse_id),
      locationCode: location_code.trim().toUpperCase(),
      locationName: location_name.trim(),
      row: row?.trim() || null,
      column: column?.trim() || null,
      shelf: shelf?.trim() || null,
      zone: zone?.trim() || null,
      capacity: cap,
      createdBy: req.user.userId,
    });

    return sendSuccess(res, { location_id: id }, "Location created successfully", 201);
  } catch (error) {
    return next(error);
  }
}

async function updateLocation(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { warehouse_id, location_code, location_name, row, column, shelf, zone, capacity } = req.body;

    if (!warehouse_id) {
      return sendError(res, "warehouse_id is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!location_code?.trim()) {
      return sendError(res, "location_code is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }
    if (!location_name?.trim()) {
      return sendError(res, "location_name is required.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const cap = capacity == null || capacity === "" ? 0 : Number(capacity);
    if (!Number.isFinite(cap) || cap < 0) {
      return sendError(res, "capacity must be a positive number.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const existing = await locationModel.getById(id, req.user.companyId);
    if (!existing) {
      return sendError(res, "Location not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    }

    const warehouse = await warehouseModel.getById(Number(warehouse_id), req.user.companyId);
    if (!warehouse) {
      return sendError(res, "Invalid warehouse_id.", ERROR_CODES.ERR_VALIDATION_ERROR, 400);
    }

    const duplicate = await locationModel.codeExists(
      Number(warehouse_id),
      location_code.trim(),
      req.user.companyId,
      id,
    );
    if (duplicate) {
      return sendError(res, "Location code already exists for this warehouse.", ERROR_CODES.ERR_DUPLICATE_ENTRY, 409);
    }

    await locationModel.update(id, req.user.companyId, {
      warehouseId: Number(warehouse_id),
      locationCode: location_code.trim().toUpperCase(),
      locationName: location_name.trim(),
      row: row?.trim() || null,
      column: column?.trim() || null,
      shelf: shelf?.trim() || null,
      zone: zone?.trim() || null,
      capacity: cap,
      updatedBy: req.user.userId,
    });

    return sendSuccess(res, { location_id: id }, "Location updated successfully", 200);
  } catch (error) {
    return next(error);
  }
}

async function removeLocation(req, res, next) {
  try {
    const id = Number(req.params.id);
    const existing = await locationModel.getById(id, req.user.companyId);
    if (!existing) {
      return sendError(res, "Location not found.", ERROR_CODES.ERR_NOT_FOUND, 404);
    }

    await locationModel.softDelete(id, req.user.companyId, req.user.userId);
    return sendSuccess(res, null, "Location deleted successfully", 200);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getWarehouseLocations,
  getCapacityStatus,
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  removeLocation,
};
