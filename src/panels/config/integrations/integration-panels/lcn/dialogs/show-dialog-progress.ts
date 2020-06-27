import { fireEvent } from "../../../../../../common/dom/fire_event";
import { ProgressDialog } from "./progress-dialog";
import { TemplateResult } from "lit-html";

const getDialog = () => {
  return document
    .querySelector("home-assistant")!
    .shadowRoot!.querySelector("progress-dialog") as ProgressDialog | undefined;
};

export interface ProgressDialogParams {
  text?: string | TemplateResult;
  title?: string;
}

export const loadProgressDialog = () =>
  import(/* webpackChunkName: "progress-dialog" */ "./progress-dialog");

export const showProgressDialog = (
  element: HTMLElement,
  dialogParams: ProgressDialogParams
): (() => ProgressDialog | undefined) => {
  fireEvent(element, "show-dialog", {
    dialogTag: "progress-dialog",
    dialogImport: loadProgressDialog,
    dialogParams: dialogParams,
  });
  return getDialog;
};
