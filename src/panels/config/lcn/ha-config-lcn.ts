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
} from "lit-element";
import { html } from "lit-html";
import { HomeAssistant } from "../../../types";
import "../../../layouts/hass-subpage";
import "./lcn-devices-data-table";
import "../../../components/ha-fab";
import { computeRTL } from "../../../common/util/compute_rtl";
import {
  fetchHosts,
  fetchConfig,
  scanDevices,
  LcnHosts,
  LcnDeviceConfig,
} from "../../../data/lcn";
import { haStyle } from "../../../resources/styles";

@customElement("ha-config-lcn")
export class HaConfigLCN extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() private _hosts: LcnHosts[] = [];

  @property() private host: string = "";

  @property() private _device_configs: LcnDeviceConfig[] = [];

  @property() private _scanning: boolean = false;

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.hass) {
      this._fetchHosts();
    }

    this.addEventListener("table-items-changed", async (event) => {
      this._fetchConfig(this.host);
    });
  }

  protected render(): TemplateResult {
    return html`
      <hass-subpage .header=${this.hass.localize("ui.panel.config.lcn.title")}>
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <div slot="header">
            ${this.hass.localize("ui.panel.config.lcn.header")}
          </div>

          <div slot="introduction">
            ${this.hass.localize("ui.panel.config.lcn.introduction")}
          </div>

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

            <div id="scan-devices-button">
              <mwc-button raised @click=${this._scanDevices}
                >Scan devices</mwc-button
              >
            </div>
          </div>

          <lcn-devices-data-table
            .hass=${this.hass}
            .host=${this.host}
            .devices=${this._device_configs}
            .narrow=${this.narrow}
          ></lcn-devices-data-table>
        </ha-config-section>
      </hass-subpage>
    `;
  }

  private _hostChanged(ev: CustomEvent) {
    if (!ev.detail.value) {
      return;
    }
    this.host = ev.detail.value.itemValue;
    this._fetchConfig(this.host);
  }

  private async _fetchHosts() {
    this._hosts = await fetchHosts(this.hass!);
  }

  private async _fetchConfig(host: string) {
    this._device_configs = await fetchConfig(this.hass!, host);
  }

  private async _scanDevices(host: string) {
    this._scanning = true;
    this._device_configs = await scanDevices(this.hass!, this.host);
    this._scanning = false;
  }

  private _createItem() {}

  static get styles(): CSSResult[] {
    return [
      haStyle,
      css`
        #box {
          display: flex;
          justify-content: space-between;
        }
        #hosts-dropdown {
          width: 50%;
          display: inline-block;
        }
        #scan-devices-button {
          display: inline-block;
          margin-top: 20px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-lcn": HaConfigLCN;
  }
}
