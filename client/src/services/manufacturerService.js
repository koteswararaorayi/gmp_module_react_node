import api from "./api";

const manufacturerService = {
  getManufacturers: () => api.get("/manufacturers"),
  getManufacturer: (id) => api.get(`/manufacturers/${id}`),
  createManufacturer: (data) => api.post("/manufacturers", data),
  updateManufacturer: (id, data) => api.put(`/manufacturers/${id}`, data),
  deleteManufacturer: (id) => api.delete(`/manufacturers/${id}`),
};

export default manufacturerService;
