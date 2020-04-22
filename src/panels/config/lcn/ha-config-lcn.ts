import {
  css,
  customElement,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
} from "lit-element";
import { html } from "lit-html";
import { HomeAssistant } from "../../../types";
import "../../../layouts/hass-subpage";

@customElement("ha-config-lcn")
export class HaConfigLcn extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
  }

  protected render(): TemplateResult {
    return html`
      <hass-subpage .header=${this.hass.localize("ui.panel.config.lcn.title")}>
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <div slot="header">
            ${this.hass.localize("ui.panel.config.lcn.header")}
          </div>

          <div slot="introduction">
            ${this.hass.localize("ui.panel.config.lcn.introduction")}
          </div>

          <ha-card>
            Hello LCN!
          </ha-card>
        </ha-config-section>
      </hass-subpage>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-lcn": HaConfigLcn;
  }
}
