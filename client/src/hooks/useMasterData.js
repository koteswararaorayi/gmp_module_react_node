import { useEffect, useState } from "react";

export default function useMasterData(service, fetchFn) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data || []);
    } catch (err) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const create = async (payload) => {
    try {
      const res = await service.create(payload);
      await fetch();
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err?.message || "Failed to create" };
    }
  };

  const update = async (id, payload) => {
    try {
      const res = await service.update(id, payload);
      await fetch();
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: err?.message || "Failed to update" };
    }
  };

  const remove = async (id) => {
    try {
      await service.remove(id);
      await fetch();
      return { success: true };
    } catch (err) {
      return { success: false, message: err?.message || "Failed to delete" };
    }
  };

  return { data, loading, error, refresh: fetch, create, update, remove };
}
