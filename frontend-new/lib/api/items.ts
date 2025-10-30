import { apiClient } from "./client";

export interface Item {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  insured: boolean;
  archived: boolean;
  assetId: string;
  serialNumber?: string;
  modelNumber?: string;
  manufacturer?: string;
  notes?: string;
  purchaseTime?: string;
  purchasePrice?: number;
  purchaseFrom?: string;
  lifetimeWarranty: boolean;
  warrantyExpires?: string;
  warrantyDetails?: string;
  soldTime?: string;
  soldPrice?: number;
  soldTo?: string;
  soldNotes?: string;
  createdAt: string;
  updatedAt: string;
  labels?: Label[];
  location?: Location;
}

export interface Label {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  parent?: Location;
  createdAt: string;
  updatedAt: string;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
}

export interface GroupStatistics {
  totalItems: number;
  totalLabels: number;
  totalLocations: number;
  totalUsers: number;
  totalItemPrice: number;
  totalWithWarranty: number;
}

export const itemsApi = {
  getAll: (params?: {
    page?: number;
    pageSize?: number;
    q?: string;
    labels?: string[];
    locations?: string[];
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.pageSize)
      searchParams.set("pageSize", params.pageSize.toString());
    if (params?.q) searchParams.set("q", params.q);
    if (params?.labels) params.labels.forEach((l) => searchParams.append("labels", l));
    if (params?.locations)
      params.locations.forEach((l) => searchParams.append("locations", l));

    return apiClient.get<ItemsResponse>(
      `/items?${searchParams.toString()}`
    );
  },

  getById: (id: string) => apiClient.get<Item>(`/items/${id}`),

  create: (data: Partial<Item>) => apiClient.post<Item>("/items", data),

  update: (id: string, data: Partial<Item>) =>
    apiClient.put<Item>(`/items/${id}`, data),

  delete: (id: string) => apiClient.delete(`/items/${id}`),
};

export const labelsApi = {
  getAll: () => apiClient.get<Label[]>("/labels"),

  getById: (id: string) => apiClient.get<Label>(`/labels/${id}`),

  create: (data: Partial<Label>) => apiClient.post<Label>("/labels", data),

  update: (id: string, data: Partial<Label>) =>
    apiClient.put<Label>(`/labels/${id}`, data),

  delete: (id: string) => apiClient.delete(`/labels/${id}`),
};

export const locationsApi = {
  getAll: () => apiClient.get<Location[]>("/locations"),

  getTree: () => apiClient.get<Location[]>("/locations/tree"),

  getById: (id: string) => apiClient.get<Location>(`/locations/${id}`),

  create: (data: Partial<Location>) =>
    apiClient.post<Location>("/locations", data),

  update: (id: string, data: Partial<Location>) =>
    apiClient.put<Location>(`/locations/${id}`, data),

  delete: (id: string) => apiClient.delete(`/locations/${id}`),
};

export const statsApi = {
  getGroupStatistics: () =>
    apiClient.get<GroupStatistics>("/groups/statistics"),
};

