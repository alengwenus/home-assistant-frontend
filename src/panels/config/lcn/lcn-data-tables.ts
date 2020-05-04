import "@vaadin/vaadin-grid";
import { GridElement } from "@vaadin/vaadin-grid";
import "@vaadin/vaadin-grid/vaadin-grid-sort-column";
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
        @active-item-changed="${(event) => {
          this.activeItemChanged(event);
        }}"
      >
        <vaadin-grid-column path="name" header="Name"></vaadin-grid-column>
        <vaadin-grid-column
          path="platform"
          header="Platform"
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  private activeItemChanged(event) {
    const item = event.detail.value;
    if (item) {
      this._grid.selectedItems = item ? [item] : [];
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

  protected firstUpdated(changedProperties: PropertyValues): void {
    this._grid.rowDetailsRenderer = this.rowDetailsRenderer;
  }

  protected render() {
    return html`
      <vaadin-grid
        height-by-rows
        multi-sort
        direction="asc"
        .items=${this.devices}
        @active-item-changed="${(event) => {
          this.activeItemChanged(event);
        }}"
      >
        <vaadin-grid-sort-column
          path="segment_id"
          header="Segment"
          width="90px"
          flex-grow="0"
        ></vaadin-grid-sort-column>
        <vaadin-grid-sort-column
          path="address_id"
          header="ID"
          width="90px"
          flex-grow="0"
        ></vaadin-grid-sort-column>
        <vaadin-grid-sort-column
          path="is_group"
          header="Group"
          width="90px"
          flex-grow="0"
        ></vaadin-grid-sort-column>
        <vaadin-grid-sort-column
          path="name"
          header="Name"
        ></vaadin-grid-sort-column>
      </vaadin-grid>
    `;
  }

  private activeItemChanged(event) {
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

  private rowDetailsRenderer(root, grid, rowData) {
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
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-devices-data-table": LCNDevicesDataTable;
  }
}
