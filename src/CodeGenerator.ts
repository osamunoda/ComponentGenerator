import FormItem from './FormItem';
/**
 * Generate the FileMaker code to intgrate
 * make SQL string and replacers 
 * methods:
 * checkItems: whether all fields are filled or not
 * getFields: Select table.field1,....... FROM TABLE ---> table.field1,... list
 * getSQL: get SQL string
 * getTable/setTable: set or get tableName
 * getWhere, getOrderBy: get Where clause, OrderBy clause
 * quote: for multi-bytes character, use "SELECT \"table\".\"field\", ..... FROM TABLE" style
 * setOptions(replacerName, description of replacer) 
 * getOptions: ;["__OPTION1__"; input1.value];["__OPTION2__"; input2.value] ... 
 * setBasicCode: template code for FileMaker calculation code
 */

export default class CodeGenerator extends HTMLElement {
    private basicCode: string;/** template code */
    private fields: string[];/** field labels */
    private descriptions: string[];/** description of fields */
    private orderBy: FormItem | null;/** order by clause */
    private isDescending: boolean;
    private where: FormItem | null;/** where clause */
    private items: FormItem[];
    private options: string[];/** the name list of replacers [option1, option2, ... ]*/
    private optionDescriptions: string[];/** description of option */

    private _shadow: ShadowRoot;
    private _code: HTMLInputElement | null;
    private _btn: HTMLElement | null;
    private _container: HTMLElement | null;
    private _optionsArea: HTMLElement | null;
    private tableName: string;


