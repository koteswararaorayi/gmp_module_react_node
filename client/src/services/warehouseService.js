import api from "./api";

const warehouseService = {
  getWarehouses: (params = {}) => api.get("/warehouses", { params }),
  getWarehouse: (id) => api.get(`/warehouses/${id}`),
  createWarehouse: (data) => api.post("/warehouses", data),
  updateWarehouse: (id, data) => api.put(`/warehouses/${id}`, data),
  deleteWarehouse: (id) => api.delete(`/warehouses/${id}`),
  getWarehouseLocations: (id) => api.get(`/warehouses/${id}/locations`),
  getCapacityStatus: (id) => api.get(`/warehouses/${id}/capacity-status`),
};

export default warehouseService;
