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
import { LcnDeviceDialogParams } from "./show-dialog-create_device";
import { LcnDeviceConfig } from "../../../../data/lcn";

@customElement("lcn-create-device-dialog")
export class CreateDeviceDialog extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() private _params?: LcnDeviceDialogParams;

  @property() private _name: string = "";

  @property() private _isGroup: boolean = false;

  @property() private _segmentId: number = 0;

  @property() private _addressId: number = 5;

  @property() private _invalid: boolean = false;

  @queryAll("paper-input") private _inputs: any;

  public async showDialog(params: LcnDeviceDialogParams): Promise<void> {
    this._params = params;
    await this.updateComplete;
  }

  protected update(changedProperties: PropertyValues) {
    super.update(changedProperties);
    const isInvalid = (inp) => inp.invalid;
    this._invalid = Array.from(this._inputs).some(isInvalid);
  }

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
            Create new module / group
          </div>
        </app-toolbar>

        <form>
          <label>Type:</label>
          <paper-radio-group
            name="is_group"
            selected="module"
            @selected-changed=${this._handleIsGroupChanged}
          >
            <paper-radio-button name="module">Module</paper-radio-button>
            <paper-radio-button name="group">Group</paper-radio-button>
          </paper-radio-group>
          <paper-input
            label="Segment ID"
            type="number"
            value="0"
            min="0"
            @value-changed=${(event) => (this._segmentId = +event.detail.value)}
            .invalid=${this._validateSegmentId(this._segmentId)}
            error-message="Segment ID must be 0, 5..128."
          >
          </paper-input>
          <paper-input
            label="ID"
            type="number"
            value="5"
            min="0"
            @value-changed=${(event) => (this._addressId = +event.detail.value)}
            .invalid=${this._validateAddressId(this._addressId, this._isGroup)}
            error-message=${this._isGroup
              ? "Group ID must be 3..254."
              : "Module ID must be 5..254"}
          >
          </paper-input>
          <paper-input
            label="Name"
            placeholder=${this._isGroup ? "Group" : "Module"}
            max-length="20"
            @value-changed=${(event) => (this._name = event.detail.value)}
          >
          </paper-input>
        </form>

        <p>
          Now we will create a new device.
        </p>
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

  private _openedChanged(ev: PolymerChangedEvent<boolean>): void {
    if (!(ev.detail as any).value) {
      this._closeDialog();
    }
  }

  private _handleIsGroupChanged(ev: CustomEvent): void {
    this._isGroup = ev.detail.value == "group";
  }

  private _validateSegmentId(segment_id: number): boolean {
    // segement_id: 0, 5-128
    return !(segment_id === 0 || (5 <= segment_id && segment_id <= 128));
  }

  private _validateAddressId(address_id: number, is_group: boolean): boolean {
    // module_id: 5-254
    // group_id: 3-254
    if (is_group) {
      return !(3 <= address_id && address_id <= 254);
    } else {
      return !(5 <= address_id && address_id <= 254);
    }
  }

  private async _create(): Promise<void> {
    console.log(this._params);
    const values: Partial<LcnDeviceConfig> = {
      name: this._name ? this._name : this._isGroup ? "Group" : "Module",
      segment_id: this._segmentId,
      address_id: this._addressId,
      is_group: this._isGroup,
    };
    await this._params!.createDevice(values);
    this._closeDialog();
  }

  private _closeDialog(): void {
    this._params = undefined;
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
    "lcn-create-device-dialog": CreateDeviceDialog;
  }
}
