/**
 * show the list data in column with animation
 * methods:
 * setSelected/getSelected: set/get selected element
 * showSelected: display selected element
 * clearItems: reset selected item
 * getScroll: return amount of y-scroll
 * setParent/getParent: set/get relationships of columns
 * setItems: set the list data of this element
 */
export default class ListColumn extends HTMLElement {
    private name: string;/** displayed in the top of this element */
    private items: string[];/** data to be displayed */
    private width: number;
    private height: number;
    private _shadow: ShadowRoot;
    private _coulmn: HTMLElement | null;
    private drag: boolean;/** list items are draggable or not */
    private selected: HTMLElement | null;
    private selectedText: string;/** text of the element currently selected */
    private parent: ListColumn | null;/** parent-child relationship between ListColumns */
    private handler: (e: MouseEvent) => void;
    private noAnimation: boolean;
    private yScroll: number;/** monitor the scroll amount of this column */

    constructor(name: string, width: number, height: number, items: string[], handler: (e: MouseEvent) => void, draggable: boolean, noAnimation: boolean, selected: string, scroll: number) {
        super();
        this.name = name;
        this.width = width;
        this.height = height;
        this.items = items || [];
        this.handler = handler;
        this.drag = draggable || false;
        const _shadow = this.attachShadow({ mode: "closed" });
        this.selected = null;
        this.parent = null;
        this.noAnimation = noAnimation || false;
        this.selectedText = selected || "";
        const transform = this.noAnimation ? "none" : "translateY(1000px)";
        const transition = this.noAnimation ? "none" : "0.3s";
        this.yScroll = scroll || 0;
        _shadow.innerHTML = `<style>
            *{margin:0; padding:0;}
            :host{
                box-sizing:border-box;
                display:block;
                width:${this.width}px;
                position:relative;
                margin:0;
                padding:0;
                border:2px solid;
                overflow:hidden;
                position:relative;
                height:${this.height}px;
            }
            div{
                height:2rem;
                border-bottom:1px solid #ccc;
                display:flex;
                justify-content:flex-start;
                align-items:center;
                padding-left:1rem;
            }
            ul{
                position:relative;
                width:${this.width}px;
                height:calc(${this.height}px - 2rem);
                overflow:scroll;
                list-style:none;
                padding:0;
                
            }
            li{
                display:flex;
                justify-content:center;
                align-items:center;
                width:calc(100% - 4px);
                box-sizing:border-box;
                height:100px;
                transition:${transition};
                
                height:100px;
                border:1px solid #ccc;
                transform:${transform};
            }
        </style>
        <div>${this.name}</div>
        <ul>
            <slot></slot>
        </ul>

        `;
        this._shadow = _shadow;
        this._coulmn = _shadow.querySelector("ul");
    }

    connectedCallback() {
        this.dataset.width = this.width + "";
        this.dataset.height = this.height + "";
        this.dataset.items = this.items.join(",");
        if (this._coulmn && this.noAnimation) {
            const lis = this._coulmn.querySelectorAll("li");
            lis.forEach(item => {
                {
                    item.style.transition = "none";
                    if (item.innerText === this.selectedText) {
                        item.style.background = "pink";
                    } else {
                        item.style.background = "white";
                    }
                }
            });
        }
        if (this._coulmn) {
            this._coulmn.scrollTo(0, this.yScroll);
        }
    }
    static get observedAttributes() {
        return ["data-width", "data-height", "data-items"];
    }
    setSelected(target: HTMLElement) {
        this.selected = target;
        this.selectedText = target.innerText;
        this.showSelected(target);
    }
    getSelected() {
        return this.selectedText ? this.selectedText : "";
    }
    getScroll() {
        return this._coulmn ? this._coulmn.scrollTop : 0;
    }
    showSelected(target: HTMLElement) {
        if (this._coulmn) {
            const lis = this._coulmn.querySelectorAll("li");
            lis.forEach(li => {
                li.style.background = "white";
            });
            target.style.background = "pink";
        }
    }
    setParent(parent: ListColumn) {
        this.parent = parent;
    }
    getParent() {
        return this.parent;
    }
    clearItems() {
        if (this._coulmn) {
            const lis = this._coulmn.querySelectorAll("li");
            lis.forEach(li => {
                if (this._coulmn) {
                    this._coulmn.removeChild(li)
                }
            })
        }
    }

    setItems(data: string | string[]) {
        this.dataset.items = Array.isArray(data) ? data.join(",") : data;
    }

    attributeChangedCallback(attr: string, oldValue: string, newValue: string) {
        if (attr === "data-width") {
            this.style.width = Number(newValue) + "px";
        } else if (attr === "data-height") {
            this.style.height = Number(newValue) + "px";
        } else if (attr === "data-items") {
            if (!newValue || !newValue.length) return;
            this.clearItems();
            this.items = newValue.split(",").map(item => item.trim());
            this.items.forEach((item, index) => {
                const li = document.createElement("li");
                li.onclick = this.handler;
                if (this.drag) {
                    li.setAttribute("draggable", "true");
                    li.ondragstart = (e: any) => {
                        const parent = this.getParent();
                        const text = parent ? parent.getSelected() + "." + li.innerText : li.innerText;
                        e.dataTransfer.setData('text', text);
                    };
                }
                li.innerText = item;
                if (this._coulmn) {
                    this._coulmn.appendChild(li);
                    if (!this.noAnimation) {
                        setTimeout(() => {
                            li.style.transitionDelay = index * 0.1 + "s"
                            li.style.transform = "translateY(0)";
                        }, 300)
                    }

                }
            })
        }
    }
}
customElements.define("list-column", ListColumn);