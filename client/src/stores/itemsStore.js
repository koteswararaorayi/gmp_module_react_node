import { create } from "zustand";
import itemService from "../services/itemService";
import categoryService from "../services/categoryService";
import itemTypeService from "../services/itemTypeService";
import uomService from "../services/uomService";
import manufacturerService from "../services/manufacturerService";
import supplierService from "../services/supplierService";

const useItemsStore = create((set, get) => ({
  items: [],
  currentItem: null,
  categories: [],
  itemTypes: [],
  uoms: [],
  manufacturers: [],
  suppliers: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  filters: {
    search: "",
    category_id: "",
    item_type_id: "",
    supplier_id: "",
    manufacturer_id: "",
    sort: "created_date:desc",
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    })),

  setCurrentPage: (page) =>
    set((state) => ({ pagination: { ...state.pagination, page } })),

  setPageLimit: (limit) =>
    set((state) => ({ pagination: { ...state.pagination, limit, page: 1 } })),

  fetchItems: async () => {
    const { filters, pagination } = get();
    set({ loading: true, error: null });
    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      // Remove empty filters
      Object.keys(params).forEach((k) => {
        if (params[k] === "" || params[k] == null) delete params[k];
      });
      const res = await itemService.getItems(params);
      set({
        items: res.data || [],
        pagination: res.pagination || get().pagination,
        loading: false,
      });
    } catch (err) {
      set({ error: err?.message || "Failed to fetch items", loading: false });
    }
  },

  fetchItemById: async (id) => {
    set({ loading: true, error: null, currentItem: null });
    try {
      const res = await itemService.getItem(id);
      set({ currentItem: res.data, loading: false });
    } catch (err) {
      set({ error: err?.message || "Item not found", loading: false });
    }
  },

  createItem: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await itemService.createItem(data);
      set({ loading: false });
      return { success: true, data: res.data };
    } catch (err) {
      set({ loading: false, error: err?.message || "Failed to create item" });
      return { success: false, message: err?.message || "Failed to create item" };
    }
  },

  updateItem: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const res = await itemService.updateItem(id, data);
      set({ loading: false });
      return { success: true, data: res.data };
    } catch (err) {
      set({ loading: false, error: err?.message || "Failed to update item" });
      return { success: false, message: err?.message || "Failed to update item" };
    }
  },

  deleteItem: async (id) => {
    set({ loading: true, error: null });
    try {
      await itemService.deleteItem(id);
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      set({ loading: false, error: err?.message || "Failed to delete item" });
      return { success: false, message: err?.message || "Failed to delete item" };
    }
  },

  fetchCategories: async () => {
    try {
      const res = await categoryService.getCategories();
      set({ categories: res.data || [] });
    } catch {
      // non-blocking
    }
  },

  fetchItemTypes: async () => {
    try {
      const res = await itemTypeService.getItemTypes();
      set({ itemTypes: res.data || [] });
    } catch {
      // non-blocking
    }
  },

  fetchUOMs: async () => {
    try {
      const res = await uomService.getUOMs();
      set({ uoms: res.data || [] });
    } catch {
      // non-blocking
    }
  },

  fetchManufacturers: async () => {
    try {
      const res = await manufacturerService.getManufacturers();
      set({ manufacturers: res.data || [] });
    } catch {
      // non-blocking
    }
  },

  fetchSuppliers: async () => {
    try {
      const res = await supplierService.getSuppliers();
      set({ suppliers: res.data || [] });
    } catch {
      // non-blocking
    }
  },

  fetchMasterData: async () => {
    const { fetchCategories, fetchItemTypes, fetchUOMs, fetchManufacturers, fetchSuppliers } = get();
    await Promise.all([
      fetchCategories(),
      fetchItemTypes(),
      fetchUOMs(),
      fetchManufacturers(),
      fetchSuppliers(),
    ]);
  },
}));

export default useItemsStore;
