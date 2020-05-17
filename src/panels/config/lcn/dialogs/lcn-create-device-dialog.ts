import "../../../../components/dialog/ha-paper-dialog";
import {
  css,
  customElement,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
  CSSResult,
  query,
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

  public async showDialog(params: LcnDeviceDialogParams): Promise<void> {
    this._params = params;
    await this.updateComplete;
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
        <h2>Create new module / group</h2>
        <p>
          Now we will create a new device.
        </p>
        <div class="paper-dialog-buttons">
          <mwc-button @click="${this._create}">
            Create
          </mwc-button>
          <mwc-button @click="${this._closeDialog}">
            Dismiss
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

  private async _create(): Promise<void> {
    const values: Partial<LcnDeviceConfig> = {
      name: "Test Modul",
      segment_id: 0,
      address_id: 42,
      is_group: false,
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
        #dialog-content {
          text-align: center;
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
