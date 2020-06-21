import "@vaadin/vaadin-grid";
import { GridElement } from "@vaadin/vaadin-grid";
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
import { html, render } from "lit-html";
import { HomeAssistant } from "../../../../../types";
import { showConfirmationDialog } from "../../../../../dialogs/generic/show-dialog-box";
import { navigate } from "../../../../../common/navigate";
import { LcnDeviceConfig, deleteDevice } from "../../../../../data/lcn";
import "../../../../../components/ha-icon-button";
import { loadLCNCreateDeviceDialog } from "./dialogs/show-dialog-create-device";
import "../../../../../components/data-table/ha-data-table";
import {
  DataTableColumnContainer,
  HaDataTable,
} from "../../../../../components/data-table/ha-data-table";

export interface DeviceRowData {
  name: string;
  segment_id: number;
  address_id: number;
  is_group: boolean;
}

@customElement("lcn-devices-data-table")
export class LCNDevicesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property() public host: string = "";

  @property() public devices: LcnDeviceConfig[] = [];

  @query("vaadin-grid") private _grid!: GridElement;

  @query("ha-data-table") private _dataTable!: HaDataTable;

  private _devices = memoizeOne((devices: LcnDeviceConfig[]) => {
    let deviceRowData: DeviceRowData[] = [];

    deviceRowData = devices.map((device) => {
      return {
        name: device.name,
        segment_id: device.segment_id,
        address_id: device.address_id,
        is_group: device.is_group,
        unique_id: device.unique_id,
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
        auto-height
      ></ha-data-table>
    `;
  }

  protected render_old() {
    return html`
      <dom-module id="grid-custom-theme" theme-for="vaadin-grid">
        <template>
          <style>
            :host(.lcn-table) [part~="row"]:hover > [part~="body-cell"] {
              background-color: rgba(var(--rgb-primary-text-color), 0.04);
            }
            :host(.lcn-table) [part="row"] {
              min-height: 40;
            }
          </style>
        </template>
      </dom-module>

      <vaadin-grid
        class="lcn-table"
        height-by-rows
        multi-sort
        .items=${this.devices}
        @click="${(event) => {
          this._gridItemClicked(event);
        }}"
      >
        <vaadin-grid-column
          id="expand_item-column"
          width="80px"
          flex-grow="0"
          .renderer=${this._expandItemRenderer}
        ></vaadin-grid-column>
        <vaadin-grid-column
          id="segment-id-column"
          path="segment_id"
          header="Segment"
          width="90px"
          flex-grow="0"
        ></vaadin-grid-column>
        <vaadin-grid-column
          id="address-id-column"
          path="address_id"
          header="ID"
          width="90px"
          flex-grow="0"
        ></vaadin-grid-column>
        <vaadin-grid-column
          id="is-group-column"
          path="is_group"
          header="Group"
          width="90px"
          flex-grow="0"
        ></vaadin-grid-column>
        <vaadin-grid-column
          id="name-column"
          path="name"
          header="Name"
          flex-grow="1"
        ></vaadin-grid-column>
        <vaadin-grid-column
          id="delete-device-column"
          width="55px"
          flex-grow="0"
          .renderer=${this._deleteDeviceRenderer.bind(this)}
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  private _gridItemClicked(event) {
    const context = this._grid.getEventContext(event);
    const item = context.item;
    // open/close item details for clicked items and store/remove unique_id
    if (context.section == "body") {
      navigate(this, `/config/lcn/device/${item.unique_id}`);
      this._grid.notifyResize();
    }
  }

  private _expandItemRenderer(root, grid, rowData) {
    render(
      html`
        <ha-icon id="expand-item-icon" icon="mdi:chevron-right"></ha-icon>
      `,
      root
    );
  }

  private _deleteDeviceRenderer(root, column, rowData) {
    render(
      html`
        <ha-icon-button
          title="Delete LCN device"
          icon="hass:delete"
        ></ha-icon-button>
      `,
      root
    );
    root.firstElementChild.onclick = (event) => {
      event.stopPropagation();
      this._deleteDevice(<LcnDeviceConfig>rowData.item);
    };
  }

  private _dispatchConfigurationChangedEvent() {
    this.dispatchEvent(
      new CustomEvent("lcn-config-changed", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _deleteDevice(item: LcnDeviceConfig) {
    if (
      !(await showConfirmationDialog(this, {
        title: `Delete
          ${item.is_group ? "group" : "module"}`,
        text: html` You are about to remove
          ${item.is_group ? "group" : "module"} ${item.address_id} in segment
          ${item.segment_id} ${item.name ? `('${item.name}')` : ""}.<br />
          Removing a device will also delete all associated entities!`,
      }))
    ) {
      return;
    }

    await deleteDevice(this.hass, this.host, item);
    this._dispatchConfigurationChangedEvent();
  }

  static get styles(): CSSResult {
    return css`
      ha-icon-button {
        --mdc-icon-button-size: 40px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-devices-data-table": LCNDevicesDataTable;
  }
}
