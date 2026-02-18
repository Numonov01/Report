// src/service/MapIpAddress.js
import { useState, useEffect } from "react";
import axios from "axios";

async function ipLookupOnline(ip) {
  if (!ip) return null;
  const url = `https://ipwhois.app/json/${ip}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (response.status !== 200) return null;
    return {
      ip,
      asn: data.asn,
      isp: data.isp,
      country: data.country,
      region: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      country_flag: data.country_flag
    };
  } catch (error) {
    console.error("IP lookup failed:", error);
    return null;
  }
}

const useConnectionMapIpAddress = () => {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partialLoading, setPartialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
  });

  const fetchMaps = async (url = null, pageSize = 10) => {
    try {
      setLoading(true);
      setPartialLoading(true);
      setError(null);

      // Add page_size parameter to the URL
      let apiUrl =
        url || `${import.meta.env.VITE_SERVER_URL}applications/connect/list/`;
      if (!url || !url.includes("page_size=")) {
        apiUrl += apiUrl.includes("?")
          ? `&page_size=${pageSize}`
          : `?page_size=${pageSize}`;
      }

      const response = await axios.get(apiUrl);
      const data = response.data;

      // Initialize connections with loading state
      const initialConnections = (data.results || []).map((conn, index) => ({
        ...conn,
        more_info: {
          loading: true,
          local_address: null,
          remote_address: null,
        },
        id: index,
      }));

      setMaps(initialConnections);
      setLoading(false); // Stop main loading, but keep partial loading

      setPagination({
        count: data.count || data.results?.length || 0,
        next: data.next || null,
        previous: data.previous || null,
        currentPage: url
          ? url.includes("page=")
            ? parseInt(url.match(/page=(\d+)/)?.[1])
            : 1
          : 1,
      });

      // Process each connection individually
      const processConnection = async (conn, index) => {
        try {
          const localInfo = await ipLookupOnline(conn.application?.ip_address);

          // remote_address ichidan faqat IP ni ajratib olish (portni tashlab yuborish)
          const remoteIp = conn.remote_address?.split(":")[0] || null;
          const remoteInfo = await ipLookupOnline(remoteIp);

          // Update only this specific connection
          setMaps((prevMaps) =>
            prevMaps.map((item, idx) =>
              idx === index
                ? {
                    ...item,
                    more_info: {
                      loading: false,
                      local_address: localInfo,
                      remote_address: remoteInfo,
                    },
                  }
                : item
            )
          );
        } catch (error) {
          console.error(`Error processing connection ${index}:`, error);
          // Mark this connection as failed but continue
          setMaps((prevMaps) =>
            prevMaps.map((item, idx) =>
              idx === index
                ? {
                    ...item,
                    more_info: {
                      loading: false,
                      local_address: null,
                      remote_address: null,
                      error: true,
                    },
                  }
                : item
            )
          );
        }
      };

      // Process all connections in parallel but update UI as each completes
      const promises = initialConnections.map((conn, index) =>
        processConnection(conn, index)
      );

      // Wait for all to complete, then stop partial loading
      await Promise.allSettled(promises);
      setPartialLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error fetching connection maps:", err);
      setLoading(false);
      setPartialLoading(false);
    }
  };

  const refresh = () => {
    fetchMaps();
  };

  const fetchPage = (url) => {
    fetchMaps(url);
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  return {
    maps,
    loading,
    partialLoading,
    error,
    pagination,
    refresh,
    fetchPage,
  };
};

export default useConnectionMapIpAddress;
