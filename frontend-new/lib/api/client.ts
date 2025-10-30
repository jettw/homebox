const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7745/api/v1";

const DEBUG = process.env.NODE_ENV === "development";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface AuthTokens {
  token: string;
  expiresAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isSuperuser: boolean;
  isOwner: boolean;
  groupId: string;
  groupName: string;
}

export interface GroupStatistics {
  totalUsers: number;
  totalItems: number;
  totalLocations: number;
  totalLabels: number;
  totalItemPrice: number;
  totalWithWarranty: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  location?: ItemSummary;
  labels?: ItemSummary[];
  assetId: string;
  serialNumber?: string;
  modelNumber?: string;
  manufacturer?: string;
  imageId?: string;
  thumbnailId?: string;
  insured: boolean;
  archived: boolean;
  purchasePrice?: number;
  purchaseTime?: string;
  purchaseFrom?: string;
  lifetimeWarranty: boolean;
  warrantyExpires?: string;
  warrantyDetails?: string;
  soldTime?: string;
  soldTo?: string;
  soldPrice?: number;
  soldNotes?: string;
  notes?: string;
  attachments?: ItemAttachment[];
  fields?: ItemField[];
}

export interface ItemAttachment {
  id: string;
  type: string;
  primary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemField {
  id: string;
  name: string;
  type: string;
  textValue?: string;
  numberValue?: number;
  booleanValue?: boolean;
}

export interface ItemSummary {
  id: string;
  name: string;
  description: string;
}

export interface ItemsQuery {
  page?: number;
  pageSize?: number;
  orderBy?: string;
  search?: string;
  locations?: string[];
  labels?: string[];
}

export interface ItemsPagination {
  items: Item[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ItemCreate {
  name: string;
  description: string;
  locationId: string;
  quantity?: number;
  labelIds?: string[];
  parentId?: string | null;
  serialNumber?: string;
  modelNumber?: string;
  manufacturer?: string;
  insured?: boolean;
  archived?: boolean;
  purchasePrice?: number;
  purchaseTime?: string;
  purchaseFrom?: string;
  lifetimeWarranty?: boolean;
  warrantyExpires?: string;
  warrantyDetails?: string;
  soldTime?: string;
  soldTo?: string;
  soldPrice?: number;
  soldNotes?: string;
  notes?: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  parent?: Location;
  children?: Location[];
}

export interface LocationCreate {
  name: string;
  description: string;
  parentId?: string | null;
}

export interface Label {
  id: string;
  name: string;
  description: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabelCreate {
  name: string;
  description: string;
  color?: string;
}

export interface MaintenanceEntry {
  id: string;
  name: string;
  description: string;
  cost: number;
  scheduledDate: string;
  completedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceEntryWithDetails extends MaintenanceEntry {
  itemID: string;
  itemName: string;
}

export interface MaintenanceEntryCreate {
  name: string;
  description: string;
  cost: number;
  scheduledDate: string;
}

export interface MaintenanceEntryUpdate {
  name: string;
  description: string;
  cost: number;
  scheduledDate: string;
  completedDate?: string;
}

export enum MaintenanceFilterStatus {
  Scheduled = "scheduled",
  Completed = "completed",
  Both = "both",
}

export interface MaintenanceFilters {
  status?: MaintenanceFilterStatus;
}

export class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
      if (DEBUG && this.token) {
        console.log("🔄 Token loaded from localStorage:", this.token.substring(0, 20) + "...");
      }
    }
  }

  setToken(token: string) {
    // Remove "Bearer " prefix if present (backend sends it with the prefix)
    const cleanToken = token.replace(/^Bearer\s+/i, "");
    this.token = cleanToken;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", cleanToken);
      if (DEBUG) {
        console.log("✅ Token saved:", cleanToken.substring(0, 20) + "...");
      }
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
      if (DEBUG) {
        console.log("🔐 Sending Authorization header:", `Bearer ${this.token.substring(0, 20)}...`);
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      let data: any = {};
      
      try {
        const text = await response.text();
        if (text) {
          data = JSON.parse(text);
          // Extract better error message from response
          if (typeof data === 'string') {
            errorMessage = data;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (data.message) {
            errorMessage = data.message;
          }
          
          // Handle specific error cases
          if (errorMessage.includes("UNIQUE constraint failed") && errorMessage.includes("email")) {
            errorMessage = "This email is already registered. Please login instead.";
          }
        }
      } catch (e) {
        // If JSON parsing fails, use statusText
      }
      
      throw new ApiError(response.status, errorMessage, data);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<AuthTokens> {
    const response = await this.post<AuthTokens>("/users/login", {
      username,
      password,
    });
    this.setToken(response.token);
    return response;
  }

  async register(
    username: string,
    email: string,
    password: string,
    name: string
  ): Promise<void> {
    // Registration endpoint returns 204 No Content
    await this.post("/users/register", {
      name,
      email,
      password,
      token: "", // Empty string for creating new group
    });
    // Registration successful, but doesn't return token
    // User must login after registration
  }

  async logout(): Promise<void> {
    await this.post("/users/logout");
    this.clearToken();
  }

  async getSelf(): Promise<User> {
    const response = await this.get<{ item: User }>("/users/self");
    return response.item;
  }

  async refreshToken(): Promise<AuthTokens> {
    const response = await this.get<AuthTokens>("/users/refresh");
    this.setToken(response.token);
    return response;
  }

  // Statistics endpoints
  async getGroupStatistics(): Promise<GroupStatistics> {
    return this.get<GroupStatistics>("/groups/statistics");
  }

  // Items endpoints
  async getItems(params?: ItemsQuery): Promise<ItemsPagination> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params?.orderBy) query.append("orderBy", params.orderBy);
    if (params?.search) query.append("q", params.search);
    if (params?.locations) {
      params.locations.forEach(loc => query.append("locations", loc));
    }
    if (params?.labels) {
      params.labels.forEach(label => query.append("labels", label));
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return this.get<ItemsPagination>(`/items${queryString}`);
  }

  async getItem(id: string): Promise<Item> {
    return this.get<Item>(`/items/${id}`);
  }

  async createItem(data: ItemCreate): Promise<Item> {
    return this.post<Item>("/items", data);
  }

  async updateItem(id: string, data: Partial<ItemCreate>): Promise<Item> {
    return this.put<Item>(`/items/${id}`, data);
  }

  async deleteItem(id: string): Promise<void> {
    return this.delete<void>(`/items/${id}`);
  }

  async uploadItemAttachment(itemId: string, file: File, type: string = "photo", primary: boolean = false): Promise<Item> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name); // Required by backend
    formData.append("type", type);
    formData.append("primary", primary.toString());

    const response = await fetch(`${API_URL}/items/${itemId}/attachments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Failed to upload attachment";
      try {
        const errorData = await response.text();
        if (errorData) {
          errorMessage = errorData;
        }
      } catch (e) {
        // ignore
      }
      throw new ApiError(response.status, errorMessage);
    }

    return response.json();
  }

  async deleteItemAttachment(itemId: string, attachmentId: string): Promise<void> {
    return this.delete<void>(`/items/${itemId}/attachments/${attachmentId}`);
  }

  getItemAttachmentUrl(itemId: string, attachmentId: string): string {
    return `${API_URL}/items/${itemId}/attachments/${attachmentId}?access_token=${this.token}`;
  }

  // Locations endpoints
  async getLocations(): Promise<Location[]> {
    return this.get<Location[]>("/locations");
  }

  async getLocation(id: string): Promise<Location> {
    return this.get<Location>(`/locations/${id}`);
  }

  async createLocation(data: LocationCreate): Promise<Location> {
    return this.post<Location>("/locations", data);
  }

  async updateLocation(id: string, data: Partial<LocationCreate>): Promise<Location> {
    return this.put<Location>(`/locations/${id}`, data);
  }

  async deleteLocation(id: string): Promise<void> {
    return this.delete<void>(`/locations/${id}`);
  }

  // Labels endpoints
  async getLabels(): Promise<Label[]> {
    return this.get<Label[]>("/labels");
  }

  async getLabel(id: string): Promise<Label> {
    return this.get<Label>(`/labels/${id}`);
  }

  async createLabel(data: LabelCreate): Promise<Label> {
    return this.post<Label>("/labels", data);
  }

  async updateLabel(id: string, data: Partial<LabelCreate>): Promise<Label> {
    return this.put<Label>(`/labels/${id}`, data);
  }

  async deleteLabel(id: string): Promise<void> {
    return this.delete<void>(`/labels/${id}`);
  }

  // Label printing endpoints
  getItemLabelUrl(itemId: string, print: boolean = false): string {
    return `${API_URL}/labelmaker/item/${itemId}?print=${print}&access_token=${this.token}`;
  }

  getLocationLabelUrl(locationId: string, print: boolean = false): string {
    return `${API_URL}/labelmaker/location/${locationId}?print=${print}&access_token=${this.token}`;
  }

  getAssetLabelUrl(assetId: string, print: boolean = false): string {
    return `${API_URL}/labelmaker/assets/${assetId}?print=${print}&access_token=${this.token}`;
  }

  async printItemLabel(itemId: string): Promise<void> {
    await fetch(this.getItemLabelUrl(itemId, true));
  }

  async printLocationLabel(locationId: string): Promise<void> {
    await fetch(this.getLocationLabelUrl(locationId, true));
  }

  async printAssetLabel(assetId: string): Promise<void> {
    await fetch(this.getAssetLabelUrl(assetId, true));
  }

  // Maintenance endpoints
  async getAllMaintenance(filters?: MaintenanceFilters): Promise<MaintenanceEntryWithDetails[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.append("status", filters.status);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return this.get<MaintenanceEntryWithDetails[]>(`/maintenance${queryString}`);
  }

  async getItemMaintenance(itemId: string, filters?: MaintenanceFilters): Promise<MaintenanceEntry[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.append("status", filters.status);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return this.get<MaintenanceEntry[]>(`/items/${itemId}/maintenance${queryString}`);
  }

  async createMaintenance(itemId: string, data: MaintenanceEntryCreate): Promise<MaintenanceEntry> {
    return this.post<MaintenanceEntry>(`/items/${itemId}/maintenance`, data);
  }

  async updateMaintenance(entryId: string, data: MaintenanceEntryUpdate): Promise<MaintenanceEntry> {
    return this.put<MaintenanceEntry>(`/maintenance/${entryId}`, data);
  }

  async deleteMaintenance(entryId: string): Promise<void> {
    return this.delete<void>(`/maintenance/${entryId}`);
  }
}

export const apiClient = new ApiClient();

