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
  domain: string;
  resource: string;
  domain_data: SwitchConfig[] | LightConfig[];
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

export const fetchDevice = (
  hass: HomeAssistant,
  host: string,
  unique_device_id: string
): Promise<LcnDeviceConfig> =>
  hass.callWS({
    type: "lcn/device",
    host: host,
    unique_device_id: unique_device_id,
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

export const addEntity = (
  hass: HomeAssistant,
  host: string,
  entity: Partial<LcnEntityConfig>
): Promise<boolean> =>
  hass.callWS({
    type: "lcn/entity/add",
    host: host,
    unique_device_id: entity.unique_device_id,
    name: entity.name,
    domain: entity.domain,
    domain_data: entity.domain_data,
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

export const addDevice = (
  hass: HomeAssistant,
  host: string,
  device: Partial<LcnDeviceConfig>
): Promise<boolean> =>
  hass.callWS({
    type: "lcn/device/add",
    host: host,
    segment_id: device.segment_id,
    address_id: device.address_id,
    is_group: device.is_group,
    name: device.name,
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
