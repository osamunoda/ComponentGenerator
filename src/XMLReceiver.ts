import ListColumn from "./ListColumn";
/**
 * Receive XML file via drag-and-drop
 * parse XML, extract tables/fields data
 * provides data-source to ListColumn
 */
export default class XMLReceiver extends HTMLElement {
    private xml: Document;/**Dropped XML file */
    private _shadow: ShadowRoot;
    private _receiver: HTMLElement | null;/** Drop Area */
    private _frame: HTMLElement | null;/** All Area */
    private toTable: Map<string, string>;/** TO - Table map */
    private toFields: Map<string, string[]>;/** TO - Fields map */
    private tableFields: Map<string, string[]>;/** Table - Fields map */
    private link: ListColumn;
    constructor(link: ListColumn) {
        super();
        this.link = link;
        this.xml = new Document();
        const shadow = this.attachShadow({ mode: "closed" });
        shadow.innerHTML = `<style>
            :host{
                margin:0; padding:0;
            }
            #frame{
                width:100vw;
                height:100vh;
                display:flex;
                justify-content:center;
                align-items:center;
                flex-direction:column;
                background:white;
                transition.0.5s;
            }
            #receiver{
                width:300px;
                height:300px;
                border:3px dashed #ccc;
                border-radius:10px;
                transition:0.5s;
                display:flex;
                justify-content:center;
                align-items:center;
            }

        </style>
            <div id = "frame">
                <h1>Drop XML file here</h1>
                <div id="receiver"><svg xmlns="http://www.w3.org/2000/svg" width="124" height="124" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0V0z"/><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg></div>
            </div>
        `;
        this._shadow = shadow;
        this._frame = shadow.querySelector("#frame");
        this._receiver = shadow.querySelector("#receiver");
        this.toTable = new Map();
        this.toFields = new Map();
        this.tableFields = new Map();
    }
    connectedCallback() {
        if (this._receiver) {
            this._receiver.ondragover = (e: DragEvent) => {
                e.stopPropagation();
                e.preventDefault();
                if (e.dataTransfer) {
                    e.dataTransfer.dropEffect = 'copy';
                }
            };
            this._receiver.ondrop = (e: DragEvent) => {
                e.stopPropagation();
                e.preventDefault();
                if (e.dataTransfer) {
                    const file = e.dataTransfer.files[0];
                    const reader = new FileReader();
                    /** Define the handler of XML file read */
                    reader.onload = (e: any) => {
                        const result = e.target.result;
                        const parser = new DOMParser();
                        this.xml = parser.parseFromString(result, "text/xml");
                        /** TOName - TableName map*/
                        this.xml.querySelectorAll("AddAction > TableOccurrenceCatalog > TableOccurrence").forEach(to => {
                            let tableName: string = "";
                            const table = to.querySelector("BaseTableReference");
                            if (table) {
                                tableName = table.getAttribute("name") || "";
                            }
                            this.toTable.set(to.getAttribute("name") || "", tableName);
                        });
                        /** TOName-Fields map, TableName-Fields map */
                        this.xml.querySelectorAll("AddAction > FieldsForTables > FieldCatalog > TableOccurrenceReference").forEach(table => {
                            const fields: string[] = [];
                            if (table.parentNode) {
                                table.parentNode.querySelectorAll("ObjectList > Field").forEach(field => {
                                    fields.push(field.getAttribute("name") || "")
                                });
                            }
                            const toName = table.getAttribute("name") || "";
                            this.toFields.set(toName, fields);
                            const tableName = this.toTable.get(toName) || "";
                            this.tableFields.set(tableName, fields);
                        });
                        this.link.setItems(this.getTables().join(","));
                        if (this._receiver) {
                            this._receiver.style.transform = "scale(10)";
                            this._receiver.style.opacity = "0";
                            setTimeout(() => {
                                this.style.display = "none";
                            }, 500);
                        }
                    }
                    /** Read the dropped file */
                    if (file) {
                        reader.readAsText(file);
                    }
                }
            }
        }
    }
    getTables() {
        const TOs = Array.from<string>(this.toFields.keys());
        return TOs;
    }
    getFields(tableName: string) {
        const fields = this.toFields.get(tableName);
        return fields;
    }
    getXML() {
        return this.xml;
    }
    /**
     * This custom element is used only in JS, not in HTML
     * So I omit the definition of observedAttributes/attributeChangedCallback
     */
    static get observerdAttributes() {
        return [];
    }
    attributeChangedCallback(attr: string, oldValue: string, newValue: string) {

    }
}
customElements.define("xml-receiver", XMLReceiver);