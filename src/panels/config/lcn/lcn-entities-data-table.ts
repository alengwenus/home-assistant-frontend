import "@vaadin/vaadin-grid";
import { GridElement } from "@vaadin/vaadin-grid";
import "@polymer/paper-icon-button/paper-icon-button";
import { css, customElement, LitElement, property, query } from "lit-element";
import { html, render } from "lit-html";
import { HomeAssistant } from "../../../types";
import {
  LcnDeviceConfig,
  LcnEntityConfig,
  deleteEntity,
} from "../../../data/lcn";

@customElement("lcn-entities-data-table")
export class LCNEntitiesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property() public host: string = "";

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
          .headerRenderer=${this._addEntityRenderer.bind(this)}
          .renderer=${this._deleteEntityRenderer.bind(this)}
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
  }

  private _addEntityRenderer(root, column, rowData) {
    render(
      html`
        <paper-icon-button
          title="Create new entity"
          icon="hass:plus"
        ></paper-icon-button>
      `,
      root
    );
  }

  private _deleteEntityRenderer(root, column, rowData) {
    render(
      html`
        <paper-icon-button
          title="Delete entity"
          icon="hass:delete"
        ></paper-icon-button>
      `,
      root
    );
    root.firstElementChild.onclick = (event) => {
      event.stopPropagation();
      this._deleteEntity(<LcnEntityConfig>rowData.item);
    };
  }

  private async _deleteEntity(item: LcnEntityConfig) {
    await deleteEntity(this.hass, this.host, item);
    this.dispatchEvent(
      new CustomEvent("table-items-changed", {
        bubbles: true,
        composed: true,
      })
    );
  }
}
