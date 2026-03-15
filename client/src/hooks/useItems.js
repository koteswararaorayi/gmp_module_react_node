import { useCallback, useEffect } from "react";
import useItemsStore from "../stores/itemsStore";

export default function useItems() {
  const store = useItemsStore();

  const refresh = useCallback(() => {
    store.fetchItems();
  }, [store.filters, store.pagination.page, store.pagination.limit]);

  useEffect(() => {
    store.fetchItems();
  }, [store.filters, store.pagination.page, store.pagination.limit]);

  return {
    items: store.items,
    loading: store.loading,
    error: store.error,
    pagination: store.pagination,
    filters: store.filters,
    setFilters: store.setFilters,
    setCurrentPage: store.setCurrentPage,
    setPageLimit: store.setPageLimit,
    refresh,
    deleteItem: store.deleteItem,
    clearError: store.clearError,
  };
}
