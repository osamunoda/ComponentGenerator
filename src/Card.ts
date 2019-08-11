/**
 * Items of ListColumn
 * methods:
 * getID: return id
 */
export interface CardProps {
    width: number,
    height: number,
    backgroundType: string,
    background: string,
    text1: string,
    text2: string,
    id: string
}
export default class DraggableCard extends HTMLElement {
    private _id: string;
    private _width: number;
    private _height: number;
    private _background: string;
    private _text1: string;
    private _text2: string;
    private _mainText: HTMLHeadingElement | null;
    private _subText: HTMLParagraphElement | null;
    private _shadow: ShadowRoot | null;

    constructor(width: number, height: number, backgroundType: string, background: string, text1: string, text2: string, id: string) {
        super();
        this._id = id;
        this._width = width || 200;
        this._height = height || 100;
        this._background = backgroundType === "base64" ? `url(${background})` : (background || "pink");
        this._text1 = text1 || "Main Text";
        this._text2 = text2 || "Sub Text";
        const shadowRoot = this.attachShadow({ mode: "closed" });
        shadowRoot.innerHTML = `<style>
        :host{
            margin:0;padding:0;
            --width:${this._width};
            --height:${this._height};
            --background:${this._background};
        }
        #main {
            font-family:sans-serif;
            box-sizing:border-box;
            background: var(--background);
            width:calc(1px*var(--width));
            height:calc(1px*var(--height));
            position:relative;
            border:1px solid #ccc;
            display:flex;
            justify-content:center;
            align-items:center;
            flex-direction:column;
            opacity:0.8
        }
        </style>
        <div id="main">
            <h1>${this._text1}</h1>
            <p>${this._text2}</p>
        </div>
        `;
        this._mainText = shadowRoot.querySelector("h1");
        this._subText = shadowRoot.querySelector("p");
        this._shadow = shadowRoot;
    }

    static get observedAttributes() {
        return ["data-text1", "data-text2", "data-background", "data-width", "data-height"]
    }
    getID() {
        return this._id;
    }
    attributeChangedCallback(attr: string, oldValue: string, newValue: string) {
        if (attr === "data-text1") {
            this._text1 = newValue;
            if (this._mainText) {
                this._mainText.innerText = newValue;
            }
        } else if (attr === "data-text2") {
            this._text2 = newValue;
            if (this._subText) {
                this._subText.innerText = newValue;
            }
        } else if (attr === "data-background") {
            this._background = newValue;
            if (this._shadow) {
                const sheet = <CSSStyleSheet>this._shadow.styleSheets[0];
                const rule = <CSSStyleRule>sheet.rules[0];
                rule.style.setProperty("--background", newValue);
            }
        } else if (attr === "data-width") {
            this._width = Number(newValue);
            if (this._shadow) {
                const sheet = <CSSStyleSheet>this._shadow.styleSheets[0];
                const rule = <CSSStyleRule>sheet.rules[0];
                rule.style.setProperty("--width", newValue);
            }
        } else if (attr === "data-height") {
            this._height = Number(newValue);
            if (this._shadow) {
                const sheet = <CSSStyleSheet>this._shadow.styleSheets[0];
                const rule = <CSSStyleRule>sheet.rules[0];
                rule.style.setProperty("--height", newValue);
            }
        }
    }

    connectedCallback() {
        //console.log("connectedCallback", this._text1)
        this.dataset.text1 = this._text1;
        //this.setAttribute("text1", this._text1);
        this.dataset.text2 = this._text2;
        this.dataset.background = this._background;
        this.dataset.width = this._width + "";
        this.dataset.height = this._height + "";
        this.setAttribute("id", this._id);
        ////console.log("connectedCallback end")
    }
}
customElements.define("draggable-card", DraggableCard);
