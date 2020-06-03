import "@material/mwc-fab";
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
import { computeRTL } from "../../../common/util/compute_rtl";
import "../../../layouts/hass-subpage";
import "../ha-config-section";
import "../../../layouts/hass-loading-screen";
import "../../../components/ha-card";
import "../../../components/ha-svg-icon";
import { haStyle } from "../../../resources/styles";
import { mdiPlus } from "@mdi/js";
import {
  fetchEntities,
  fetchDevice,
  addEntity,
  LcnDeviceConfig,
  LcnEntityConfig,
} from "../../../data/lcn";
import {
  loadLCNCreateEntityDialog,
  showLCNCreateEntityDialog,
} from "./dialogs/show-dialog-create-entity";

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
    loadLCNCreateEntityDialog();
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

          <mwc-fab
            aria-label="Create new entity"
            title="Create new entity"
            @click=${this._addEntity}
            ?is-wide=${this.isWide}
            ?narrow=${this.narrow}
            ?rtl=${computeRTL(this.hass!)}
          >
            <ha-svg-icon slot="icon" path=${mdiPlus}></ha-svg-icon>
          </mwc-fab>
        </ha-config-section>
      </hass-subpage>
    `;
  }

  private _dispatchConfigurationChangedEvent() {
    this.dispatchEvent(
      new CustomEvent("lcn-configuration-changed", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _fetchEntities(host: string, unique_device_id: string) {
    this._device_config = await fetchDevice(this.hass!, host, unique_device_id);
    this._entity_configs = await fetchEntities(
      this.hass!,
      host,
      unique_device_id
    );
  }

  private async _addEntity() {
    showLCNCreateEntityDialog(this, {
      device: <LcnDeviceConfig>this._device_config,
      createEntity: async (entity_params) => {
        await addEntity(this.hass, this.host, entity_params);
        this._dispatchConfigurationChangedEvent();
      },
    });
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      css`
        mwc-fab {
          position: fixed;
          bottom: 16px;
          right: 16px;
          z-index: 1;
        }

        mwc-fab[is-wide] {
          bottom: 24px;
          right: 24px;
        }
        mwc-fab[narrow] {
          bottom: 84px;
        }

        mwc-fab[rtl] {
          right: auto;
          left: 16px;
        }
        mwc-fab[rtl][is-wide] {
          bottom: 24px;
          right: auto;
          left: 24px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-device-page": LCNDevicePage;
  }
}
