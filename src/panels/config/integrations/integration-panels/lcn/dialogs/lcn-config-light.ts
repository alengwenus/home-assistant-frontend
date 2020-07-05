import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-input/paper-input";
import { PaperInputElement } from "@polymer/paper-input/paper-input";
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
  PropertyValues,
  queryAll,
} from "lit-element";
import { html } from "lit-html";
import "../../../../../../components/ha-switch";
import { HomeAssistant } from "../../../../../../types";
import { haStyleDialog } from "../../../../../../resources/styles";
import { LightConfig } from "../../../../../../data/lcn";

interface Port {
  name: string;
  value: string;
}

@customElement("lcn-config-light-element")
export class LCNConfigLightElement extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() public domainData: LightConfig = {
    output: "OUTPUT1",
    dimmable: false,
    transition: 0,
  };

  @property() private _portType: string = "output";

  @property() private _invalid: boolean = false;

  @query("#ports-listbox") private _portsListBox;

  @queryAll("paper-input") private _inputs!: PaperInputElement[];

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

  protected update(changedProperties: PropertyValues) {
    super.update(changedProperties);
    const isInvalid = (inp) => inp.invalid;
    this._invalid = Array.from(this._inputs).some(isInvalid);
    this.dispatchEvent(
      new CustomEvent("validity-changed", {
        detail: this._invalid,
        bubbles: true,
        composed: true,
      })
    );
  }

  protected render(): TemplateResult {
    return html`
      <div>
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
          .value=${this._ports[this._portType][0].name}
        >
          <paper-listbox
            id="ports-listbox"
            slot="dropdown-content"
            @selected-item-changed=${this._portChanged}
          >
            ${this._ports[this._portType].map((port) => {
              return html`
                <paper-item .itemValue=${port.value}>${port.name}</paper-item>
              `;
            })}
          </paper-listbox>
        </paper-dropdown-menu>

        <div id="dimmable">
          <label>Dimmable:</label>
          <ha-switch
            .checked=${this.domainData.dimmable}
            @change=${(ev) => (this.domainData.dimmable = ev.target.checked)}
          ></ha-switch>
        </div>

        <paper-input
          label="Transition"
          type="number"
          value="0"
          min="0"
          max="486"
          @value-changed=${(ev) =>
            (this.domainData.transition = +ev.detail.value)}
          .invalid=${this._validateTransition(this.domainData.transition)}
          error-message="Transition must be in 0..486."
        ></paper-input>
      </div>
    `;
  }

  private _portTypeChanged(ev: CustomEvent): void {
    this._portType = ev.detail.value;
    this._portsListBox.selectIndex(0);

    const port = this._ports[this._portType][this._portsListBox.selected];
    this.domainData.output = port.value;
  }

  private _portChanged(ev: CustomEvent): void {
    if (!ev.detail.value) {
      return;
    }
    const port = this._ports[this._portType][this._portsListBox.selected];
    this.domainData.output = port.value;
  }

  private _validateTransition(transition: number): boolean {
    return !(transition >= 0 && transition <= 486);
  }

  static get styles(): CSSResult[] {
    return [
      haStyleDialog,
      css`
        #ports-listbox {
          width: 120px;
        }
        #dimmable {
          margin-top: 10px;
        }
        ha-switch {
          margin-left: 25px;
        }
      `,
    ];
  }
}
