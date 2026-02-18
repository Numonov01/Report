import { useState, useEffect } from "react";
import axios from "axios";

const useDeviceFullInfo = (deviceId) => {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDevice = async () => {
    if (!deviceId) return;

    try {
      setLoading(true);
      setError(null);

      const apiUrl = `${
        import.meta.env.VITE_SERVER_URL
      }hosts/devices/${deviceId}/`;

      const response = await axios.get(apiUrl);
      setDevice(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error fetching device details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevice();
  }, [deviceId]);

  return {
    device,
    loading,
    error,
    refresh: () => fetchDevice(),
  };
};

export default useDeviceFullInfo;
