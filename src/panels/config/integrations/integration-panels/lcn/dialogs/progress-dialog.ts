import "../../../../../../components/dialog/ha-paper-dialog";
import "../../../../../../components/ha-circular-progress";
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
import { haStyleDialog } from "../../../../../../resources/styles";
import { HomeAssistant } from "../../../../../../types";
import { ProgressDialogParams } from "./show-dialog-progress";

@customElement("progress-dialog")
export class ProgressDialog extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() private _params?: ProgressDialogParams;

  @query("ha-paper-dialog") private _dialog: any;

  public async showDialog(params: ProgressDialogParams): Promise<void> {
    this._params = params;
    this.open();
  }

  public closeDialog() {
    this.close();
  }

  protected render(): TemplateResult {
    return html`
      <ha-paper-dialog with-backdrop modal @close-dialog=${this.closeDialog}>
        <h2>${this._params?.title}</h2>
        <p>${this._params?.text}</p>

        <div id="dialog-content">
          <ha-circular-progress active></ha-circluar-progress>
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
    "progress-dialog": ProgressDialog;
  }
}
