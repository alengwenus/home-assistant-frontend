import { HassEntity } from "home-assistant-js-websocket";
import { HomeAssistant } from "../types";
import { IntegrationManifest } from "./integration";

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
  platform: string;
  platform_data: [SwitchConfig | LightConfig];
}

export interface LcnDeviceConfig {
  name: string;
  segment_id: number;
  address_id: number;
  is_group: boolean;
  entities: [LcnEntityConfig];
}

export const fetchHosts = (hass: HomeAssistant): Promise<LcnHosts[]> =>
  hass.callWS({
    type: "lcn/hosts",
  });

export const fetchConfig = (
  hass: HomeAssistant,
  host: string
): Promise<LcnDeviceConfig[]> =>
  hass.callWS({
    type: "lcn/config",
    host: host,
  });
