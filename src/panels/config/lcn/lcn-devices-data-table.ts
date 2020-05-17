import "@vaadin/vaadin-grid";
import { GridElement } from "@vaadin/vaadin-grid";
import "@polymer/iron-icon";
import "@polymer/paper-tooltip/paper-tooltip";
import {
  css,
  customElement,
  CSSResult,
  LitElement,
  property,
  query,
} from "lit-element";
import { html, render } from "lit-html";
import { HomeAssistant } from "../../../types";
import { showConfirmationDialog } from "../../../dialogs/generic/show-dialog-box";
import { LcnDeviceConfig, deleteDevice } from "../../../data/lcn";
import "./lcn-entities-data-table";
import "../../../resources/mdi-icons";

@customElement("lcn-devices-data-table")
export class LCNDevicesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property() public host: string = "";

  @property() public devices: LcnDeviceConfig[] = [];

  @query("vaadin-grid") private _grid!: GridElement;

  private _last_opened_items: string[] = []; // unique_ids of opened items

  protected updated(changedProperties) {
    if (changedProperties.has("devices")) {
      // open all items with stored unique_ids
      for (let item of this._grid.items) {
        if (this._last_opened_items.includes(item.unique_id)) {
          this._grid.openItemDetails(item);
        }
      }
    }
  }

  protected render() {
    return html`
      <dom-module id="lcn-grid" theme-for="vaadin-grid">
        <template>
          <style>
            :host [part~="row"]:hover [part~="body-cell"] {
              background-color: rgba(var(--rgb-primary-text-color), 0.04);
            }
            /* :host [part~="body-cell"] ::slotted(vaadin-grid-cell-content){
              cursor: pointer;
            } */
          </style>
        </template>
      </dom-module>

      <vaadin-grid
        height-by-rows
        multi-sort
        .items=${this.devices}
        .rowDetailsRenderer=${this._rowDetailsRenderer.bind(this)}
        @click="${(event) => {
          this._gridItemClicked(event);
        }}"
      >
        <vaadin-grid-column
          id="expand_item-column"
          width="70px"
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
        ></vaadin-grid-column>
        <vaadin-grid-column
          id="delete-device-column"
          width="70px"
          text-align="center"
          flex-grow="0"
          .headerRenderer=${this._addDeviceRenderer.bind(this)}
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
      if (this._last_opened_items.includes(item.unique_id)) {
        this._grid.closeItemDetails(item);
        this._last_opened_items = this._last_opened_items.filter(
          (e) => e !== item.unique_id
        );
      } else {
        this._grid.openItemDetails(item);
        this._last_opened_items.push(item.unique_id);
      }
      this._grid.notifyResize();
    }
  }

  private _rowDetailsRenderer(root, grid, rowData) {
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

  private _expandItemRenderer(root, grid, rowData) {
    render(
      html`
        <iron-icon
          id="expand-item-icon"
          icon=${rowData.detailsOpened
            ? "mdi:chevron-down"
            : "mdi:chevron-right"}
        ></iron-icon>
      `,
      root
    );
  }

  private _addDeviceRenderer(root, column, rowData) {
    render(
      html`
        <paper-icon-button
          title="Add new LCN device (module or group)"
          icon="hass:plus"
        ></paper-icon-button>
      `,
      root
    );
  }

  private _deleteDeviceRenderer(root, column, rowData) {
    render(
      html`
        <paper-icon-button
          title="Delete LCN device"
          icon="hass:delete"
        ></paper-icon-button>
      `,
      root
    );
    root.firstElementChild.onclick = (event) => {
      event.stopPropagation();
      this._deleteDevice(<LcnDeviceConfig>rowData.item);
    };
  }

  private async _deleteDevice(item: LcnDeviceConfig) {
    if (
      !(await showConfirmationDialog(this, {
        title: `Delete
          ${item.is_group ? "group" : "module"}`,
        text: html` You are about to delete
          ${item.is_group ? "group" : "module"} [${item.segment_id},
          ${item.address_id}] ${item.name ? `(${item.name})` : ""}.<br />
          Deleting a device will delete all associated entities!`,
      }))
    ) {
      return;
    }

    await deleteDevice(this.hass, this.host, item);
    this.dispatchEvent(
      new CustomEvent("table-items-changed", {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-devices-data-table": LCNDevicesDataTable;
  }
}
