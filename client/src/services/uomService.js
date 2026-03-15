import api from "./api";

const uomService = {
  getUOMs: () => api.get("/uom"),
  getUOM: (id) => api.get(`/uom/${id}`),
  createUOM: (data) => api.post("/uom", data),
  updateUOM: (id, data) => api.put(`/uom/${id}`, data),
  deleteUOM: (id) => api.delete(`/uom/${id}`),
};

export default uomService;
