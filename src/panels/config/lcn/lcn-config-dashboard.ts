import "@material/mwc-button";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-spinner/paper-spinner";
import {
  css,
  customElement,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
  CSSResult,
  query,
} from "lit-element";
import { html } from "lit-html";
import { HomeAssistant } from "../../../types";
import "../../../layouts/hass-subpage";
import "../ha-config-section";
import "../../../layouts/hass-loading-screen";
import "../../../components/ha-card";
import "./lcn-devices-data-table";
import { ScanModulesDialog } from "./dialogs/lcn-scan-modules-dialog";
import {
  loadLCNScanModulesDialog,
  showLCNScanModulesDialog,
} from "./dialogs/show-dialog-scan-modules";

import {
  fetchHosts,
  fetchDevices,
  scanDevices,
  LcnHosts,
  LcnDeviceConfig,
} from "../../../data/lcn";
import { haStyle } from "../../../resources/styles";

@customElement("lcn-config-dashboard")
export class LCNConfigDashboard extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide?: boolean;

  @property() public narrow?: boolean;

  @property() private _hosts: LcnHosts[] = [];

  @property() private host: string = "";

  @property() private _device_configs: LcnDeviceConfig[] = [];

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    this._fetchHosts();
    loadLCNScanModulesDialog();

    this.addEventListener("lcn-configuration-changed", async (event) => {
      this._fetchDevices(this.host);
    });
  }

  protected render(): TemplateResult {
    if (!this.hass) {
      return html` <hass-loading-screen></hass-loading-screen> `;
    }
    const hass = this.hass;
    return html`
      <hass-subpage .header=${hass.localize("ui.panel.config.lcn.title")}>
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <span slot="header">
            ${hass.localize("ui.panel.config.lcn.header")}
          </span>

          <span slot="introduction">
            ${hass.localize("ui.panel.config.lcn.introduction")}
          </span>

          <div id="controls">
            <div id="box">
              <div id="hosts-dropdown">
                <paper-dropdown-menu
                  label="Hosts"
                  @selected-item-changed=${this._hostChanged}
                >
                  <paper-listbox slot="dropdown-content" selected="0">
                    ${this._hosts.map((host) => {
                      return html`
                        <paper-item .itemValue=${host.name}
                          >${host.name}</paper-item
                        >
                      `;
                    })}
                  </paper-listbox>
                </paper-dropdown-menu>
              </div>

              <div id="scan-devices">
                <mwc-button raised @click=${this._scanDevices}
                  >Scan modules</mwc-button
                >
              </div>
            </div>

            <lcn-devices-data-table
              .hass=${this.hass}
              .host=${this.host}
              .devices=${this._device_configs}
              .narrow=${this.narrow}
            ></lcn-devices-data-table>
          </div>

          <!-- <lcn-scan-modules-dialog id="scan-dialog"></lcn-scan-modules-dialog> -->
        </ha-config-section>
      </hass-subpage>
    `;
  }

  private _hostChanged(ev: CustomEvent) {
    if (!ev.detail.value) {
      return;
    }
    this.host = ev.detail.value.itemValue;
    this._fetchDevices(this.host);
  }

  private async _fetchHosts() {
    this._hosts = await fetchHosts(this.hass!);
  }

  private async _fetchDevices(host: string) {
    this._device_configs = await fetchDevices(this.hass!, host);
  }

  private async _scanDevices(host: string) {
    const dialog: () =>
      | ScanModulesDialog
      | undefined = showLCNScanModulesDialog(this);
    this._device_configs = await scanDevices(this.hass!, this.host);
    dialog()!.closeDialog();
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      css`
        .disabled {
          opacity: 0.3;
          pointer-events: none;
        }
        #box {
          display: flex;
          justify-content: space-between;
        }
        #hosts-dropdown {
          width: 50%;
          display: inline-block;
        }
        #scan-devices {
          display: inline-block;
          margin-top: 20px;
          justify-content: center;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-config-dashboard": LCNConfigDashboard;
  }
}
