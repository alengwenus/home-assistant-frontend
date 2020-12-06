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
import type { HaPaperDialog } from "../../../../../../components/dialog/ha-paper-dialog";
import { fireEvent } from "../../../../../../common/dom/fire_event";

@customElement("progress-dialog")
export class ProgressDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() private _params?: ProgressDialogParams;

  @query("ha-paper-dialog", true) private _dialog!: HaPaperDialog;

  public async showDialog(params: ProgressDialogParams): Promise<void> {
    this._params = params;
    await this.updateComplete;
    fireEvent(this._dialog as HTMLElement, "iron-resize");
  }

  public async closeDialog() {
    this.close();
  }

  protected render(): TemplateResult {
    if (!this._params) {
      return html``;
    }
    return html`
      <ha-paper-dialog with-backdrop opened modal @close-dialog=${this.closeDialog}>
        <h2>${this._params?.title}</h2>
        <p>${this._params?.text}</p>

        <div id="dialog-content">
          <ha-circular-progress active></ha-circluar-progress>
        </div>
      </ha-paper-dialog>
    `;
  }

  // public open() {
  //   this._dialog.open();
  // }

  public close() {
    this._params = undefined;
    // this._dialog.close();
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
