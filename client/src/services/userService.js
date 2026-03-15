import api from "./api";

const userService = {
  getManagers: () => api.get("/users/managers"),
};

export default userService;
