import "@vaadin/vaadin-grid";
import { GridElement } from "@vaadin/vaadin-grid";
import "../../../components/ha-icon-button";
import {
  css,
  customElement,
  LitElement,
  property,
  query,
  CSSResult,
} from "lit-element";
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
      <dom-module id="entity-grid-theme" theme-for="vaadin-grid">
        <template>
          <style>
            [part~="row"]:hover > [part~="body-cell"] {
              background-color: rgba(var(--rgb-primary-text-color), 0.04);
            }
            [part="row"] {
              min-height: 40;
            }
            /* :host [part~="body-cell"] ::slotted(vaadin-grid-cell-content){
              cursor: pointer;
            } */
          </style>
        </template>
      </dom-module>

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
          width="55px"
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
        <ha-icon-button
          title="Create new entity"
          icon="hass:plus"
        ></ha-icon-button>
      `,
      root
    );
  }

  private _deleteEntityRenderer(root, column, rowData) {
    render(
      html`
        <ha-icon-button
          title="Delete entity"
          icon="hass:delete"
        ></ha-icon-button>
      `,
      root
    );
    root.firstElementChild.onclick = (event) => {
      event.stopPropagation();
      this._deleteEntity(<LcnEntityConfig>rowData.item);
    };
  }

  private _dispatchConfigurationChangedEvent() {
    this.dispatchEvent(
      new CustomEvent("lcn-configuration-changed", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _deleteEntity(item: LcnEntityConfig) {
    await deleteEntity(this.hass, this.host, item);
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
