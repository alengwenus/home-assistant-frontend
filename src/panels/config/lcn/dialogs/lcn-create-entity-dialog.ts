import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-input/paper-input";
import "@polymer/paper-radio-button";
import "@polymer/paper-radio-group";
import "../../../../components/dialog/ha-paper-dialog";
import "../../../../components/ha-icon-button";
import {
  css,
  customElement,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
  CSSResult,
  query,
  queryAll,
} from "lit-element";
import { html } from "lit-html";
import { PolymerChangedEvent } from "../../../../polymer-types";
import { haStyleDialog } from "../../../../resources/styles";
import { HomeAssistant } from "../../../../types";
import { LcnEntityDialogParams } from "./show-dialog-create-entity";
import { LcnEntityConfig } from "../../../../data/lcn";
import "./lcn-platform-switch";

@customElement("lcn-create-entity-dialog")
export class CreateEntityDialog extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() private _params?: LcnEntityDialogParams;

  @property() private _name: string = "";

  @property() public platform: string = "switch";

  @property() private _invalid: boolean = false;

  @query("#platform") private _platform_element;

  // @queryAll("paper-input") private _inputs: any;

  private _platforms: string[] = ["switch", "light"];

  public async showDialog(params: LcnEntityDialogParams): Promise<void> {
    this._params = params;
    await this.updateComplete;
  }

  // protected update(changedProperties: PropertyValues) {
  //   super.update(changedProperties);
  //   const isInvalid = (inp) => inp.invalid;
  //   this._invalid = Array.from(this._inputs).some(isInvalid);
  // }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }

    return html`
      <ha-paper-dialog
        with-backdrop
        opened
        @opened-changed=${this._openedChanged}
      >
        <app-toolbar>
          <ha-icon-button
            aria-label=${this.hass.localize("Close")}
            icon="hass:close"
            dialog-dismiss
          ></ha-icon-button>
          <div class="main-title" main-title>
            Create new entity
          </div>
        </app-toolbar>

        <form>
          <paper-input
            label="Name"
            placeholder=${this.platform}
            max-length="20"
            @value-changed=${(event) => (this._name = event.detail.value)}
          >
          </paper-input>
          <paper-dropdown-menu
            label="Platform"
            @selected-item-changed=${this._platform_changed}
          >
            <paper-listbox slot="dropdown-content" selected="0">
              ${this._platforms.map((platform) => {
                return html`
                  <paper-item .itemValue=${platform}>${platform} </paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
          ${this.renderPlatform(this.platform)}
        </form>

        <div class="buttons">
          <mwc-button @click="${this._closeDialog}">
            Dismiss
          </mwc-button>
          <mwc-button .disabled=${this._invalid} @click="${this._create}">
            Create
          </mwc-button>
        </div>
      </ha-paper-dialog>
    `;
  }

  private renderPlatform(platform) {
    if (platform == "switch") {
      return html`<lcn-platform-switch id="platform"></lcn-platform-switch>`;
    } else {
      return html``;
    }
  }

  private _openedChanged(ev: PolymerChangedEvent<boolean>): void {
    if (!(ev.detail as any).value) {
      this._closeDialog();
    }
  }

  private async _create(): Promise<void> {
    console.log(this._platform_element.platform_data);

    const values: Partial<LcnEntityConfig> = {
      name: this._name ? this._name : this.platform,
      unique_device_id: this._params!.device.unique_id,
      platform: this.platform,
      platform_data: this._platform_element.platform_data,
    };
    await this._params!.createEntity(values);
    this._closeDialog();
  }

  private _closeDialog(): void {
    this._params = undefined;
  }

  private _platform_changed(ev: CustomEvent) {
    if (!ev.detail.value) {
      return;
    }
    this.platform = ev.detail.value.itemValue;
  }

  static get styles(): CSSResult[] {
    return [
      haStyleDialog,
      css`
        app-toolbar {
          color: var(--primary-text-color);
          background-color: var(--secondary-background-color);
          margin: 0;
          padding: 0 16px;
        }

        app-toolbar [main-title] {
          /* Design guideline states 24px, changed to 16 to align with state info */
          margin-left: 16px;
          line-height: 1.3em;
          max-height: 2.6em;
          overflow: hidden;
          /* webkit and blink still support simple multiline text-overflow */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          text-overflow: ellipsis;
        }

        @media all and (min-width: 451px) and (min-height: 501px) {
          .main-title {
            pointer-events: auto;
            cursor: default;
          }
        }

        ha-paper-dialog {
          width: 450px;
          max-height: none !important;
        }

        /* overrule the ha-style-dialog max-height on small screens */
        @media all and (max-width: 450px), all and (max-height: 500px) {
          app-toolbar {
            background-color: var(--app-header-background-color);
            color: var(--app-header-text-color, white);
          }
          ha-paper-dialog {
            height: 100%;
            max-height: 100% !important;
            width: 100% !important;
            border-radius: 0px;
            position: fixed !important;
            margin: 0;
          }
          ha-paper-dialog::before {
            content: "";
            position: fixed;
            z-index: -1;
            top: 0px;
            left: 0px;
            right: 0px;
            bottom: 0px;
            background-color: inherit;
          }
        }

        :host([rtl]) app-toolbar {
          direction: rtl;
          text-align: right;
        }
        :host {
          --paper-font-title_-_white-space: normal;
        }
      `,
      css`
        .buttons {
          display: flex;
          justify-content: space-between;
          padding: 8px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lcn-create-entity-dialog": CreateEntityDialog;
  }
}
