import {
  css,
  customElement,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
  query,
} from "lit-element";
import { html } from "lit-html";
import memoizeOne from "memoize-one";
import { HomeAssistant } from "../../../types";
import "../../../components/data-table/ha-data-table";
import type {
  DataTableColumnContainer,
  DataTableRowData,
  HaDataTable,
} from "../../../components/data-table/ha-data-table";
import { LcnDeviceConfig } from "../../../data/lcn";

export interface DeviceRowData extends LcnDeviceConfig {
  device?: DeviceRowData;
}

@customElement("lcn-devices-data-table")
export class LCNDevicesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property({ type: Boolean }) public selectable = false;

  @property() public devices: LcnDeviceConfig[] = [];

  @query("ha-data-table") private _dataTable!: HaDataTable;

  private _devices = memoizeOne((devices: LcnDeviceConfig[]) => {
    let outputDevices: DeviceRowData[] = devices;

    outputDevices = outputDevices.map((device) => {
      return {
        ...device,
        name: device.name,
        segment_id: device.segment_id,
        address_id: device.address_id,
      };
    });

    return outputDevices;
  });

  private _columns = memoizeOne(
    (narrow: boolean): DataTableColumnContainer =>
      narrow
        ? {
            name: {
              title: "Name",
              sortable: true,
              filterable: false,
              direction: "asc",
              grows: true,
            },
          }
        : {
            segment_id: {
              title: "Segment",
              sortable: true,
              filterable: false,
              grows: false,
              width: "90px",
            },
            address_id: {
              title: "ID",
              sortable: true,
              filterable: false,
              grows: false,
              width: "90px",
            },
            name: {
              title: "Name",
              sortable: true,
              filterable: false,
              grows: false,
            },
          }
  );

  public clearSelection() {
    this._dataTable.clearSelection();
  }

  protected render() {
    return html`
        <ha-data-table
          .columns=${this._columns(this.narrow)}
          .data=${this._devices(this.devices)}
          .selectable=${this.selectable}
          .noDataText=${"No devices configured"}
          auto-height
        ></hass-data-table>
      `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-devices-data-table": LCNDevicesDataTable;
  }
}
