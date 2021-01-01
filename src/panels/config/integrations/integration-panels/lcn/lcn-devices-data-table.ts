import "@polymer/paper-tooltip/paper-tooltip";
import { customElement, LitElement, property } from "lit-element";
import memoizeOne from "memoize-one";
import { html } from "lit-html";
import { HomeAssistant, Route } from "../../../../../types";
import { showConfirmationDialog } from "../../../../../dialogs/generic/show-dialog-box";
import { navigate } from "../../../../../common/navigate";
import {
  LcnDeviceConfig,
  deleteDevice,
  LcnHost,
  LcnAddress,
  createAddressString,
} from "../../../../../data/lcn";
import "../../../../../components/ha-icon-button";
import { loadLCNCreateDeviceDialog } from "./dialogs/show-dialog-create-device";
import "../../../../../components/data-table/ha-data-table";
import { DataTableColumnContainer } from "../../../../../components/data-table/ha-data-table";

export interface DeviceRowData extends LcnDeviceConfig {}

@customElement("lcn-devices-data-table")
export class LCNDevicesDataTable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() public route!: Route;

  @property() public host!: LcnHost;

  @property() public devices: LcnDeviceConfig[] = [];

  private _devices = memoizeOne((devices: LcnDeviceConfig[]) => {
    let deviceRowData: DeviceRowData[] = devices;

    deviceRowData = devices.map((device) => {
      return {
        ...device,
      };
    });
    return deviceRowData;
  });

  private _columns = memoizeOne(
    (narrow: boolean): DataTableColumnContainer =>
      narrow
        ? {
            name: {
              title: "Name",
              sortable: true,
              direction: "asc",
              grows: true,
            },
          }
        : {
            name: {
              title: "Name",
              sortable: true,
              direction: "asc",
              grows: true,
            },
            segment_id: {
              title: "Segment",
              sortable: true,
              width: "90px",
            },
            address_id: {
              title: "ID",
              sortable: true,
              width: "90px",
            },
            is_group: {
              title: "Group",
              sortable: true,
              width: "90px",
            },
            address: {
              title: "",
              sortable: false,
              width: "60px",
              template: (address: LcnAddress) =>
                html`
                  <ha-icon-button
                    title="Delete LCN device"
                    icon="hass:delete"
                    @click=${(ev) => {
                      ev.stopPropagation();
                      this._deleteDevice(address);
                    }}
                  ></ha-icon-button>
                `,
            },
          }
  );

  protected firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    loadLCNCreateDeviceDialog();
  }

  protected render() {
    return html`
      <ha-data-table
        .columns=${this._columns(this.narrow)}
        .data=${this._devices(this.devices)}
        .id=${"address"}
        @row-click=${(ev) => this._openDevice(ev.detail.id)}
        auto-height
      ></ha-data-table>
    `;
  }

  private _dispatchConfigurationChangedEvent() {
    this.dispatchEvent(
      new CustomEvent("lcn-config-changed", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _openDevice(address) {
    // convert address tuple into string (e.g. m000007) for use in url
    const addressString = createAddressString(address);
    navigate(this, `/config/lcn/entities/${this.host.id}/${addressString}`);
  }

  private async _deleteDevice(address: LcnAddress) {
    const device = this.devices.find(
      (device) =>
        device.address[0] === address[0] &&
        device.address[1] === address[1] &&
        device.address[2] === address[2]
    )!;

    if (
      !(await showConfirmationDialog(this, {
        title: `Delete
          ${device.address[2] ? "group" : "module"}`,
        text: html` You are about to remove
          ${device.address[2] ? "group" : "module"} ${device.address[1]} in
          segment ${device.address[0]}
          ${device.name ? `('${device.name}')` : ""}.<br />
          Removing a device will also delete all associated entities!`,
      }))
    ) {
      return;
    }

    await deleteDevice(this.hass, this.host.id, device);
    this._dispatchConfigurationChangedEvent();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-devices-data-table": LCNDevicesDataTable;
  }
}
