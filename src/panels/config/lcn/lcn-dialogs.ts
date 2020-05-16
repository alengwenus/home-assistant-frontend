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
import { fireEvent } from "../../../common/dom/fire_event";

const getDialog = () => {
  return document
    .querySelector("home-assistant")!
    .shadowRoot!.querySelector("lcn-scan-modules-dialog") as
    | ScanModulesDialog
    | undefined;
};

export const loadLCNScanModulesDialog = () =>
  import(/* webpackChunkName: "lcn-dialogs" */ "./lcn-dialogs");

export const showLCNScanModulesDialog = (
  element: HTMLElement
): (() => ScanModulesDialog | undefined) => {
  fireEvent(element, "show-dialog", {
    dialogTag: "lcn-scan-modules-dialog",
    dialogImport: loadLCNScanModulesDialog,
    dialogParams: {},
  });
  return getDialog;
};

@customElement("lcn-scan-modules-dialog")
export class ScanModulesDialog extends LitElement {
  @query("#scan-dialog") private _dialog: any;

  public async showDialog(params: any): Promise<void> {
    this.open();
    await this.updateComplete;
  }

  public closeDialog() {
    this.close();
  }

  protected render(): TemplateResult {
    return html`
      <ha-paper-dialog modal id="scan-dialog" @close-dialog=${this.closeDialog}>
        <div id="dialog-content">
          <h3>Scanning modules...</h3>
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
