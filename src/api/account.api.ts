import api from "./axios";

const extract = (value: any) => value?.data || value;

export const getAccountMeApi = async () => {
  const { data } = await api.get("/account/me");
  return extract(data);
};

export const updateAccountMeApi = async (payload: any) => {
  const { data } = await api.put("/account/me", payload);
  return extract(data);
};

export const updateAccountPasswordApi = async (payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const { data } = await api.put("/account/password", payload);
  return extract(data);
};

export const uploadAccountAvatarApi = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const { data } = await api.post("/account/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return extract(data);
};

export const deleteAccountAvatarApi = async () => {
  const { data } = await api.delete("/account/avatar");
  return extract(data);
};
