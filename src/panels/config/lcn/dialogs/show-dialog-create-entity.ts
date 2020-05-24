import { fireEvent } from "../../../../common/dom/fire_event";
import { LcnEntityConfig } from "../../../../data/lcn";

export interface LcnEntityDialogParams {
  createEntity: (values: Partial<LcnEntityConfig>) => Promise<unknown>;
}

export const loadLCNCreateEntityDialog = () =>
  import(
    /* webpackChunkName: "lcn-create-entity-dialog" */ "./lcn-create-entity-dialog"
  );

export const showLCNCreateEntityDialog = (
  element: HTMLElement,
  lcnEntityParams: LcnEntityDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "lcn-create-entity-dialog",
    dialogImport: loadLCNCreateEntityDialog,
    dialogParams: lcnEntityParams,
  });
};
