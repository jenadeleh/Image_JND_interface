import * as $ from 'jquery';
import { globalStatus } from "./GlobalStatus";
import { updateProgressBar } from "./ProgressBar";
import { getLocalData } from "../utils/ManageLocalData";
import { sendMsg } from "./SendMsg";
import { passCF_action, submitCf } from "./ConsentForm";

import { 
  displayNextVideo, 
  reqLoadVideos, 
  recordTime, 
  stopExpireTimer, 
  constructDomId
} from "./Videos";
import { storeLocalData } from '../../../gui_quahit/src/utils/ManageLocalData';

export function actStartExpBtn(e) {
  $("#start-exp-btn").attr("disabled", true)
                  .css("display", "none");
  $("#left-btn, #right-btn").attr("disabled", false);

  globalStatus.canMakeDecision = true;
  let cur_video_pair = globalStatus.cur_video_pair; 
  let videoDomId = constructDomId(cur_video_pair)

  $(`#left-${videoDomId}`).get(0).play();
  $(`#right-${videoDomId}`).get(0).play();
  stopExpireTimer();
  recordTime();
}

export function actDecisionBtn(e) {
  let decision = $(e.target).attr("data-decision");
  addResultToCurVideo(decision);
  processHit();
}

export function actNextHitBtn() {
  $("#hit-end-panel").css("display", "none");
  $("#start-exp-btn").css("display", "inline");
  $("#guide-panel, #task-progressbar, #instruction-btn").css("visibility", "visible");
  $("#video-spinner").css("display", "inline").addClass("d-flex");
  $(".decision-btn, #start-exp-btn").attr("disabled", true);
  $("#video-cover").remove();

  globalStatus.exp_status = "hit_panel";
  globalStatus.canMakeDecision = false;

  // request new videos
  reqLoadVideos(
    getLocalData("workerid"), 
    getLocalData("puid"), 
    getLocalData("euid")
  );
}

export function addResultToCurVideo(decision) {
  globalStatus.cur_video_pair["decision"] = decision;
  globalStatus.cur_video_pair["end_time"] = new Date().getTime();
  globalStatus.result.push(globalStatus.cur_video_pair);  
  // console.log("----- Result of Current Video -----");
  // console.log(globalStatus.cur_video_pair);
}

export function processHit() {
  globalStatus.isNotSureBtnAvl = false;
  $("#not-sure-btn").attr("disabled", true)
                  .removeClass("btn-primary")
                  .addClass("btn-secondary");
  $(".video-cover").css("visibility", "visible");
  $("#decision-timeout-msg").css("display", "none");

  updateProgressBar(
    globalStatus.task_num - globalStatus.videos_pairs_sequence.length, 
    globalStatus.task_num
  );

  clearTimeout(globalStatus.FIRST_DURATION_TIMER);
  clearTimeout(globalStatus.SECOND_DURATION_TIMER);       
  
  console.log("VIDEO PAIRS ", globalStatus.videos_pairs_sequence.length)
  if (globalStatus.videos_pairs_sequence.length > 0) {
    displayNextVideo();
  } else {
    clearTimeout(globalStatus.EXPIRE_TIMER);
    _endHit();
  }
}

export function adjustDist() {
  $("#dist-panel").css("display", "none");
  $("#hit-panel").css("display", "inline");
  actNextHitBtn();
}

export function readInst() {
  $("#inst-panel").css("display", "none");
  globalStatus.exp_status = "";
  // if (globalStatus.ispexist) {
  //   passCF_action();
  // } else {
  //   $("#cf-panel").css("display", "inline");
  // }

  if (getLocalData("workerid")){
    $("#ask-for-wid").html("Please confirm your worker ID.")
    $("#cf-workerid").val(getLocalData("workerid"))
  }
  
//   $("#cf-panel").css("display", "inline");
    submitCf(getLocalData("workerid"));
}

function _endHit() {
  _sendResult();
  // _process_quiz_result();
}

export function displayEndHitPanel(avl_next_exp) {
  $(".video-cover").remove();
  $(".decision-btn").attr("disabled", true);
  $("#guide-panel, #task-progressbar, #instruction-btn").css("visibility", "hidden");

  if (avl_next_exp=="true") {
    $("#main-study-btn").html("Next Assignment").attr("href", globalStatus.study_hit_url);
    $("#show-instruction-btn, #main-study-btn").css("display", "inline-block");
    $("#hit-end-text").html(globalStatus.text_end_hit);
  } else if (avl_next_exp=="false") {
    $("#hit-end-text").html(globalStatus.text_end_hit_no_avl);
  }

  $("#ass-num").html(globalStatus.finished_assignment_num+1);
  $("#hit-end-panel").css("display", "inline");

  $("#hit-end-panel-msg").css("visibility", "visible")
  $("#video-spinner").css("display", "none")
                    .removeClass("d-flex");
  $("#hit-end-btn").css("display", "inline-block");
//   $("#next-hit-btn").css("display", "none");

 if (avl_next_exp=="true") {
  $("#main-study-btn").html("Next Assignment").attr("href", globalStatus.study_hit_url);
  $("#show-instruction-btn, #main-study-btn").css("display", "inline-block");
 }

  _show_code();
}


// function _process_quiz_result() {
// //   $("#hit-end-panel-msg").html("");
//   $("#main-study-btn").html("Next Assignment").attr("href", globalStatus.study_hit_url);
//   $("#show-instruction-btn, #main-study-btn").css("display", "inline-block");
//   _show_code();
// }

function _show_code() {
  $("#hit-end-btn").html("Show the payment code and quit the experiment");
  $('#hit-end-btn').on('click', (e)=> {
    $("#msg-panel").html(
        globalStatus.text_end_exp 
        + "</br>" 
        + "<h2>" + globalStatus.copy_code + "</h2>"
        + "</br>" + "</br>"
        + "<button class='btn btn-info' type='button' id='display-survey-btn'>" + globalStatus.survey_btn_text + "</button>"
        + "</br>" + "</br>"
        + "<h3>" + globalStatus.code + "</h3>"
    ).css("display", "inline").css("z-index", 1);
    $("#hit-end-panel, #hit-panel").css("display", "none");
    $("#display-survey-btn").on('click', (e)=> {
      $("#survey-cover").css("display", "inline-block").css("visibility", "visible");
    });
    storeLocalData("quitexp", "true");
  });
}


function _sendResult() {
  let cali_info = {};

  [
    "cali_time", 
    "browser_width_cm", 
    "browser_height_cm", 
    "devicePixelRatio", 
    "px_cm_rate"
  ].forEach((el)=>{cali_info[el] = getLocalData(el);});

  let send_data = {
    "action":"record_result",
    "euid":getLocalData("euid"),
    "puid": getLocalData("puid"),
    "workerid": getLocalData("workerid"),
    "data": {
      "result":globalStatus.result,
      "os_info": globalStatus.os_info,
      "cali_info": cali_info
    }
  };

  globalStatus.result = [];

  sendMsg(send_data).then(response => {
    if (response["status"] == "successful") {
      globalStatus.code = response["code"];
      let avl_next_exp = response["avl_next_exp"]
      displayEndHitPanel(avl_next_exp);
    } else if (response["status"] == "failed") {
      displayEndHitPanel("failed");
    }
  });
}