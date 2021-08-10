import * as $ from 'jquery';
import { readInst, actStartExpBtn, actDecisionBtn, actNextHitBtn, adjustDist} from "./BtnActions"
import { submitCf } from "./ConsentForm"
import { storeLocalData } from "../utils/ManageLocalData"
import { globalStatus } from "./GlobalStatus";

export function initDoms() {
    $('#start-exp-btn').on('click', (e)=> {
        actStartExpBtn();
    });
    
    $('.decision-btn').on('click',(e)=> {
        actDecisionBtn(e);
    });

    $('#next-hit-btn').on('click', (e)=> {
        actNextHitBtn();
    });

    $('#quit-exp-btn').on('click', (e)=> {
        $("#msg-panel").html(globalStatus.no_exp_avl_text).css("display", "inline");
        $("#hit-end-panel, #hit-panel").css("display", "none");
    });

    $("#cali-adjust-dist").on('click', (e)=> {
        adjustDist();
    });

    $("#read-inst-btn").on('click', (e)=> {
        readInst();
    });

    let $cf_form = $("#cf-form");
    $cf_form.on("submit", () =>{ 
        let params = {};
        $cf_form.serializeArray().forEach((element)=>{
            params[element.name] = element.value;
        });
        storeLocalData("pname", params.pname);
    
        if (!params.pemail) {
            params.pemail = "";
        }
    
        submitCf(params.pname, params.pemail);
        return false;
    })
}

