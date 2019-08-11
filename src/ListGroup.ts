import ListColumn from './ListColumn'
/**
 * Group of ListColumns
 * methods:
 * addColumn: append a ListColumn to this group
 * getList: return ListColumns of this group
 */

export default class ListGroup extends HTMLElement {
    private columns: NodeListOf<Element> | null;
    private width: number;
    private height: number;
    private _shadow: ShadowRoot;
    private _slot: HTMLElement | null;
    constructor(width: number, height: number, columns?: NodeListOf<Element>) {
        super();
        this.columns = columns || null;
        this.width = width;
        this.height = height;
        const _shadow = this.attachShadow({ mode: "closed" });
        _shadow.innerHTML = `<style>
        :host{
            position:relative;
            width:${this.width}px;
            height:${this.height}px;
        }
        div.container{
            display:flex;
            justify-contenet:flex-start;
            align-items:flex-start;
            position:relative;
            width:${this.width}px;
            height:${this.height}px;
        }
        </style>
        <div class="container"><slot></slot></div>`;
        this._shadow = _shadow;
        this._slot = _shadow.querySelector("div.container");
    }
    connectedCallback() {
        console.log("connected callback")
        this.columns = this._shadow.querySelectorAll("list-column");
        this.dataset.width = this.width + "";
        this.dataset.height = this.height + "";
    }
    static get observedAttributes() {
        return ["data-width", "data-height"]
    }
    attributeChangedCallback(attr: string, oldValue: string, newValue: string) {
        console.log("changed callback");
        if (attr === "data-width") {
            this.style.width = newValue + "px";
        } else if (attr === "data-height") {
            this.style.height = newValue + "px";
        }
    }
    addCoulumn(column: ListColumn) {
        if (this._slot) {
            this._slot.appendChild(column);
        }
    }
    getList() {
        return this.columns;
    }
}

customElements.define("list-group", ListGroup);