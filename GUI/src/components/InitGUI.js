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
import { actionCloseTabBrowser } from "./ActionCloseTabBrowser"
import { sendMsg } from "./SendMsg";
import { getLocalData } from '../../../gui_quahit/src/utils/ManageLocalData';

export function initGUI() {

    let send_data = {
      "action":"get_browser_msg",
    };

    let another_send_data = {
      "action":"is_quiz_passed", 
      "workerid":getLocalData("workerid"),
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
                  if (getLocalData("quitexp")!="true") {
                    actionCloseTabBrowser();
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

  sendMsg(another_send_data).then(response => {
    if (response["status"] == "success") {
      if (response.is_pass_quiz === true) {
        globalStatus.didPass = true;
      } else if(response.is_pass_quiz === false){
        globalStatus.didPass = false;
        showWarningCover("not_passed_quiz")
      }
    } else {
      $(".main").html("No experiment is availale now.<h2>")
    }
  });
}


