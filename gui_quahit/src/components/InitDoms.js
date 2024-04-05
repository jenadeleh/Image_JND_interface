import * as $ from 'jquery';
import { readInst, actStartExpBtn, actDecisionBtn, actNextHitBtn, adjustDist, tryAgainAction} from "./BtnActions"
import { submitCf } from "./ConsentForm"
import { storeLocalData, getLocalData } from "../utils/ManageLocalData"
import { globalStatus } from "./GlobalStatus";
import { startTraining } from "./BtnActions";
import { sendMsg } from './SendMsg';

export function initDoms() {
    $('#start-exp-btn').on('click', (e)=> {
        actStartExpBtn(e);
    });
    
    $('.decision-btn').on('click',(e)=> {
        if(
            globalStatus.exp_status == "decision" && 
            globalStatus.canMakeDecision == true &&
            globalStatus.isWarning == false
        ){
            actDecisionBtn(e);
        } else {
            console.log("Can not make decision")
        }
    
    });

    $('#next-hit-btn').on('click', (e)=> {
        actNextHitBtn(e);
    });

    $('#quit-exp-btn').on('click', (e)=> {
        $("#msg-panel").html(globalStatus.text_end_exp).css("display", "inline");
        $("#hit-end-panel, #hit-panel").css("display", "none");
    });

    $("#cali-adjust-dist").on('click', (e)=> {
        adjustDist(e);
    });

    $("#read-inst-btn").on('click', (e)=> {
        readInst(e);
    });

    $("#try-again-btn").on('click', (e)=> {
      tryAgainAction(e);
    });

    $("#start-training-btn").on('click', (e)=> {
      startTraining(e);
    });
    

    let $cf_form = $("#cf-form");
    $cf_form.on("submit", () =>{
        let params = {};
        $cf_form.serializeArray().forEach((element)=>{
            params[element.name] = element.value;
        });
        storeLocalData("workerid", params.workerid);
        submitCf(params.workerid);
        return false;
    })

    let $survey_form = $("#survey-form");
    $survey_form.on("submit", () =>{
        let params = {};
        $survey_form.serializeArray().forEach((element)=>{
            params[element.name] = element.value;
        });
        getLocalData("workerid");
        params["hit"] = "qua"
        let send_data = {
            "action": "survey",
            "workerid": getLocalData("workerid"),
            "result": params,
            "euid": getLocalData("euid"),
        }
        $("#survey-cover").css("display", "none");
        $("#display-survey-btn").css("display", "none");
        sendMsg(send_data).then(response => {});
        return false;
    })

}

