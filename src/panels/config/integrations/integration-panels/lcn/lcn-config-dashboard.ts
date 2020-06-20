import "@material/mwc-button";
import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-spinner/paper-spinner";
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
import { HomeAssistant } from "../../../../../types";
import { computeRTL } from "../../../../../common/util/compute_rtl";
import { showAlertDialog } from "../../../../../dialogs/generic/show-dialog-box";
import "../../../../../layouts/hass-tabs-subpage";
import { configSections } from "../../../ha-panel-config";
import "../../../ha-config-section";
import "../../../../../layouts/hass-loading-screen";
import "../../../../../components/ha-card";
import "../../../../../components/ha-svg-icon";
import { haStyle } from "../../../../../resources/styles";
import { mdiPlus } from "@mdi/js";
import { ScanModulesDialog } from "./dialogs/lcn-scan-modules-dialog";
import {
  loadLCNScanModulesDialog,
  showLCNScanModulesDialog,
} from "./dialogs/show-dialog-scan-modules";
import {
  loadLCNCreateDeviceDialog,
  showLCNCreateDeviceDialog,
} from "./dialogs/show-dialog-create-device";
import "./lcn-devices-data-table";
import {
  fetchHosts,
  fetchDevices,
  scanDevices,
  addDevice,
  LcnHosts,
  LcnDeviceConfig,
} from "../../../../../data/lcn";
import { Route } from "workbox-routing";

@customElement("lcn-config-dashboard")
export class LCNConfigDashboard extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() public route!: Route;

  @property() private _hosts: LcnHosts[] = [];

  @property() private host: string = "";

  @property() private _deviceConfigs: LcnDeviceConfig[] = [];

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    this._fetchHosts();
    loadLCNScanModulesDialog();
    loadLCNCreateDeviceDialog();

    this.addEventListener("lcn-config-changed", async (event) => {
      this._fetchDevices(this.host);
    });
  }

  protected render(): TemplateResult {
    if (!this.hass) {
      return html` <hass-loading-screen></hass-loading-screen> `;
    }
    const hass = this.hass;
    return html`
      <hass-tabs-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this.route}
        back-path="/config"
        .tabs=${configSections.general}
        .header=${hass.localize("ui.panel.config.lcn.title")}
      >
        <ha-card header="LCN Configuration">
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
              .devices=${this._deviceConfigs}
              .narrow=${this.narrow}
            ></lcn-devices-data-table>
          </div>

          <mwc-fab
            aria-label="Create new module/group"
            title="Create new module/group"
            @click=${this._addDevice}
            ?is-wide=${this.isWide}
            ?narrow=${this.narrow}
            ?rtl=${computeRTL(this.hass!)}
          >
            <ha-svg-icon slot="icon" path=${mdiPlus}></ha-svg-icon>
          </mwc-fab>
        </ha-card>
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
    this._deviceConfigs = await fetchDevices(this.hass!, host);
  }

  private async _scanDevices(host: string) {
    const dialog: () =>
      | ScanModulesDialog
      | undefined = showLCNScanModulesDialog(this);
    this._deviceConfigs = await scanDevices(this.hass!, this.host);
    dialog()!.closeDialog();
  }

  private _addDevice() {
    showLCNCreateDeviceDialog(this, {
      createDevice: async (deviceParams) => {
        if (!(await addDevice(this.hass, this.host, deviceParams))) {
          await showAlertDialog(this, {
            title: "Device already exists",
            text: `The specified
                  ${deviceParams.is_group ? "group" : "module"}
                  with address ${deviceParams.address_id}
                  in segment ${deviceParams.segment_id}
                  already exists.
                  Devices have to be unique.`,
          });
          return;
        }
        this._fetchDevices(this.host);
      },
    });
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      css`
        ha-card {
          margin: auto;
          margin-top: 16px;
          max-width: 95%;
        }
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
    "lcn-config-dashboard": LCNConfigDashboard;
  }
}
