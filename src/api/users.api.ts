import api from "./axios";

const USER_ENDPOINTS = ["/users", "/user"];

const toArray = (value: any) => {
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

export const getUsersApi = async () => {
  for (let index = 0; index < USER_ENDPOINTS.length; index += 1) {
    const endpoint = USER_ENDPOINTS[index];

    try {
      const { data } = await api.get(endpoint);
      return toArray(data);
    } catch (error: any) {
      if (
        error?.response?.status !== 404 ||
        index === USER_ENDPOINTS.length - 1
      ) {
        throw error;
      }
    }
  }

  return [];
};

export const createUserApi = async (payload: any) => {
  for (let index = 0; index < USER_ENDPOINTS.length; index += 1) {
    const endpoint = USER_ENDPOINTS[index];

    try {
      const { data } = await api.post(endpoint, payload);
      return data?.data || data;
    } catch (error: any) {
      if (
        error?.response?.status !== 404 ||
        index === USER_ENDPOINTS.length - 1
      ) {
        throw error;
      }
    }
  }

  return null;
};

export const updateUserApi = async (id: string | number, payload: any) => {
  for (let index = 0; index < USER_ENDPOINTS.length; index += 1) {
    const endpoint = USER_ENDPOINTS[index];

    try {
      const { data } = await api.put(`${endpoint}/${id}`, payload);
      return data?.data || data;
    } catch (error: any) {
      if (
        error?.response?.status !== 404 ||
        index === USER_ENDPOINTS.length - 1
      ) {
        throw error;
      }
    }
  }

  return null;
};

export const deleteUserApi = async (id: string | number) => {
  for (let index = 0; index < USER_ENDPOINTS.length; index += 1) {
    const endpoint = USER_ENDPOINTS[index];

    try {
      await api.delete(`${endpoint}/${id}`);
      return;
    } catch (error: any) {
      if (
        error?.response?.status !== 404 ||
        index === USER_ENDPOINTS.length - 1
      ) {
        throw error;
      }
    }
  }
};
