import api from "./axios";

const REPORT_ENDPOINTS = ["/reports", "/report"];

const extractList = (value: any) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.data)) {
    return value.data;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  return [];
};

const extractOne = (value: any) => value?.data || value;

export const getReportsApi = async () => {
  for (let index = 0; index < REPORT_ENDPOINTS.length; index += 1) {
    const endpoint = REPORT_ENDPOINTS[index];

    try {
      const { data } = await api.get(endpoint);
      return extractList(data);
    } catch (error: any) {
      if (
        error?.response?.status !== 404 ||
        index === REPORT_ENDPOINTS.length - 1
      ) {
        throw error;
      }
    }
  }

  return [];
};

export const createReportApi = async (payload: any) => {
  for (let index = 0; index < REPORT_ENDPOINTS.length; index += 1) {
    const endpoint = REPORT_ENDPOINTS[index];

    try {
      const { data } = await api.post(endpoint, payload);
      return extractOne(data);
    } catch (error: any) {
      if (
        error?.response?.status !== 404 ||
        index === REPORT_ENDPOINTS.length - 1
      ) {
        throw error;
      }
    }
  }

  return null;
};

export const updateReportApi = async (id: string | number, payload: any) => {
  for (let index = 0; index < REPORT_ENDPOINTS.length; index += 1) {
    const endpoint = REPORT_ENDPOINTS[index];

    try {
      const { data } = await api.put(`${endpoint}/${id}`, payload);
      return extractOne(data);
    } catch (error: any) {
      if (
        error?.response?.status !== 404 ||
        index === REPORT_ENDPOINTS.length - 1
      ) {
        throw error;
      }
    }
  }

  return null;
};

export const deleteReportApi = async (id: string | number) => {
  for (let index = 0; index < REPORT_ENDPOINTS.length; index += 1) {
    const endpoint = REPORT_ENDPOINTS[index];

    try {
      await api.delete(`${endpoint}/${id}`);
      return;
    } catch (error: any) {
      if (
        error?.response?.status !== 404 ||
        index === REPORT_ENDPOINTS.length - 1
      ) {
        throw error;
      }
    }
  }
};
