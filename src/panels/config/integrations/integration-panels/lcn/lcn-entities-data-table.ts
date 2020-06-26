import "../../../../../components/ha-icon-button";
import {
  css,
  customElement,
  LitElement,
  property,
  query,
  CSSResult,
} from "lit-element";
import memoizeOne from "memoize-one";
import { html } from "lit-html";
import { HomeAssistant } from "../../../../../types";
import {
  LcnEntityConfig,
  deleteEntity,
  LcnDeviceConfig,
  LcnHost,
} from "../../../../../data/lcn";
import "../../../../../components/data-table/ha-data-table";
import {
  DataTableColumnContainer,
  HaDataTable,
} from "../../../../../components/data-table/ha-data-table";

export interface EntityRowData extends LcnEntityConfig {}

@customElement("lcn-entities-data-table")
export class LCNEntitiesDataTable extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() public host!: LcnHost;

  @property() public device!: LcnDeviceConfig;

  @property() public entities: LcnEntityConfig[] = [];

  @query("ha-data-table") private _dataTable!: HaDataTable;

  private _entities = memoizeOne((entities: LcnEntityConfig[]) => {
    let entityRowData: EntityRowData[] = entities;

    entityRowData = entities.map((entity) => {
      return {
        ...entity,
      };
    });
    return entityRowData;
  });

  private _columns = memoizeOne(
    (narrow: boolean): DataTableColumnContainer =>
      narrow
        ? {
            name: {
              title: "Name",
              sortable: true,
              direction: "asc",
              grows: true,
            },
          }
        : {
            name: {
              title: "Name",
              sortable: true,
              direction: "asc",
              grows: true,
            },
            domain: {
              title: "Domain",
              sortable: true,
              direction: "asc",
              grows: true,
            },
            resource: {
              title: "Resource",
              sortable: true,
              direction: "asc",
              grows: true,
            },
            unique_id: {
              title: "",
              sortable: false,
              width: "60px",
              template: (unique_id: string) =>
                html`
                  <ha-icon-button
                    title="Delete LCN entity"
                    icon="hass:delete"
                    @click=${(ev) => {
                      ev.stopPropagation();
                      this._deleteEntity(unique_id);
                    }}
                  ></ha-icon-button>
                `,
            },
          }
  );

  protected render() {
    return html`
      <ha-data-table
        .columns=${this._columns(this.narrow)}
        .data=${this._entities(this.entities)}
        .id=${"unique_id"}
        auto-height
      ></ha-data-table>
    `;
  }

  private _dispatchConfigurationChangedEvent() {
    this.dispatchEvent(
      new CustomEvent("lcn-configuration-changed", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async _deleteEntity(uniqueId: string) {
    const entity = this.entities.find(
      (entity) => entity.unique_id === uniqueId
    )!;

    await deleteEntity(this.hass, this.host.id, entity);
    this._dispatchConfigurationChangedEvent();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-entities-data-table": LCNEntitiesDataTable;
  }
}
