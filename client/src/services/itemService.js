import api from "./api";

const itemService = {
  getItems: (params = {}) => api.get("/items", { params }),
  getItem: (id) => api.get(`/items/${id}`),
  createItem: (data) => api.post("/items", data),
  updateItem: (id, data) => api.put(`/items/${id}`, data),
  deleteItem: (id) => api.delete(`/items/${id}`),
  exportItems: (params = {}) =>
    api.get("/items/export", { params, responseType: "blob" }),
};

export default itemService;
