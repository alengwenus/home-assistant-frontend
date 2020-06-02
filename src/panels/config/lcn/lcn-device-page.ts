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
import {
  fetchEntities,
  fetchDevice,
  LcnDeviceConfig,
  LcnEntityConfig,
} from "../../../data/lcn";

@customElement("lcn-device-page")
export class LCNDevicePage extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide?: boolean;

  @property() public narrow?: boolean;

  @property() public unique_device_id!: string;

  @property() public host!: string;

  // @property() private _device_configs: LcnDeviceConfig[] = [];

  @property() private _device_config!: LcnDeviceConfig;

  @property() private _entity_configs: LcnEntityConfig[] = [];

  protected firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.addEventListener("lcn-configuration-changed", async (event) => {
      this._fetchEntities(this.host, this.unique_device_id);
    });
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("host")) {
      this._fetchEntities(this.host, this.unique_device_id);
    }
    super.update(changedProperties);
  }

  protected render(): TemplateResult {
    if (!this._device_config && this._entity_configs.length == 0) {
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
            .entities=${this._entity_configs}
            .device=${this._device_config}
            .narrow=${this.narrow}
          ></lcn-entities-data-table>
        </ha-config-section>
      </hass-subpage>
    `;
  }

  private async _fetchEntities(host: string, unique_device_id: string) {
    this._device_config = await fetchDevice(this.hass!, host, unique_device_id);
    this._entity_configs = await fetchEntities(
      this.hass!,
      host,
      unique_device_id
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-device-page": LCNDevicePage;
  }
}
