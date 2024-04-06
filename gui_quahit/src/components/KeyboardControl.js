import * as $ from 'jquery';
import { recordCaliStartTime, increase, decrease } from "./Calibration";
import { getLocalData } from "../utils/ManageLocalData";
import { globalStatus } from "./GlobalStatus";
import { readInst, actStartExpBtn, adjustDist, addResultToCurVideo, processHit, actNextHitBtn, actDecisionBtn } from "./BtnActions"


export function keyboardControl(){
    document.onkeyup = function (event) {
        var e = event || window.event;
        var keyCode = e.keyCode || e.which || e.code;
        switch (keyCode) {
            case 13://space
            case 32://enter
                if(globalStatus.exp_status == "inst_panel") {
                    // readInst();
                } else if(globalStatus.exp_status == "dist_panel") {
                    // adjustDist();
                } else if(globalStatus.exp_status == "decision" && $("#start-exp-btn").attr("disabled")!="disabled") {
                    // actStartExpBtn();
                } else if(
                    globalStatus.exp_status == "next-hit-panel" && 
                    $("#next-hit-btn").prop("disabled") == false
                ) {
                    // actNextHitBtn();
                }
                break;
            
            case 37: // left arrow
                if(
                    globalStatus.exp_status == "decision" && 
                    globalStatus.canMakeDecision == true &&
                    globalStatus.isWarning == false
                ) {
                    // actDecisionBtn(e, "L")
                    $("#left-btn").trigger("click"); // Trigger click on left button
                    // addResultToCurVideo("L");
                    // processHit();
                }
                break

            case 39: // right arrow
                if(
                    globalStatus.exp_status == "decision" &&
                    globalStatus.canMakeDecision == true &&
                    globalStatus.isWarning == false
                ) {
                    // actDecisionBtn(e, "R")
                    console.log("Right BTN CLICKK")
                    $("#right-btn").trigger("click"); // Trigger click on left button


                    // addResultToCurVideo("R");
                    // processHit();
                }
                break
            
            case 40: // down arrow
                if(
                    globalStatus.exp_status == "decision" &&
                    globalStatus.canMakeDecision == true &&
                    globalStatus.isWarning == false
                ) {
                    if ($("#not-sure-btn").attr("disabled") != "disabled") {
                        $("#not-sure-btn").trigger("click"); // Trigger click on left button

                        // addResultToCurVideo("not sure");
                        // processHit();
                    }
                }
                break

            default:
                break;
        }
    }

    // For calibration
    // We dont really need this anymore

    // document.onkeydown = function (event) {
    //     var e = event || window.event;
    //     var keyCode = e.keyCode || e.which;
    //     switch (keyCode) {
    //         case 38://up arrow
    //             e.preventDefault();
    //             if (getLocalData("hasCalibrated") == "false") {
    //                 $("#cali-fit-btn").css("visibility", "visible");
    //                 recordCaliStartTime();
    //                 increase();
    //             }
    //             break;
    //         case 40://down arrow
    //             e.preventDefault();
    //             if (getLocalData("hasCalibrated") == "false") {
    //                 $("#cali-fit-btn").css("visibility", "visible");
    //                 recordCaliStartTime();
    //                 decrease();    
    //             }
    //             break;
    //         default:
    //             break;
    //     }
    // }
}