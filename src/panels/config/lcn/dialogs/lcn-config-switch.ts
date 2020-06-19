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
  TemplateResult,
  CSSResult,
  query,
} from "lit-element";
import { html } from "lit-html";
import { haStyleDialog } from "../../../../resources/styles";
import { SwitchConfig } from "../../../../data/lcn";

interface Port {
  name: string;
  value: string;
}

@customElement("lcn-config-switch-element")
export class LCNConfigSwitchElement extends LitElement {
  @property() public domainData: SwitchConfig = { output: "OUTPUT1" };

  @property() private _portType: string = "output";

  @query("#ports-listbox") private _portsListBox;

  private _outputPorts: Port[] = [
    { name: "Output 1", value: "OUTPUT1" },
    { name: "Output 2", value: "OUTPUT2" },
    { name: "Output 3", value: "OUTPUT3" },
    { name: "Output 4", value: "OUTPUT4" },
  ];

  private _relayPorts: Port[] = [
    { name: "Relay 1", value: "RELAY1" },
    { name: "Relay 2", value: "RELAY2" },
    { name: "Relay 3", value: "RELAY3" },
    { name: "Relay 4", value: "RELAY4" },
    { name: "Relay 5", value: "RELAY5" },
    { name: "Relay 6", value: "RELAY6" },
    { name: "Relay 7", value: "RELAY7" },
    { name: "Relay 8", value: "RELAY8" },
  ];

  private _ports = { output: this._outputPorts, relay: this._relayPorts };

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
          .value=${this._ports[this._portType][0].name}
        >
          <paper-listbox
            id="ports-listbox"
            slot="dropdown-content"
            selected="0"
          >
            ${this._ports[this._portType].map((port) => {
              return html`
                <paper-item .itemValue=${port.value}>${port.name}</paper-item>
              `;
            })}
        </paper-dropdown-menu>
      </form>
      `;
  }

  private _portTypeChanged(ev: CustomEvent): void {
    this._portType = ev.detail.value;
    this._portsListBox.select(0);
  }

  private _portChanged(ev: CustomEvent): void {
    if (!ev.detail.value) {
      return;
    }
    this.domainData.output = ev.detail.value.itemValue;
  }

  static get styles(): CSSResult[] {
    return [
      haStyleDialog,
      css`
        #ports-listbox {
          width: 120px;
        }
      `,
    ];
  }
}
