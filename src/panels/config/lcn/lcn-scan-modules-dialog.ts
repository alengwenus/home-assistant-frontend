// import "@polymer/paper-dialog/paper-dialog";
// import "@polymer/paper-dialog-behavior/paper-dialog-behavior";
import "../../../components/dialog/ha-paper-dialog";
import "@polymer/paper-spinner/paper-spinner";
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
import { haStyleDialog } from "../../../resources/styles";

@customElement("lcn-scan-modules-dialog")
export class ScanModulesDialog extends LitElement {
  @query("ha-paper-dialog") private _dialog: any;

  public async showDialog(params: any): Promise<void> {
    this.open();
    await this.updateComplete;
  }

  public closeDialog() {
    this.close();
  }

  protected render(): TemplateResult {
    return html`
      <ha-paper-dialog modal @close-dialog=${this.closeDialog}>
        <div id="dialog-content">
          <h3>Scanning modules...</h3>
          <p>
            Scanning of modules might take up to 30 seconds.<br />
            This dialog will close automatically.
          </p>
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
