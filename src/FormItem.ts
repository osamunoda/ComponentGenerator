import CodeGenerator from "./CodeGenerator";
/**
 * used in CodeGenerator
 * consists of title-description-input
 * drag field from ColumnList, then drop on this input.
 * tableName.fieldName is saved in input field 
 * methods:
 * get: return input.value
 * table: return tableName
 * errorCheck: check whether input value is proper or not
 */
export default class FormItem extends HTMLElement {
    private fieldName: string;/** tableName.fieldName */
    private _input: HTMLInputElement | null;
    private description: string;
    private color: string;
    private tableName: string;/** tableName */
    private errorChecker: (value: any) => boolean;

    private _shadow: ShadowRoot;
    private _container: HTMLElement | null;
    private parent: CodeGenerator;/** which this FormItem belongs to */
    constructor(fieldName: string, description: string, parent: CodeGenerator, checker: (value: any) => boolean, color?: string) {
        super();
        this.fieldName = fieldName;
        this.description = description;
        this.errorChecker = checker;

        this.color = color || "black";
        this.tableName = "";
        this.parent = parent;
        const shadow = this.attachShadow({ mode: "closed" });
        shadow.innerHTML = `<style>
        div{padding:5px}
        .container{border-bottom:1px solid #ccc}
        </style>
        <div class="container">
            <div>${this.fieldName}<span>( ${this.description} )</span></div>
            <input />
        </div>
        `;
        this._shadow = shadow;
        this._input = shadow.querySelector("input");
        this._container = shadow.querySelector(".container");
    }
    errorCheck() {
        if (this._input && !this._input.value && this._container) {
            const isError = this.errorChecker(this._input.value);
            if (isError) {
                this._container.style.color = "red";
            }
            return isError;
        } else {
            return false;
        }
    }
    get() {
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
                    if (this._container) {
                        this._container.style.color = this.color;
                    }
                }
            }
            this._input.onchange = (e) => {
                console.log("alert input change")
                if (!this.errorCheck() && this._container) {
                    this._container.style.color = this.color;
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