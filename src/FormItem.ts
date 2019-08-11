import CodeGenerator from "./CodeGenerator";
/**
 * used in CodeGenerator
 * consists of title-description-input
 * drag field from ColumnList, then drop on this input.
 * tableName.fieldName is saved in input field 
 * methods:
 * get: return input.value
 * table: return tableName
 */
export default class FormItem extends HTMLElement {
    private fieldName: string;/** tableName.fieldName */
    private _input: HTMLInputElement | null;
    private description: string;
    private color: string;
    private tableName: string;/** tableName */
    private _shadow: ShadowRoot;
    private parent: CodeGenerator;/** which this FormItem belongs to */
    constructor(fieldName: string, description: string, parent: CodeGenerator, color?: string) {
        super();
        this.fieldName = fieldName;
        this.description = description;
        this.color = color || "black";
        this.tableName = "";
        this.parent = parent;
        const shadow = this.attachShadow({ mode: "closed" });
        shadow.innerHTML = `<style>
        div{padding:5px}
        .container{border-bottom:1px solid}
        </style>
        <div class="container">
            <div>${this.fieldName}<span>( ${this.description} )</span></div>
            <input />
        </div>
        `;
        this._shadow = shadow;
        this._input = shadow.querySelector("input");
    }
    get() {
        if (this._input && !this._input.value) {
            this._input.style.color = "red";
        }
        return this._input ? this._input.value : "";
    }
    table() {
        return this.tableName;
    }
    connectedCallback() {
        if (this._input) {
            this._input.ondragover = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'copy';
                }
            };
            this._input.ondrop = (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (e.dataTransfer && this._input) {
                    this._input.value = e.dataTransfer.getData("Text");
                    this.tableName = this._input.value.split(".").length === 2 ? this._input.value.split(".")[0] : "";
                    this.parent.setTable(this.tableName);
                }
            }
            this._input.onchange = (e) => {
                if (this._input && this._input.value) {
                    this._input.style.color = this.color;
                }
            }
        }
    }
    static get observerdAttributes() {
        return [];
    }
    attributeChangedCallback(attr: string, oldValue: string, newValue: string) {

    }
}
customElements.define("form-item", FormItem);