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
  PropertyValues,
} from "lit-element";
import { html, render } from "lit-html";
import { HomeAssistant } from "../../../types";
import { LcnEntityConfig, deleteEntity } from "../../../data/lcn";
import {
  loadLCNCreateEntityDialog,
  showLCNCreateEntityDialog,
} from "./dialogs/show-dialog-create-entity";

@customElement("lcn-entities-data-table")
export class LCNEntitiesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public narrow: boolean = false;

  @property() public host: string = "";

  @property() public entities: LcnEntityConfig[] = [];

  @query("vaadin-grid") private _grid!: GridElement;

  protected firstUpdated(changedProperties) {
    super.firstUpdated(changedProperties);
    loadLCNCreateEntityDialog();
  }

  protected update(changedProperties) {
    super.update(changedProperties);
  }

  protected render() {
    return html`
      <vaadin-grid class="lcn-table" height-by-rows .items=${this.entities}>
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
    root.firstElementChild.onclick = (event) => {
      event.stopPropagation();
      this._addEntity();
    };
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

  private async _addEntity() {
    showLCNCreateEntityDialog(this, {
      createEntity: async (entity_params) => {
        console.log(entity_params.name);
        this._dispatchConfigurationChangedEvent();
      },
    });
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
