import "@material/mwc-fab";
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
import { HomeAssistant, Route } from "../../../../../types";
import { computeRTL } from "../../../../../common/util/compute_rtl";
import "../../../../../layouts/hass-tabs-subpage";
import { configSections } from "../../../ha-panel-config";
import "../../../ha-config-section";
import "../../../../../layouts/hass-loading-screen";
import "../../../../../components/ha-card";
import "../../../../../components/ha-svg-icon";
import { haStyle } from "../../../../../resources/styles";
import { mdiPlus } from "@mdi/js";
import "./lcn-entities-data-table";
import {
  fetchEntities,
  fetchDevice,
  addEntity,
  LcnDeviceConfig,
  LcnEntityConfig,
} from "../../../../../data/lcn";
import {
  loadLCNCreateEntityDialog,
  showLCNCreateEntityDialog,
} from "./dialogs/show-dialog-create-entity";
import { showAlertDialog } from "../../../../../dialogs/generic/show-dialog-box";

@customElement("lcn-device-page")
export class LCNDevicePage extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() public route!: Route;

  @property() public uniqueDeviceId!: string;

  @property() public host!: string;

  // @property() private _device_configs: LcnDeviceConfig[] = [];

  @property() private _deviceConfig!: LcnDeviceConfig;

  @property() private _entityConfigs: LcnEntityConfig[] = [];

  protected firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    this.addEventListener("lcn-configuration-changed", async (event) => {
      this._fetchEntities(this.host, this.uniqueDeviceId);
    });
    loadLCNCreateEntityDialog();
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("host")) {
      this._fetchEntities(this.host, this.uniqueDeviceId);
    }
    super.update(changedProperties);
  }

  protected render(): TemplateResult {
    if (!this._deviceConfig && this._entityConfigs.length == 0) {
      return html` <hass-loading-screen></hass-loading-screen> `;
    }
    return html`
      <hass-tabs-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this.route}
        .back-path="/config/lcn"
        .tabs=${configSections.general}
      >
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <span slot="header">
            Device configuration
          </span>

          <span slot="introduction">
            Configure entities for this device.
          </span>

          <ha-card
            header="Entities for ${this._deviceConfig.is_group
              ? "group"
              : "module"}
              (${this.host}, ${this._deviceConfig.segment_id},
              ${this._deviceConfig.address_id})
              ${this._deviceConfig.name ? " - " + this._deviceConfig.name : ""}
            "
          >
            <lcn-entities-data-table
              .hass=${this.hass}
              .host=${this.host}
              .entities=${this._entityConfigs}
              .device=${this._deviceConfig}
              .narrow=${this.narrow}
            ></lcn-entities-data-table>
          </ha-card>

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
      </hass-tabs-subpage>
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

  private async _fetchEntities(host: string, uniqueDeviceId: string) {
    this._deviceConfig = await fetchDevice(this.hass!, host, uniqueDeviceId);
    this._entityConfigs = await fetchEntities(this.hass!, host, uniqueDeviceId);
  }

  private async _addEntity() {
    showLCNCreateEntityDialog(this, {
      device: <LcnDeviceConfig>this._deviceConfig,
      createEntity: async (entityParams) => {
        if (!(await addEntity(this.hass, this.host, entityParams))) {
          await showAlertDialog(this, {
            title: "LCN resource already assigned",
            text: `The specified LCN resource is already
                   assigned to an entity within the ${entityParams.domain}-domain.
                   LCN resources may only be assigned once within a domain.`,
          });
          return;
        }
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
