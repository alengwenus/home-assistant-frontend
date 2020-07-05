import { HomeAssistant } from "../types";

export interface LcnHost {
  name: string;
  id: string;
  ip_address: string;
  port: number;
}

export interface BinarySensorConfig {
  source: string;
}

export interface ClimateConfig {
  source: string;
  setpoint: string;
  max_temp: number;
  min_temp: number;
  lockable: boolean;
  unit_of_measurement: string;
}

export interface CoverConfig {
  motor: string;
  reverse_time: string;
}

export interface LightConfig {
  output: string;
  dimmable: boolean;
  transition: number;
}

export interface SensorConfig {
  source: string;
  unit_of_measurement: string;
}

export interface SwitchConfig {
  output: string;
}

export interface LcnEntityConfig {
  name: string;
  unique_id: string;
  unique_device_id: string;
  domain: string;
  resource: string;
  domain_data: CoverConfig[] | LightConfig[] | SensorConfig[] | SwitchConfig[];
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

export const fetchHosts = (hass: HomeAssistant): Promise<LcnHost[]> =>
  hass.callWS({
    type: "lcn/hosts",
  });

export const fetchDevices = (
  hass: HomeAssistant,
  hostId: string
): Promise<LcnDeviceConfig[]> =>
  hass.callWS({
    type: "lcn/devices",
    host_id: hostId,
  });

export const fetchDevice = (
  hass: HomeAssistant,
  hostId: string,
  uniqueDeviceId: string
): Promise<LcnDeviceConfig> =>
  hass.callWS({
    type: "lcn/device",
    host_id: hostId,
    unique_device_id: uniqueDeviceId,
  });

export const fetchEntities = (
  hass: HomeAssistant,
  hostId: string,
  uniqueDeviceId: string
): Promise<LcnEntityConfig[]> =>
  hass.callWS({
    type: "lcn/entities",
    host_id: hostId,
    unique_device_id: uniqueDeviceId,
  });

export const scanDevices = (
  hass: HomeAssistant,
  hostId: string
): Promise<LcnDeviceConfig[]> =>
  hass.callWS({
    type: "lcn/device/scan",
    host_id: hostId,
  });

export const addEntity = (
  hass: HomeAssistant,
  hostId: string,
  entity: Partial<LcnEntityConfig>
): Promise<boolean> =>
  hass.callWS({
    type: "lcn/entity/add",
    host_id: hostId,
    unique_device_id: entity.unique_device_id,
    name: entity.name,
    domain: entity.domain,
    domain_data: entity.domain_data,
  });

export const deleteEntity = (
  hass: HomeAssistant,
  hostId: string,
  entity: LcnEntityConfig
): Promise<void> =>
  hass.callWS({
    type: "lcn/entity/delete",
    host_id: hostId,
    unique_id: entity.unique_id,
  });

export const addDevice = (
  hass: HomeAssistant,
  hostId: string,
  device: Partial<LcnDeviceConfig>
): Promise<boolean> =>
  hass.callWS({
    type: "lcn/device/add",
    host_id: hostId,
    segment_id: device.segment_id,
    address_id: device.address_id,
    is_group: device.is_group,
    name: device.name,
  });

export const deleteDevice = (
  hass: HomeAssistant,
  hostId: string,
  device: LcnDeviceConfig
): Promise<void> =>
  hass.callWS({
    type: "lcn/device/delete",
    host_id: hostId,
    unique_id: device.unique_id,
  });
