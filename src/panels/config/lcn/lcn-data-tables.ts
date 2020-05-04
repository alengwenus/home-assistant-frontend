import "@vaadin/vaadin-grid";
import { GridElement } from "@vaadin/vaadin-grid";
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
import { LcnDeviceConfig } from "../../../data/lcn";

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
        .items=${this.devices}
        @active-item-changed="${(event) => {
          this.activeItemChanged(event);
        }}"
      >
        <template class="row-details">
          Hallo!
        </template>

        <vaadin-grid-column
          path="segment_id"
          header="Segment"
          width="90px"
          flex-grow="0"
        ></vaadin-grid-column>
        <vaadin-grid-column
          path="address_id"
          header="ID"
          width="90px"
          flex-grow="0"
        ></vaadin-grid-column>
        <vaadin-grid-column
          path="is_group"
          header="Group"
          width="90px"
          flex-grow="0"
        ></vaadin-grid-column>
        <vaadin-grid-column path="name" header="Name"></vaadin-grid-column>
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
    this._last_item = item;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-devices-data-table": LCNDevicesDataTable;
  }
}
