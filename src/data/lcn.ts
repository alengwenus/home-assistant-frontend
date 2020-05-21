import { HomeAssistant } from "../types";

export interface LcnHosts {
  name: string;
  ip_address: string;
  port: number;
}

export interface SwitchConfig {
  output: string;
}

export interface LightConfig {
  output: string;
  dimmable?: boolean;
  transition?: number;
}

export interface LcnEntityConfig {
  name: string;
  unique_id: string;
  unique_device_id: string;
  platform: string;
  resource: string;
  platform_data: SwitchConfig[] | LightConfig[];
}

export interface LcnDeviceConfig {
  name: string;
  unique_id: string;
  segment_id: number;
  address_id: number;
  is_group: boolean;
  hardware_serial: number;
  software_serial: number;
  hardware_type: number;
}

export const fetchHosts = (hass: HomeAssistant): Promise<LcnHosts[]> =>
  hass.callWS({
    type: "lcn/hosts",
  });

export const fetchDevices = (
  hass: HomeAssistant,
  host: string
): Promise<LcnDeviceConfig[]> =>
  hass.callWS({
    type: "lcn/devices",
    host: host,
  });

export const fetchEntities = (
  hass: HomeAssistant,
  host: string,
  unique_device_id: string
): Promise<LcnEntityConfig[]> =>
  hass.callWS({
    type: "lcn/entities",
    host: host,
    unique_device_id: unique_device_id,
  });

export const scanDevices = (
  hass: HomeAssistant,
  host: string
): Promise<LcnDeviceConfig[]> =>
  hass.callWS({
    type: "lcn/device/scan",
    host: host,
  });

export const deleteEntity = (
  hass: HomeAssistant,
  host: string,
  entity: LcnEntityConfig
): Promise<void> =>
  hass.callWS({
    type: "lcn/entity/delete",
    host: host,
    unique_id: entity.unique_id,
  });

export const deleteDevice = (
  hass: HomeAssistant,
  host: string,
  device: LcnDeviceConfig
): Promise<void> =>
  hass.callWS({
    type: "lcn/device/delete",
    host: host,
    unique_id: device.unique_id,
  });
