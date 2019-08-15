import ListColumn from './ListColumn';
import ListGroup from './ListGroup';
import CodeGenerator from './CodeGenerator';
import XMLReceiver from './XMLReceiver';

/**
 * Code Generator for SortByDrag3
 * ------------
 * index.html and bundle.js in public are main files
 * When using as a single file, merge bundle.js into index.html
 * ------------
 * This code is written for both browser and webviewer of FileMaker
 * To use this in browser, set FM_Mode to false
 */

/** Disable FM_MODE  */
const FM_MODE = false;
const status = {
    tables: "__TABLES__",
    selectedTable: "__SELECTEDTABLE__",
    fields: "__FIELDS__",
    scroll: Number("__SCROLL__")
};
if (!FM_MODE) {
    status.fields = ""
}

/** Setup */
/** col1, col2: ListColumn for displaying data
 *  group: ListGroup for binding ListColumns
 *  receiver: CodeGenerator which generate FileMaker calculation code
 *  xmlReceiver: XMLReceiver whch receives dropped XML file and parse, then extract tables and fields of the file
 */

const col1 = new ListColumn("TOs", 200, 680, status.tables.split(","), (e: MouseEvent) => {
    if (e.target && e.target instanceof HTMLElement) {
        col1.setSelected(e.target);
        const fields = xmlReceiver.getFields(e.target.innerText) || [];
        if (fields.length) {
            col2.setItems(fields.join(","))
        }
        //FM:location.href = 'fmp://$/__DB__?script=wizard_driver&$selectedTable=' + e.target.innerText + "&$scroll=" + col1.getScroll();
    }
    col2.setParent(col1);
    //FM:col2.dataset.items = status.fields;
}, false, true, status.selectedTable, status.scroll);
const col2 = new ListColumn("Fields", 200, 680, status.fields.split(','), (e: MouseEvent) => {
    if (e.target && e.target instanceof HTMLElement) {
        // Do nothing
    }
}, true, false, "", 0);
const group = new ListGroup(400, 500);
/** Restrict the animation of first column */
if (status.selectedTable) {
    col1.style.transition = 'none';
}
col2.setParent(col1);
group.addCoulumn(col1);
group.addCoulumn(col2);

const receiver = new CodeGenerator(["id", "panel_order", "Main text", "Sub Text", "background"], ["Record ID", "order number", "Main text displayed in center", "Sub text", "background color or image"])

/** setup template for FileMaker calculation code */
receiver.setBasicCode(` Let(code=GetLayoutObjectAttribute ( "sortByDrag"; "content" ); 
Substitute ( code; ["__SQLRESULT__"; ExecuteSQL("__SQLSTRING__"; ""; "],[")]; ["__SORTDB__"; Get(FileName)];["__SORTSCROLL__";$scroll]; ["__ORDER__"; $panelOrder]__OPTIONS__)
)`);
receiver.setOptions("columns", "Number of columns");
receiver.setOptions("cardHeight", "height of card");

const xmlReceiver = new XMLReceiver(col1);

const root = document.getElementById("root");
if (root) {
    root.appendChild(group);
    root.appendChild(receiver);
}
/** Hide over root */
document.body.appendChild(xmlReceiver);

