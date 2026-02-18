// src/service/Applications.js
import { useState, useEffect } from "react";
import axios from "axios";

const useApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
  });

  const fetchApplications = async (url = null) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl =
        url || `${import.meta.env.VITE_SERVER_URL}applications/applications/`;

      const response = await axios.get(apiUrl);
      const data = response.data;

      // unikal qilish: image_path bo‘yicha filterlab olish
      const uniqueApps = [];
      const seenPaths = new Set();

      (data.results || []).forEach((item) => {
        if (!seenPaths.has(item.image_path)) {
          seenPaths.add(item.image_path);
          uniqueApps.push(item);
        }
      });

      setApps(uniqueApps);
      setPagination({
        count: uniqueApps.length,
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
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return {
    apps,
    loading,
    error,
    pagination,
    refresh: () => fetchApplications(),
    fetchPage: (url) => fetchApplications(url),
  };
};

export default useApplications;
