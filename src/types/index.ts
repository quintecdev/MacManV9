export type DeviceStatus = 'online' | 'offline' | 'warning' | 'updating';

export interface Device {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  osVersion: string;
  status: DeviceStatus;
  lastSeen: string;
  ipAddress: string;
  owner: string;
  department: string;
  storageUsed: number;
  storageTotal: number;
  batteryLevel: number | null;
}

export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  warningDevices: number;
  updatingDevices: number;
  pendingUpdates: number;
}

export type RootTabParamList = {
  Dashboard: undefined;
  Devices: undefined;
  Alerts: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  DeviceDetail: { device: Device };
};
