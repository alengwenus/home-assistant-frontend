import { fireEvent } from "../../../../common/dom/fire_event";
import { ScanModulesDialog } from "./lcn-scan-modules-dialog";

const getDialog = () => {
  return document
    .querySelector("home-assistant")!
    .shadowRoot!.querySelector("lcn-scan-modules-dialog") as
    | ScanModulesDialog
    | undefined;
};

export const loadLCNScanModulesDialog = () =>
  import(
    /* webpackChunkName: "lcn-scan-modules-dialog" */ "./lcn-scan-modules-dialog"
  );

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
