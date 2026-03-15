import api from "./api";

const itemTypeService = {
  getItemTypes: () => api.get("/item-types"),
  getItemType: (id) => api.get(`/item-types/${id}`),
  createItemType: (data) => api.post("/item-types", data),
  updateItemType: (id, data) => api.put(`/item-types/${id}`, data),
  deleteItemType: (id) => api.delete(`/item-types/${id}`),
};

export default itemTypeService;
