import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/iron-collapse/iron_collapse";
import {
  css,
  customElement,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
} from "lit-element";
import { html } from "lit-html";
import { HomeAssistant } from "../../../types";
import "../../../layouts/hass-subpage";
import {
  fetchHosts,
  fetchConfig,
  LcnHosts,
  LcnDeviceConfig,
} from "../../../data/lcn";

@customElement("ha-config-lcn")
export class HaConfigLcn extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() private _hosts: LcnHosts[] = [];

  @property() private _host: string = "";

  @property() private _device_configs: LcnDeviceConfig[] = [];

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.hass) {
      this._fetchHosts();
    }
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

          <ha-card>
            Hello LCN!
          </ha-card>

          <paper-dropdown-menu
            label="Hosts"
            @selected-item-changed=${this._hostChanged}>
            <paper-listbox slot="dropdown-content" selected="0">
              ${this._hosts.map((host) => {
                return html`
                  <paper-item .itemValue=${host.name}>${host.name}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>


          <paper-listbox>
            ${this._device_configs.map((device) => {
              return html`
                <paper-item .itemValue = ${device}>
                  ${device.name}
                  <iron_collapse>
                  </iron_collapse>
                </paper-item>
              `;
            })}
          </paper-listbox>

        </ha-config-section>
      </hass-subpage>
    `;
  }

  private _hostChanged(ev: CustomEvent) {
    if (!ev.detail.value) {
      return;
    }
    this._host = ev.detail.value.itemValue;
    console.log(ev.detail.value.itemValue);
    this._fetchConfig(this._host);
  }

  private async _fetchHosts() {
    this._hosts = await fetchHosts(this.hass!);
  }

  private async _fetchConfig(host: string) {
    this._device_configs = await fetchConfig(this.hass!, host);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-lcn": HaConfigLcn;
  }
}
