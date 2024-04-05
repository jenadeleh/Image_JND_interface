import * as $ from 'jquery';
import { sendMsg } from "./SendMsg";
import { globalStatus } from "./GlobalStatus";
import { updateProgressBar } from "./ProgressBar";
import { setTimer } from "./Timer";
import { getLocalData, storeLocalData } from "../utils/ManageLocalData";
import { displayEndHitPanel } from "./BtnActions";
import {shuffle} from "../utils/Shuffle"

export function reqLoadVideos(workerid, euid) {
  $("#video-pool, #video-spinner").css("height", 480)
  .css("width", 1260);
  

  if (globalStatus.session=="training") {
    globalStatus.videos_pairs = globalStatus.training_videos['flickering'];
    console.log("training videos length ", globalStatus.videos_pairs)
  } else if (globalStatus.session == "quiz") {
    globalStatus.videos_pairs = globalStatus.quiz_videos['flickering'];
  }
  
  globalStatus.task_num = globalStatus.videos_pairs.length;
  console.log("TASK NUM ", globalStatus.videos_pairs.length)
  globalStatus.flickering_test_description = globalStatus.flickering_test_description_template
  // globalStatus.quality_test_description = globalStatus.quality_test_description_template
  globalStatus.flickering_test_description = globalStatus.flickering_test_description.replace("NUM", globalStatus.task_num)
  // globalStatus.quality_test_description = globalStatus.quality_test_description.replace("NUM", globalStatus.task_num/2)

  _extract_videos_url(globalStatus.videos_pairs);
  updateProgressBar(0, globalStatus.task_num);
  $("#loading-progress").html("0/" + globalStatus.videos_original_url.length);
  
  _startCountExpireTime("download");
  _addAllVideosToDom();
  show_test_description("flickering");
}

export function displayFirstVideo() {
  $("#video-spinner").css("display", "none")
                    .removeClass("d-flex");

  let cur_video_pair = globalStatus.videos_pairs_sequence.shift(); // removes the first element                  
  // let cur_video_pair = globalStatus.videos_pairs_sequence.shift(); // removes the first element
  let videoDomId = constructDomId(cur_video_pair)

  globalStatus.curVideoDomId = videoDomId;
  globalStatus.cur_video_pair = cur_video_pair;
  globalStatus.exp_status = "decision";

//   console.log("current gt: " + globalStatus.cur_video_pair["ground_truth"]);

  $(`#left-${videoDomId}`).get(0).pause();
  $(`#right-${videoDomId}`).get(0).pause();
  $(`#vc-${videoDomId}`).css("visibility", "visible");
  $("#start-exp-btn").attr("disabled",false);
}

function _addAllVideosToDom() {
  const tasks = Array.from(
    globalStatus.videos_original_url, (video_ori_url) => _loadVideoAsync(video_ori_url)
  );

  Promise.all(tasks).then(() => {
    _addVideosPairHtml();
    displayFirstVideo();
    clearTimeout(globalStatus.EXPIRE_TIMER);
    // console.log("----- clearTimer -----" + "download");
    _startCountExpireTime("wait");
  });
}

export function displayNextVideo() {
    // remove previous video
    let prev_video_pair = globalStatus.cur_video_pair; 
    let prev_videoDomId = constructDomId(prev_video_pair)
    $(`#vc-${prev_videoDomId}`).remove();

    // display next video
    let cur_video_pair = globalStatus.videos_pairs_sequence.shift();

    let videoDomId = constructDomId(cur_video_pair);
    globalStatus.curVideoDomId = videoDomId;
    globalStatus.cur_video_pair = cur_video_pair
    $(`#vc-${videoDomId}`).css("visibility", "visible")
                          .css("z-index", 1);

    // console.log("current gt: " + globalStatus.cur_video_pair["ground_truth"]);

    $(`#left-${videoDomId}`).get(0).play();
    $(`#right-${videoDomId}`).get(0).play();
    setTimeout(() => {
      globalStatus.canMakeDecision = true;
  }, 500);    
    
    recordTime();

      // console.log("--- next video ---")
      // console.log(globalStatus.cur_video["source_video"])
      // recordTime();
}

export function recordTime() {
    globalStatus.cur_video_pair["start_time"] = new Date().getTime();
    setTimer();
}

export function stopExpireTimer() {
  // console.log("----- stopExpireTimer -----")
  clearTimeout(globalStatus.EXPIRE_TIMER);
  sendMsg({
    "action":"stop_expire_timer", 
    "puid":getLocalData("puid")
  })
}

export function constructDomId(cur_video_pair) {
  console.log("INSIDE CONSTRUCT")
  let ref_video = cur_video_pair["ref_video"];
  let crf = cur_video_pair["crf"];
  // let presentation = cur_video_pair["presentation"];
  return `${ref_video}-crf${crf}-Flickering`;
}

export function show_test_description(test) {

    $("#question").html(globalStatus.flickering_question);
    $("#reminder-modal-text").html(globalStatus.flickering_test_description);
    $("#start-exp-btn").html("<h4>Click here to start the flicker test</h4>");
  // } else if (test == "quality") {
    
  //   $("#question").html(globalStatus.distortion_question);
  //   $("#reminder-modal-text").html(globalStatus.quality_test_description);
  //   $("#start-exp-btn").html("<h4>Click here to start the quality test</h4>");
  // }
  
  $("#reminder-modal-btn").html("I got it!");
  $("#reminder-modal").modal("show");
}

