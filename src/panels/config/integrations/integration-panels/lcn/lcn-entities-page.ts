import "@material/mwc-fab";
import {
  css,
  customElement,
  LitElement,
  property,
  TemplateResult,
  CSSResult,
} from "lit-element";
import { html } from "lit-html";
import { HomeAssistant, Route } from "../../../../../types";
import { computeRTL } from "../../../../../common/util/compute_rtl";
import "../../../../../layouts/hass-tabs-subpage";
import type { PageNavigation } from "../../../../../layouts/hass-tabs-subpage";
import "../../../ha-config-section";
import "../../../../../layouts/hass-loading-screen";
import "../../../../../components/ha-card";
import "../../../../../components/ha-svg-icon";
import { haStyle } from "../../../../../resources/styles";
import { mdiPlus } from "@mdi/js";
import "./lcn-entities-data-table";
import {
  fetchHosts,
  fetchEntities,
  fetchDevice,
  addEntity,
  LcnDeviceConfig,
  LcnEntityConfig,
  LcnHost,
  LcnAddress,
} from "../../../../../data/lcn";
import {
  loadLCNCreateEntityDialog,
  showLCNCreateEntityDialog,
} from "./dialogs/show-dialog-create-entity";
import { showAlertDialog } from "../../../../../dialogs/generic/show-dialog-box";

export const lcnTabs: PageNavigation[] = [];

@customElement("lcn-entities-page")
export class LCNEntitiesPage extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() public route!: Route;

  @property() public address!: LcnAddress;

  @property() public hostId!: string;

  @property() private _host!: LcnHost;

  @property() private _hosts: LcnHost[] = [];

  @property() private _deviceConfig!: LcnDeviceConfig;

  @property() private _entityConfigs: LcnEntityConfig[] = [];

  protected async firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    loadLCNCreateEntityDialog();

    await this._fetchHosts();
    this._host = this._hosts.find((host) => {
      return host.id === this.hostId;
    })!;

    this._fetchEntities(this._host.id, this.address);
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
        back-path="/config/lcn"
        .tabs=${lcnTabs}
      >
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <span slot="header">
            Device configuration
          </span>

          <span slot="introduction">
            Configure entities for this device.
          </span>

          <ha-card
            header="Entities for ${this._deviceConfig.address[2]
              ? "group"
              : "module"}
              (${this._host.name}, ${this._deviceConfig.address[0]},
              ${this._deviceConfig.address[1]})
              ${this._deviceConfig.name ? " - " + this._deviceConfig.name : ""}
            "
          >
            <lcn-entities-data-table
              .hass=${this.hass}
              .host=${this._host}
              .entities=${this._entityConfigs}
              .device=${this._deviceConfig}
              .narrow=${this.narrow}
              @lcn-configuration-changed=${(ev) =>
                this._fetchEntities(this._host.id, this.address)}
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

  private async _fetchHosts() {
    this._hosts = await fetchHosts(this.hass!);
  }

  private async _fetchEntities(host: string, address: LcnAddress) {
    this._deviceConfig = await fetchDevice(this.hass!, host, address);
    this._entityConfigs = await fetchEntities(this.hass!, host, address);
  }

  private async _addEntity() {
    showLCNCreateEntityDialog(this, {
      device: <LcnDeviceConfig>this._deviceConfig,
      createEntity: async (entityParams) => {
        if (!(await addEntity(this.hass, this._host.id, entityParams))) {
          await showAlertDialog(this, {
            title: "LCN resource already assigned",
            text: `The specified LCN resource is already
                   assigned to an entity within the ${entityParams.domain}-domain.
                   LCN resources may only be assigned once within a domain.`,
          });
          return;
        }
        await this._fetchEntities(this._host.id, this.address);
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
    "lcn-entities-page": LCNEntitiesPage;
  }
}