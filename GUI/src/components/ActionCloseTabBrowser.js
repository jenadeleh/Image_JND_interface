import { globalStatus } from "./GlobalStatus";
import { sendMsg } from "./SendMsg"
import { getLocalData } from "../utils/ManageLocalData"


export function actionCloseTabBrowser() {
    window.onbeforeunload = function (e) {
        e = e || window.event;
        if (e) {
            if (globalStatus.exp_status == "decision" || 
                globalStatus.exp_status == "hit_panel" ||
                globalStatus.exp_status == "decision") {
                sendMsg({"action":"release_resource", "puid":getLocalData("puid")});
                clearTimeout(globalStatus.EXPIRE_TIMER);
                // e.returnValue = "You will lost your result if you close the tab.";
            }    
        }
    
        // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
        if (globalStatus.exp_status == "decision" || 
            globalStatus.exp_status == "hit_panel" ||
            globalStatus.exp_status == "decision") {
                sendMsg({"action":"release_resource", "puid":getLocalData("puid")});
                clearTimeout(globalStatus.EXPIRE_TIMER);
                // return ("You will lost your result if you close the tab.");
        }
    };
}
