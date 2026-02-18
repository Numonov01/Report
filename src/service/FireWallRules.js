// src/service/FireWallRules.js
import { useState, useEffect } from "react";
import axios from "axios";

const useFirewallRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1,
  });

  const fetchRules = async (url = null) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl =
        url || `${import.meta.env.VITE_SERVER_URL}firewall/firewall-rules/`;

      const response = await axios.get(apiUrl);
      const data = response.data;

      setRules(data.results || []);
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
      console.error("Error fetching firewall rules:", err);
    } finally {
      setLoading(false);
    }
  };

  const createRule = async (ruleData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}firewall/firewall-rules/`,
        ruleData
      );

      const newRule = response.data;
      setRules((prevRules) => [newRule, ...prevRules]);
      return newRule;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error creating firewall rule:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRule = async (ruleId) => {
    try {
      setLoading(true);
      setError(null);

      await axios.delete(
        `${import.meta.env.VITE_SERVER_URL}firewall/firewall-rules/${ruleId}/`
      );

      setRules((prevRules) => prevRules.filter((rule) => rule.id !== ruleId));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error("Error deleting firewall rule:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  return {
    rules,
    loading,
    error,
    pagination,
    refresh: () => fetchRules(),
    fetchPage: (url) => fetchRules(url),
    createRule,
    deleteRule,
  };
};

export default useFirewallRules;
