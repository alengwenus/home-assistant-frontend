import "@vaadin/vaadin-grid";
import { GridElement, GridColumnElement } from "@vaadin/vaadin-grid";
import "@polymer/paper-icon-button/paper-icon-button";
import {
  css,
  customElement,
  LitElement,
  property,
  query,
  PropertyValues,
  TemplateResult,
} from "lit-element";
import { html, render } from "lit-html";
import { HomeAssistant } from "../../../types";
import { LcnDeviceConfig, LcnEntityConfig } from "../../../data/lcn";

@customElement("lcn-entities-data-table")
export class LCNEntitiesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property() public device?: LcnDeviceConfig;

  @query("vaadin-grid") private _grid!: GridElement;

  protected render() {
    return html`
      <vaadin-grid
        height-by-rows
        .items=${this.device ? this.device.entities : []}
      >
        <vaadin-grid-column path="name" header="Name"></vaadin-grid-column>
        <vaadin-grid-column
          path="platform"
          header="Platform"
        ></vaadin-grid-column>
        <vaadin-grid-column
          path="resource"
          header="Resource"
        ></vaadin-grid-column>
        <vaadin-grid-column
          id="delete-entity-column"
          width="70px"
          text-align="center"
          flex-grow="0"
          .renderer=${this._deleteEntityRenderer}
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  // private _activeItemChanged(event) {
  //   const item = event.detail.value;
  //   if (item) {
  //     this._grid.selectedItems = item ? [item] : [];
  //   }
  // }

  private _deleteEntityRenderer(root, column, rowData) {
    if (!root.firstElementChild) {
      render(
        html`
          <paper-icon-button
            title="Delete entity"
            icon="hass:delete"
          ></paper-icon-button>
        `,
        root
      );
      root.firstElementChild.addEventListener("click", function (e) {
        deleteEntity(rowData.item);
      });
    }
  }
}

@customElement("lcn-devices-data-table")
export class LCNDevicesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property() public devices: LcnDeviceConfig[] = [];

  @query("vaadin-grid") private _grid!: GridElement;

  private _last_item!: LcnDeviceConfig;

  protected render() {
    return html`
      <vaadin-grid
        height-by-rows
        multi-sort
        .items=${this.devices}
        .rowDetailsRenderer=${this._rowDetailsRenderer}
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
    if (rowData.detailsOpened) {
      if (!root.firstElementChild) {
        render(
          html`
            <lcn-entities-data-table
              .hass=${this.hass}
              .device=${<LcnDeviceConfig>rowData.item}
            ></lcn-entities-data-table>
          `,
          root
        );
      }
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

function deleteEntity(item: LcnEntityConfig) {
  console.log(item);
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-devices-data-table": LCNDevicesDataTable;
  }
}