export function show_session_description(session) {
  if (session == "training") {
    $("#reminder-modal-text").html(globalStatus.training_description);
  } else if (session == "quiz") {
    $("#reminder-modal-text").html(globalStatus.quiz_description);
  }
  
  $("#reminder-modal-btn").html("I got it!");
  $("#reminder-modal").modal("show");
}

function _extract_videos_url(videos_pairs) {
  console.log("video pairs ", videos_pairs)
  let videos_original_url = [];
  let videos_pairs_sequence = [];

    videos_pairs.forEach(function(value,key2,arr2){
      console.log("THE VALUE: ", value)
      if (!videos_original_url.includes(value["videos_pair"][0])) {
        videos_original_url.push(value["videos_pair"][0]);
      }

      if (!videos_original_url.includes(value["videos_pair"][1])) {
        videos_original_url.push(value["videos_pair"][1]);
      }

      videos_pairs_sequence.push(value);
    })

  globalStatus.videos_original_url = videos_original_url;
  globalStatus.videos_pairs_sequence = videos_pairs_sequence;
}

function _loadVideoAsync(video_ori_url) {
  return new Promise(function(resolve, reject) {
    let req = new XMLHttpRequest();
    req.open('GET', video_ori_url, true);
    req.responseType = 'blob';
    // req.timeout = 2000; //ms
    req.onload = function() {
      if (this.status === 200) {
        let videoBlob = this.response;
        let video_local_url = URL.createObjectURL(videoBlob);
        // let video_local_url = video_ori_url;
        globalStatus.videos_url_mapping[video_ori_url] = video_local_url;
        globalStatus.loaded_video_num += 1;
        $("#loading-progress").html(
            globalStatus.loaded_video_num+ "/" 
            + globalStatus.videos_original_url.length);
        resolve();
      }
    }
    req.onerror = function() {};
    req.send();
  });
}


function _addVideosPairHtml() {
  let $video_pool = $("#video-pool");
    
  globalStatus.videos_pairs.forEach(function(pair, key2, arr2) {
    let ref_video = pair["ref_video"];
    let crf = pair["crf"];
    
    let url_left =  globalStatus.videos_url_mapping[pair["videos_pair"][0]];
    let url_right =  globalStatus.videos_url_mapping[pair["videos_pair"][1]];

    let video_pair_html = `
      <div class="video-cover"
        id=vc-${ref_video}-crf${crf}-Flickering
        style="z-index:-1; visibility: hidden;"
      >
        <video 
          id="left-${ref_video}-crf${crf}-Flickering"
          loop="loop" 
          muted
        >
          <source src=${url_left} type='video/mp4'>
        </video>

        <video 
          id="right-${ref_video}-crf${crf}-Flickering" 
          loop="loop" 
          muted
        >
          <source src=${url_right} type='video/mp4'>
        </video>
      </div>
    `
    $(video_pair_html).appendTo($video_pool);
  });

  // Adjust video dimensions after they are loaded
  $("video").on("loadedmetadata", function() {
    $(this).css({
      "height": this.videoHeight + "px",
      "width": this.videoWidth + "px"
    });
  });
}

function _startCountExpireTime(timeout_type){
  _setExpireTimer(timeout_type);
}

function _setExpireTimer(timeout_type) {
  // timeout_type: download, wait
  let duration = 0;
  if (timeout_type=="download") {
    duration = globalStatus.download_time * 1000; // ms
  } else if (timeout_type=="wait") {
    duration = globalStatus.wait_time * 1000; // ms
  }

  globalStatus.EXPIRE_TIMER = setTimeout(()=> {
    _showTimeoutMsg(timeout_type);
    $("#hit-end-panel, #hit-panel").css("display", "none");
    storeLocalData("didTraining", "true");
    $("#expire-continue-btn").html("Quit Experiment");
    $("#expire-continue-btn").on("click", ()=>{
        window.location.reload();
    });
  }, duration);
}

function _showTimeoutMsg(timeout_type) {
  // timeout_type: download, wait
  // console.log("----- showTimeoutMsg -----" + timeout_type)
  displayEndHitPanel();
  clearTimeout(globalStatus.EXPIRE_TIMER);
  clearInterval(globalStatus.env_bg_interval);
  clearTimeout(globalStatus.FIRST_DURATION_TIMER);
  clearTimeout(globalStatus.SECOND_DURATION_TIMER);

  globalStatus.warning_status = "timer";
  if (timeout_type=="download") {
    $("#warning-msg").html(globalStatus.download_timeout_msg);
    $("#hit-end-panel-msg").html("<h3>"+globalStatus.download_timeout_msg+"</h3>");
  } else if (timeout_type=="wait") {
    $("#warning-msg").html(globalStatus.waiting_timeout_msg);
    $("#hit-end-panel-msg").html("<h3>"+globalStatus.waiting_timeout_msg+"</h3>");
  }
  
  $("#next-hit-btn").attr("disabled", true);
  $("#warning-cover").css("display", "inline")
                      .css("visibility", "visible")
                      .append(
                        `<button 
                          id="expire-continue-btn" 
                          type="button" 
                          class="btn btn-info"
                        >
                          Continue
                        </button>`
                      );

  let $btn_dom = $("#expire-continue-btn");
  $btn_dom.on("click", ()=>{
    $btn_dom.remove();
    $("#warning-cover").css("display", "none")
    $("#next-hit-btn").attr("disabled", false);
    globalStatus.warning_status = "env";
  })
}
