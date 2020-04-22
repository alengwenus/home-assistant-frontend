import { HassEntity } from "home-assistant-js-websocket";
import { HomeAssistant } from "../types";

export interface LcnModule {
  name: string;
}

export const fetchModules = (hass: HomeAssistant): Promise<LcnModule[]> =>
  hass.callWS({
    type: "lcn/modules",
  });
