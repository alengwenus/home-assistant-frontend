import "@vaadin/vaadin-grid";
import { GridElement } from "@vaadin/vaadin-grid";
import "../../../../../components/ha-icon-button";
import {
  css,
  customElement,
  LitElement,
  property,
  query,
  CSSResult,
} from "lit-element";
import { html, render } from "lit-html";
import { HomeAssistant } from "../../../../../types";
import {
  LcnEntityConfig,
  deleteEntity,
  LcnDeviceConfig,
} from "../../../../../data/lcn";

@customElement("lcn-entities-data-table")
export class LCNEntitiesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property() public host: string = "";

  @property() public device!: LcnDeviceConfig;

  @property() public entities: LcnEntityConfig[] = [];

  @query("vaadin-grid") private _grid!: GridElement;

  protected firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
  }

  protected update(changedProperties) {
    super.update(changedProperties);
  }

  protected render() {
    return html`
      <vaadin-grid class="lcn-table" height-by-rows .items=${this.entities}>
        <vaadin-grid-column path="name" header="Name"></vaadin-grid-column>
        <vaadin-grid-column path="domain" header="Domain"></vaadin-grid-column>
        <vaadin-grid-column
          path="resource"
          header="Resource"
        ></vaadin-grid-column>
        <vaadin-grid-column
          id="delete-entity-column"
          width="55px"
          flex-grow="0"
          .renderer=${this._deleteEntityRenderer.bind(this)}
        ></vaadin-grid-column>
      </vaadin-grid>
    `;
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

declare global {
  interface HTMLElementTagNameMap {
    "lcn-entities-data-table": LCNEntitiesDataTable;
  }
}
