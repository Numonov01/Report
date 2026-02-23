import api from "./axios";

export interface InstrumentStatusCounts {
  new: number;
  old: number;
  repair: number;
  broken: number;
}

export interface Instrument {
  id: number;
  name: string;
  status?: string;
  quantity?: number;
  statusCounts?: InstrumentStatusCounts;
  unit: string;
  location: string;
  note: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InstrumentUpsertForm {
  name?: string;
  status?: string;
  quantity?: number | string;
  statusCounts?: Partial<InstrumentStatusCounts>;
  unit?: string;
  location?: string;
  note?: string;
  images?: File[];
  existingImageUrls?: string[];
  removedImageUrls?: string[];
}

export interface InstrumentDeleteResponse {
  message: string;
  data: Instrument;
}

const extractOne = (value: any): Instrument => value?.data || value;

const extractList = (value: any): Instrument[] => {
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

const toFormData = (payload: InstrumentUpsertForm) => {
  const formData = new FormData();

  if (payload.name !== undefined) {
    formData.append("name", String(payload.name));
  }

  if (payload.status !== undefined) {
    formData.append("status", String(payload.status));
  }

  if (payload.quantity !== undefined) {
    formData.append("quantity", String(payload.quantity));
  }

  if (payload.statusCounts) {
    const statusCounts = {
      new: Number(payload.statusCounts.new || 0),
      old: Number(payload.statusCounts.old || 0),
      repair: Number(payload.statusCounts.repair || 0),
      broken: Number(payload.statusCounts.broken || 0),
    };

    formData.append("statusCounts", JSON.stringify(statusCounts));
    formData.append("statusCounts[new]", String(statusCounts.new));
    formData.append("statusCounts[old]", String(statusCounts.old));
    formData.append("statusCounts[repair]", String(statusCounts.repair));
    formData.append("statusCounts[broken]", String(statusCounts.broken));
  }

  if (payload.unit !== undefined) {
    formData.append("unit", String(payload.unit));
  }

  if (payload.location !== undefined) {
    formData.append("location", String(payload.location));
  }

  if (payload.note !== undefined) {
    formData.append("note", String(payload.note));
  }

  if (Array.isArray(payload.images)) {
    payload.images.slice(0, 10).forEach((file) => {
      if (file instanceof File) {
        formData.append("images", file);
      }
    });
  }

  if (Array.isArray(payload.existingImageUrls)) {
    formData.append(
      "existingImageUrlsJson",
      JSON.stringify(payload.existingImageUrls),
    );

    if (payload.existingImageUrls.length === 0) {
      formData.append("existingImageUrls", "[]");
      formData.append("imageUrls", "[]");
      formData.append("retainImageUrls", "[]");
    } else {
      payload.existingImageUrls.forEach((url) => {
        const normalized = String(url || "").trim();

        if (!normalized) {
          return;
        }

        formData.append("existingImageUrls", normalized);
        formData.append("imageUrls", normalized);
        formData.append("retainImageUrls", normalized);
      });
    }
  }

  if (Array.isArray(payload.removedImageUrls)) {
    formData.append(
      "removedImageUrlsJson",
      JSON.stringify(payload.removedImageUrls),
    );

    if (payload.removedImageUrls.length === 0) {
      formData.append("removedImageUrls", "[]");
      formData.append("deleteImageUrls", "[]");
    } else {
      payload.removedImageUrls.forEach((url) => {
        const normalized = String(url || "").trim();

        if (!normalized) {
          return;
        }

        formData.append("removedImageUrls", normalized);
        formData.append("deleteImageUrls", normalized);
      });
    }
  }

  return formData;
};

export const getInstrumentsApi = async (): Promise<Instrument[]> => {
  const { data } = await api.get("/instruments");
  return extractList(data);
};

export const getInstrumentByIdApi = async (
  id: string | number,
): Promise<Instrument> => {
  const { data } = await api.get(`/instruments/${id}`);
  return extractOne(data);
};

export const createInstrumentApi = async (
  payload: InstrumentUpsertForm,
): Promise<Instrument> => {
  const normalizedName = String(payload?.name || "").trim();

  if (!normalizedName) {
    throw new Error("name is required for creating instrument");
  }

  const formData = toFormData({
    ...payload,
    name: normalizedName,
  });

  const { data } = await api.post("/instruments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return extractOne(data);
};

export const updateInstrumentApi = async (
  id: string | number,
  payload: InstrumentUpsertForm,
): Promise<Instrument> => {
  const formData = toFormData(payload);

  const { data } = await api.put(`/instruments/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return extractOne(data);
};

export const deleteInstrumentApi = async (
  id: string | number,
): Promise<InstrumentDeleteResponse> => {
  const { data } = await api.delete(`/instruments/${id}`);
  return data?.data || data;
};
