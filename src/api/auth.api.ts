import api from "./axios";

type LoginPayload = {
  identifier: string;
  password: string;
};

export const loginApi = async (payload: LoginPayload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};
