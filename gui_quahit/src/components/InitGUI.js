import * as $ from 'jquery';
import { initDoms } from "./InitDoms"
import { req_inst_cf } from "./ConsentForm"
import { 
    checkEnvBackground, 
    isPC, 
    showWarningCover, 
    isCorrectResolution, 
    isCorrectBrowser, 
    getBrowserInfo, 
    reso_warnings 
} from "./Environment"; 

import { globalStatus } from "./GlobalStatus";
import { keyboardControl } from "./KeyboardControl";
import { initLocalData } from "./InitLocalData";
import { sendMsg } from "./SendMsg";
import { getLocalData } from '../../../gui_quahit/src/utils/ManageLocalData';

export function initGUI() {

    let send_data = {
      "action":"get_browser_msg",
    };

    sendMsg(send_data).then(response => {
        if (response["status"] == "successful") {
            globalStatus.wrong_browser_msg = response["wrong_browser_msg"];
            if (!isPC()) {
                showWarningCover("mobile_device");
            } else if (!isCorrectBrowser()) {
                showWarningCover("correct_browser");
            } else if (!isCorrectResolution()) {
                $("#warning-cover").css("visibility", "visible");
                $("#warning-msg").html(reso_warnings());
            } else {
                checkEnvBackground();
                if (!globalStatus.isNotMaximizedBrowser) {
                    if (getLocalData("didTraining")!="true") {
                        getBrowserInfo();
                        initDoms();
                        keyboardControl();
                        req_inst_cf();
                    } else {
                        $(".main").html("<h2>You already participated in the experiment. No experiment is availale now.<h2>")
                    }
                }
            }
        }
    });
}


