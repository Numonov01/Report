// src/service/PatchManagement.js
import { useState, useEffect } from "react";
import axios from "axios";

const usePatchManagements = () => {
  const [patches, setPatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
  });

  const fetchPatches = async (url = null) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = url || `${import.meta.env.VITE_SERVER_URL}patch/patches/`;

      const response = await axios.get(apiUrl);
      const data = response.data;

      setPatches(data.results || []);
      setPagination({
        count: data.count || data.results?.length || 0,
        next: data.next || null,
        previous: data.previous || null,
        currentPage: url
          ? url.includes("page=")
            ? parseInt(url.match(/page=(\d+)/)[1])
            : 1
          : 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error fetching patch management:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatches();
  }, []);

  return {
    patches,
    loading,
    error,
    pagination,
    refresh: () => fetchPatches(),
    fetchPage: (url) => fetchPatches(url),
  };
};

export default usePatchManagements;
