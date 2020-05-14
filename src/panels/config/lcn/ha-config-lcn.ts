import "@material/mwc-button";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
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

          <ha-fab
            icon="hass:plus"
            aria-label="New device or entity"
            title="New device or entity"
            @click=${this._createItem}
            ?is-wide=${this.isWide}
            ?narrow=${this.narrow}
            ?rtl=${computeRTL(this.hass!)}
            --
          >
            ></ha-fab
          >
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
    this._device_configs = await scanDevices(this.hass!, this.host);
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
        ha-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1;
        }
        ha-fab[is-wide] {
          bottom: 24px;
          right: 24px;
        }
        ha-fab[narrow] {
          bottom: 84px;
        }
        ha-fab[rtl] {
          right: auto;
          left: 16px;
        }
        ha-fab[is-wide].rtl {
          bottom: 24px;
          left: 24px;
          right: auto;
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
