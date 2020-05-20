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
import { fetchConfig, LcnDeviceConfig } from "../../../data/lcn";

@customElement("lcn-device-page")
export class LCNDevicePage extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide?: boolean;

  @property() public narrow?: boolean;

  @property() public unique_device_id?: string;

  @property() public host!: string;

  @property() private _device_configs: LcnDeviceConfig[] = [];

  @property() private _device_config!: LcnDeviceConfig;

  protected firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.addEventListener("lcn-configuration-changed", async (event) => {
      this._fetchConfig(this.host);
    });
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("host")) {
      this._fetchConfig(this.host);
    }
    super.update(changedProperties);
  }

  protected render(): TemplateResult {
    if (!this._device_config) {
      return html` <hass-loading-screen></hass-loading-screen> `;
    }

    return html`
      <hass-subpage
        .header=${html`
          Entities of ${this._device_config.is_group ? "group" : "module"}
          (${this.host}, ${this._device_config.segment_id},
          ${this._device_config.address_id})
          ${this._device_config.name ? " - " + this._device_config.name : ""}
        `}
      >
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <lcn-entities-data-table
            .hass=${this.hass}
            .host=${this.host}
            .device=${this._device_config}
          ></lcn-entities-data-table>
        </ha-config-section>
      </hass-subpage>
    `;
  }

  private async _fetchConfig(host: string) {
    console.log(this.hass);
    this._device_configs = await fetchConfig(this.hass!, host);
    this._device_config = this._device_configs.find(
      (device) => device.unique_id == this.unique_device_id
    )!;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-device-page": LCNDevicePage;
  }
}
