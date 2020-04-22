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
import { fetchModules, LcnModule } from "../../../data/lcn";

@customElement("ha-config-lcn")
export class HaConfigLcn extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() private _modules: LcnModule[] = [];

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.hass) {
      this._fetchModules();
    }
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

          ${this._modules.map((module) => {
            return html`
              <ha-card>
                ${module.name}
              </ha-card>
            `;
          })}

          <ha-card>
            Hello LCN!
          </ha-card>
        </ha-config-section>
      </hass-subpage>
    `;
  }

  private async _fetchModules() {
    this._modules = await fetchModules(this.hass!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-lcn": HaConfigLcn;
  }
}
