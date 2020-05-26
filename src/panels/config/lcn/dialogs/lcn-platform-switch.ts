import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/paper-radio-button";
import "@polymer/paper-radio-group";
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
import { SwitchConfig } from "../../../../data/lcn";

@customElement("lcn-platform-switch")
export class LCNPlatformSwitch extends LitElement {
  @property() public platform_data: SwitchConfig = { output: "OUTPUT1" };

  @property() private portType: string = "output";

  @query("#ports-listbox") private portsListBox;

  private output_ports: string[] = ["OUTPUT1", "OUTPUT2", "OUTPUT3", "OUTPUT4"];
  private relay_ports: string[] = [
    "RELAY1",
    "RELAY2",
    "RELAY3",
    "RELAY4",
    "RELAY5",
    "RELAY6",
    "RELAY7",
    "RELAY8",
  ];
  private ports = { output: this.output_ports, relay: this.relay_ports };

  protected render(): TemplateResult {
    return html`
      <form>
        <label>Port:</label>
        <paper-radio-group
          name="port"
          selected="output"
          @selected-changed=${this._portTypeChanged}
        >
          <paper-radio-button name="output">Output</paper-radio-button>
          <paper-radio-button name="relay">Relay</paper-radio-button>
        </paper-radio-group>
        <paper-dropdown-menu
          label="Port"
          @selected-item-changed=${this._portChanged}
          .value=${this.ports[this.portType][0]}
        >
          <paper-listbox
            id="ports-listbox"
            slot="dropdown-content"
            selected="0"
          >
            ${this.ports[this.portType].map((port) => {
              return html`
                <paper-item .itemValue=${port}>${port}</paper-item>
              `;
            })}
        </paper-dropdown-menu>
      </form>
      `;
  }

  private _portTypeChanged(ev: CustomEvent): void {
    this.portType = ev.detail.value;
    this.portsListBox.select(0);
  }

  private _portChanged(ev: CustomEvent): void {
    if (!ev.detail.value) {
      return;
    }
    this.platform_data.output = ev.detail.value.itemValue;
  }
}
