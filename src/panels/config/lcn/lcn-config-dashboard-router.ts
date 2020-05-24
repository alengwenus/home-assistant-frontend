import { customElement, property } from "lit-element";
import {
  HassRouterPage,
  RouterOptions,
} from "../../../layouts/hass-router-page";
import { HomeAssistant } from "../../../types";

@customElement("lcn-config-dashboard-router")
class LCNConfigDashboardRouter extends HassRouterPage {
  @property() public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  protected routerOptions: RouterOptions = {
    defaultPage: "devices",
    showLoading: true,
    preloadAll: true, // needed to render device page after page reload
    cacheAll: true, // needed to keep host selection after return from device page
    routes: {
      devices: {
        tag: "lcn-config-dashboard",
        load: () =>
          import(
            /* webpackChunkName: "lcn-config-devices" */ "./lcn-config-dashboard"
          ),
      },
      device: {
        tag: "lcn-device-page",
        load: () =>
          import(
            /* webpackChunkName: "lcn-devices-page" */ "./lcn-device-page"
          ),
      },
    },
  };

  protected updatePageEl(el): void {
    el.route = this.routeTail;
    el.hass = this.hass;
    el.isWide = this.isWide;
    el.narrow = this.narrow;
    if (this._currentPage === "device") {
      el.unique_device_id = this.routeTail.path.substr(1);
      el.host = el.unique_device_id.split(".")[1];
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-config-dashboard-router": LCNConfigDashboardRouter;
  }
}
