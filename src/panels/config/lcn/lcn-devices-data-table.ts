import "@vaadin/vaadin-grid";
import { GridElement } from "@vaadin/vaadin-grid";
import "@polymer/paper-icon-button/paper-icon-button";
import { css, customElement, LitElement, property, query } from "lit-element";
import { html, render } from "lit-html";
import { HomeAssistant } from "../../../types";
import { LcnDeviceConfig } from "../../../data/lcn";
import "./lcn-entities-data-table";

@customElement("lcn-devices-data-table")
export class LCNDevicesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property() public host: string = "";

  @property() public devices: LcnDeviceConfig[] = [];

  @query("vaadin-grid") private _grid!: GridElement;

  private _last_item!: LcnDeviceConfig;

  private _last_index!: number;

  updated(changedProperties) {
    if (
      changedProperties.has("devices") &&
      typeof this._last_index !== "undefined"
    ) {
      const item = this._grid.items[this._last_index];
      this._grid.openItemDetails(item);
      this._last_item = item;
    }
  }

  protected render() {
    return html`
      <vaadin-grid
        height-by-rows
        multi-sort
        .items=${this.devices}
        .rowDetailsRenderer=${this._rowDetailsRenderer.bind(this)}
        @active-item-changed="${(event) => {
          this._activeItemChanged(event);
        }}"
      >
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
        ></vaadin-grid-column>
        <vaadin-grid-column
          id="delete-device-column"
          width="70px"
          text-align="center"
          flex-grow="0"
          .renderer=${this._deleteDeviceRenderer}
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  private _activeItemChanged(event) {
    if (this._last_item) {
      this._grid.closeItemDetails(this._last_item);
    }

    const item = event.detail.value;
    if (item) {
      this._grid.selectedItems = item ? [item] : [];
      this._grid.openItemDetails(item);
    }
    this._grid.notifyResize();
    this._last_item = item;
  }

  private _rowDetailsRenderer(root, grid, rowData) {
    // if (!root.firstElementChild) {
    // console.log(rowData.item);
    if (rowData.detailsOpened) {
      this._last_index = rowData.index;
    }

    if (true) {
      render(
        html`
          <lcn-entities-data-table
            .hass=${this.hass}
            .host=${this.host}
            .device=${<LcnDeviceConfig>rowData.item}
          ></lcn-entities-data-table>
        `,
        root
      );
    }
  }

  private _deleteDeviceRenderer(root, column, rowData) {
    if (!root.firstElementChild) {
      render(
        html`
          <paper-icon-button
            title="Delete device"
            icon="hass:delete"
          ></paper-icon-button>
        `,
        root
      );
      root.firstElementChild.addEventListener("click", function (e) {
        deleteDevice(rowData.item);
      });
    }
  }
}

function deleteDevice(item: LcnDeviceConfig) {
  console.log(item);
}

// function deleteEntity(item: LcnEntityConfig) {
//   console.log(item);
// }

declare global {
  interface HTMLElementTagNameMap {
    "lcn-devices-data-table": LCNDevicesDataTable;
  }
}
