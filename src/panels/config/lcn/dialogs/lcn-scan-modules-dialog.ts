import "../../../../components/dialog/ha-paper-dialog";
import "@polymer/paper-spinner/paper-spinner";
import {
  css,
  customElement,
  LitElement,
  property,
  TemplateResult,
  CSSResult,
  query,
} from "lit-element";
import { html } from "lit-html";
import { haStyleDialog } from "../../../../resources/styles";
import { HomeAssistant } from "../../../../types";

@customElement("lcn-scan-modules-dialog")
export class ScanModulesDialog extends LitElement {
  @property() public hass!: HomeAssistant;

  @query("ha-paper-dialog") private _dialog: any;

  public async showDialog(params: any): Promise<void> {
    this.open();
  }

  public closeDialog() {
    this.close();
  }

  protected render(): TemplateResult {
    return html`
      <ha-paper-dialog with-backdrop modal @close-dialog=${this.closeDialog}>
        <h2>Scanning modules...</h2>
        <p>
          Scanning of modules might take up to 30 seconds.<br />
          This dialog will close automatically.
        </p>

        <div id="dialog-content">
          <paper-spinner active></paper-spinner>
        </div>
      </ha-paper-dialog>
    `;
  }

  public open() {
    this._dialog.open();
  }

  public close() {
    this._dialog.close();
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
    "lcn-scan-modules-dialog": ScanModulesDialog;
  }
}
