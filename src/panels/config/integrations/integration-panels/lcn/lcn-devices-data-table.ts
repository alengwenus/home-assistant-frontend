import "@polymer/paper-tooltip/paper-tooltip";
import {
  css,
  customElement,
  CSSResult,
  LitElement,
  property,
  query,
} from "lit-element";
import memoizeOne from "memoize-one";
import { html } from "lit-html";
import { HomeAssistant, Route } from "../../../../../types";
import { showConfirmationDialog } from "../../../../../dialogs/generic/show-dialog-box";
import { navigate } from "../../../../../common/navigate";
import {
  LcnDeviceConfig,
  deleteDevice,
  LcnHost,
} from "../../../../../data/lcn";
import "../../../../../components/ha-icon-button";
import { loadLCNCreateDeviceDialog } from "./dialogs/show-dialog-create-device";
import "../../../../../components/data-table/ha-data-table";
import {
  DataTableColumnContainer,
  HaDataTable,
} from "../../../../../components/data-table/ha-data-table";

export interface DeviceRowData extends LcnDeviceConfig {}

@customElement("lcn-devices-data-table")
export class LCNDevicesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() public route!: Route;

  @property() public host!: LcnHost;

  @property() public devices: LcnDeviceConfig[] = [];

  @query("ha-data-table") private _dataTable!: HaDataTable;

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
            unique_id: {
              title: "",
              sortable: false,
              width: "60px",
              template: (unique_id: string) =>
                html`
                  <ha-icon-button
                    title="Delete LCN device"
                    icon="hass:delete"
                    @click=${(ev) => {
                      ev.stopPropagation();
                      this._deleteDevice(unique_id);
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
        .id=${"unique_id"}
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

  private _openDevice(uniqueId) {
    navigate(this, `/config/lcn/device/${uniqueId}`);
  }

  private async _deleteDevice(uniqueId: string) {
    const device = this.devices.find(
      (device) => device.unique_id === uniqueId
    )!;

    if (
      !(await showConfirmationDialog(this, {
        title: `Delete
          ${device.is_group ? "group" : "module"}`,
        text: html` You are about to remove
          ${device.is_group ? "group" : "module"} ${device.address_id} in
          segment ${device.segment_id}
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
