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
import { html, render } from "lit-html";
import { HomeAssistant } from "../../../../../types";
import { showConfirmationDialog } from "../../../../../dialogs/generic/show-dialog-box";
import { navigate } from "../../../../../common/navigate";
import { LcnDeviceConfig, deleteDevice } from "../../../../../data/lcn";
import "./lcn-entities-data-table";
import "../../../../../components/ha-icon-button";
import { loadLCNCreateDeviceDialog } from "./dialogs/show-dialog-create-device";

@customElement("lcn-devices-data-table")
export class LCNDevicesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property() public host: string = "";

  @property() public devices: LcnDeviceConfig[] = [];

  @query("vaadin-grid") private _grid!: GridElement;

  protected firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    loadLCNCreateDeviceDialog();
  }

  protected render() {
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