    constructor(fields: string[], descriptions: string[]) {
        super();
        this.fields = fields;
        this.descriptions = descriptions;
        this.orderBy = null;
        this.isDescending = false;
        this.where = null;
        this.tableName = "";
        this.basicCode = "";
        this.items = [];
        this.options = [];
        this.optionDescriptions = [];
        const shadow = this.attachShadow({ mode: "closed" });
        shadow.innerHTML = `<style>
        :host{
            font:sans-serif;
            color:rgba(0,0,0,0.9);
            width:400px;
            display:flex;
        }
        .top{
            width:200px;
            border:3px solid;
            border-radius:4px;
            box-sizing:border-box;
            flex:1;
            position:relative;
        }
        input{
            margin:4px;
            box-sizing:border-box;
        }
        textarea{
            opacity:0;
            height:0;
            margin:0;
            box-sizing:border-box;
        }
        #btn{
            display:flex;
            justify-content:center;
            align-items:center;
            width:80%;
            border:2px solid;
            padding:1rem;
            border-radius:6px;
            box-sizing:border-box;
            position:absolute;
            left:10%;
            bottom:5px;
        }
        #optionsArea{
            margin:4px 0;
        }
        #btn:hover{
            background:pink;
        }
        </style>
        <div id="container" class="top">
        </div>
        <div class="top">
            <div id="optionsArea"></div>
            <div id="btn">Get Code</div>
            <textarea id="code" contentEditable tabIndex="-1"></textarea>
        </div>
        `;
        this._shadow = shadow;
        this._code = shadow.querySelector("#code") || null;
        this._btn = shadow.querySelector("#btn") || null;
        this._container = shadow.querySelector("#container") || null;
        this._optionsArea = shadow.querySelector("#optionsArea") || null;
    }
    connectedCallback() {
        this.fields.forEach((field, index) => {
            const formItem = new FormItem(field, this.descriptions[index], this, falsy);
            if (this._container) {
                this._container.appendChild(formItem);
                this.items.push(formItem);
            }
        })
        const orderBy = new FormItem("orderBy", "sort order", this, falsy);
        const where = new FormItem("where", "filter", this, falsy);
        this.orderBy = orderBy;
        this.where = where;
        if (this._container) {
            this._container.appendChild(orderBy);
            //this._container.appendChild(where);
        }
        if (this.options.length) {
            this.options.forEach((option, index) => {
                const formItem = new FormItem(option, this.optionDescriptions[index], this, falsy);
                if (this._optionsArea) {
                    this._optionsArea.appendChild(formItem);
                }
            })
        } else {
            if (this._optionsArea) {
                this._optionsArea.style.display = "none";
            }
        }
        if (this._btn) {
            this._btn.onmouseup = () => {
                if (!this.checkItems()) {
                    alert("There are errors in input values");
                    return;
                }
                if (this._code) {
                    this._code.value = this.basicCode.replace("__SQLSTRING__", this.getSQL());
                    this._code.value = this._code.value.replace("__OPTIONS__", this.getOptions());
                    this._code.focus();
                    this._code.select();
                    setTimeout(() => {
                        document.execCommand("copy");
                        alert("Copied! Paste this code into the Text Object named 'SortByDrag_FMcode' in layout mode");
                    }, 0);
                }
            }
        }

    }
    /**
     * check whether all fields are filled
     */
    checkItems() {
        let result = true;
        this.items.forEach(item => {
            if (item.errorCheck()) {
                result = false;
            }
        });
        if (this.orderBy && this.orderBy.errorCheck()) {
            result = false;
        }
        if (this.errorOptions()) {
            result = false;
        }
        return result;
    }
    getFields() {
        //alert("getFields");
        let arr: string[] = [];
        let result = true;
        console.log("getFields", this.items);
        this.items.forEach(item => {
            const text = item.get();
            //alert(text);
            if (!text) {
                result = false;
            } else {
                arr.push(`'\\\"' + ${this.quote(item.get())} + '\\\"'`)
            }
        });
        return result ? arr.join(",") : "";
    }
    getSQL() {
        //alert("getSQL");;
        const fields = this.getFields();
        if (!fields) return "";
        let str = "SELECT " + fields;
        if (this.getTable()) {
            str += " FROM " + this.getTable();
        }
        if (this.getWhere()) {
            str += this.getWhere()
        }
        if (this.getOrderBy()) {
            str += this.getOrderBy();
        }
        return str;
    }
    setTable(tableName: string) {
        this.tableName = tableName;
    }
    getTable() {
        //alert("tabele:" + this.tableName);
        return `\\\"${this.tableName}\\\"`;
    }
    getWhere() {
        //where condition: panelOrder > 0
        const value = (this.orderBy && this.orderBy.get()) ? ` WHERE ${this.quote(this.orderBy.get())} > 0` : "";
        return value;
    }
    getOrderBy() {
        const value = (this.orderBy && this.orderBy.get()) ? ` ORDER BY ${this.quote(this.orderBy.get())}` : "";
        return value;
    }
    quote(text: string) {
        const arr = text.split(".");
        const converted = arr.map(item => `\\\"${item}\\\"`);
        return arr.length === 2 ? converted.join(".") : text;
    }
    getOptions() {
        if (this._optionsArea) {
            const optionItems = Array.from<FormItem>(this._optionsArea.querySelectorAll("form-item"));
            const converted = optionItems.map((item, index) => `;["__${this.options[index].toUpperCase()}__";"${item.get()}"]`);
            return converted.join("")
        } else {
            return "";
        }
    }
    static get observedAttributes() {
        return [];
    }
    setBasicCode(str: string) {
        this.basicCode = str;
    }
    setOptions(option: string, description?: string) {
        this.options.push(option);
        this.optionDescriptions.push(description || "");
    }
    errorOptions() {
        let result = false;
        if (this._optionsArea) {
            const optionItems = Array.from<FormItem>(this._optionsArea.querySelectorAll("form-item"));
            optionItems.forEach(item => {
                if (item.errorCheck()) {
                    result = true;
                }
            })
        }
        return result;
    }
    attributeChangedCallback(attr: string, oldValue: string, newValue: string) {

    }
}
function falsy(value: any) {
    console.log("falsy", value);
    return value === null || value === undefined || value === ""
}
customElements.define("code-generator", CodeGenerator);