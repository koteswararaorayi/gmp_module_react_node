import api from "./api";

const locationService = {
  getLocations: (params = {}) => api.get("/locations", { params }),
  getLocation: (id) => api.get(`/locations/${id}`),
  createLocation: (data) => api.post("/locations", data),
  updateLocation: (id, data) => api.put(`/locations/${id}`, data),
  deleteLocation: (id) => api.delete(`/locations/${id}`),
};

export default locationService;
