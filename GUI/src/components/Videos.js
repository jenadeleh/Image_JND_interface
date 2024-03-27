import * as $ from 'jquery';
import { sendMsg } from "./SendMsg";
import { globalStatus } from "./GlobalStatus";
import { updateProgressBar } from "./ProgressBar";
import { setTimer } from "./Timer";
import { getLocalData, storeLocalData } from "../utils/ManageLocalData";
import { displayEndHitPanel } from "./BtnActions";

export function reqLoadVideos(workerid, puid, euid) {
  $("#video-pool, #video-spinner").css("height", globalStatus.video_h)
                                  .css("width", globalStatus.video_w);

  let data = {
    "action":"req_videos", 
    "workerid": workerid, 
    "puid":puid, 
    "euid":euid
  }

  sendMsg(data).then(response => {
    if (response["status"] == "successful") {
      console.log("THE RESPONSE ", response)
      globalStatus.download_time = response["data"]["download_time"];
      globalStatus.wait_time = response["data"]["wait_time"];
      globalStatus.videos_pairs = response["data"]["videos_pairs"];
      globalStatus.task_num = globalStatus.videos_pairs["flickering"].length;
      globalStatus.finished_assignment_num = response["data"]["finished_assignment_num"];

      globalStatus.flickering_test_description = globalStatus.flickering_test_description.replace("NUM", globalStatus.task_num)
      // globalStatus.quality_test_description = globalStatus.quality_test_description.replace("NUM", globalStatus.task_num/2)

      _extract_videos_url(globalStatus.videos_pairs);
      updateProgressBar(0, globalStatus.task_num);
      $("#loading-progress").html("0/" + globalStatus.videos_original_url.length);
      
      _startCountExpireTime("download");
      _addAllVideosToDom();
      show_test_description("flickering");

    } else if (response["status"] == "failed") {
      $(".exp-panel").css("display", "none");
      $("#msg-panel").html(response["data"]).css("display", "inline");
      clearTimeout(globalStatus.FIRST_DURATION_TIMER);
      clearTimeout(globalStatus.SECOND_DURATION_TIMER);
      return response["data"];
    }
  });
}

export function displayFirstVideo() {
  $("#video-spinner").css("display", "none")
                    .removeClass("d-flex");

  let cur_video_pair = globalStatus.videos_pairs_sequence.shift(); // removes the first element
  let videoDomId = constructDomId(cur_video_pair)

  globalStatus.cur_video_pair = cur_video_pair;
  globalStatus.exp_status = "decision";

  $(`#left-${videoDomId}`).get(0).pause();
  $(`#right-${videoDomId}`).get(0).pause();
  $(`#vc-${videoDomId}`).css("visibility", "visible");
  $("#start-exp-btn").attr("disabled",false);
}

export function displayNextVideo() {
    // remove previous video
    console.log("IN next video")
    let prev_video_pair = globalStatus.cur_video_pair; 
    let prev_videoDomId = constructDomId(prev_video_pair)
    $(`#vc-${prev_videoDomId}`).remove();

    // display next video
    let cur_video_pair = globalStatus.videos_pairs_sequence.shift();
    let videoDomId = constructDomId(cur_video_pair)
    globalStatus.cur_video_pair = cur_video_pair
    $(`#vc-${videoDomId}`).css("visibility", "visible")
                          .css("z-index", 1);
    $(`#left-${videoDomId}`).get(0).play();
    $(`#right-${videoDomId}`).get(0).play();
    recordTime();

    // if (
    //   globalStatus.videos_pairs_sequence.length == globalStatus.task_num/2 - 1
    // ) { // flickering and quality
    //   globalStatus.canMakeDecision = false;
    //   $("#left-btn, #right-btn").attr("disabled", true);
    //   $(`#left-${videoDomId}`).get(0).pause();
    //   $(`#right-${videoDomId}`).get(0).pause();
    //   $("#start-exp-btn").css("display", "inline-block")
    //                     .attr("disabled",false);
    //   show_test_description("quality");
    // } else {
    //   // console.log("--- next video ---")
    //   // console.log(globalStatus.cur_video["source_video"])
    //   recordTime();
    // }
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
  let ref_video = cur_video_pair["ref_video"];
  let crf = cur_video_pair["crf"];
  let presentation = cur_video_pair["presentation"];
  return `${ref_video}-crf${crf}-${presentation}`;
}

export function show_test_description(test) {
  if (test == "flickering") {
    $("#reminder-modal-text").html(globalStatus.flickering_test_description);
    $("#question").html(globalStatus.flickering_question);
    $("#start-exp-btn").html("<h4>Click here to start the flicker test</h4>");
  } 
  // else if (test == "quality") {
  //   $("#reminder-modal-text").html(globalStatus.quality_test_description);
  //   $("#question").html(globalStatus.distortion_question);
  //   $("#start-exp-btn").html("<h4>Click here to start the quality test</h4>");
  // }
  
  $("#reminder-modal-btn").html("I got it!");
  $("#reminder-modal").modal("show");
}

// export function show_session_description(session) {
//   if (test == "flickering") {
//     $("#question").html(globalStatus.flickering_question);
//     $("#reminder-modal-text").html(globalStatus.flickering_test_description);
//     $("#start-exp-btn").html("<h4>Click here to start flickering test</h4>");
//   } else if (test == "quality") {
    
//     $("#question").html(globalStatus.distortion_question);
//     $("#reminder-modal-text").html(globalStatus.quality_test_description);
//     $("#start-exp-btn").html("<h4>Click here to start quality test</h4>");
//   }
  
//   $("#reminder-modal-btn").html("I got it!");
//   $("#reminder-modal").modal("show");
// }

function _extract_videos_url(videos_pairs) {
  let videos_original_url = [];
  let videos_pairs_sequence = [];

  ["flickering"].forEach(function(presentation,key1,arr1) {
    videos_pairs[presentation].forEach(function(value,key2,arr2){
      if (!videos_original_url.includes(value["videos_pair"][0])) {
        videos_original_url.push(value["videos_pair"][0]);
      }

      if (!videos_original_url.includes(value["videos_pair"][1])) {
        videos_original_url.push(value["videos_pair"][1]);
      }

      videos_pairs_sequence.push(value);
    })
  })

  globalStatus.videos_original_url = videos_original_url;
  globalStatus.videos_pairs_sequence = videos_pairs_sequence;
}

function _addAllVideosToDom() {
  const tasks = Array.from(
    globalStatus.videos_original_url, (video_ori_url) => _loadVideoAsync(video_ori_url)
  );

  Promise.all(tasks)
  .then(() => {
    _addVideosPairHtml();
    displayFirstVideo();
    clearTimeout(globalStatus.EXPIRE_TIMER);
    // console.log("----- clearTimer -----" + "download");
    _startCountExpireTime("wait");
  })
  .catch(error => {
    // Handle the error here
    console.error('An error occurred:', error);
  });
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
        globalStatus.videos_url_mapping[video_ori_url] = video_local_url;
        globalStatus.loaded_video_num += 1;
        $("#loading-progress").html(
            globalStatus.loaded_video_num+ "/" 
            + globalStatus.videos_original_url.length);
        resolve();
      }
    }
    req.onerror = function() {
      new Error('Failed to load video: ' + this.status)
    };
    req.send();
  });
}


function _addVideosPairHtml() {
  let $video_pool = $("#video-pool");
  ["flickering"].forEach(function(presentation,key1,arr1) {
    globalStatus.videos_pairs[presentation].forEach(function(pair,key2,arr2){
      let ref_video = pair["ref_video"];
      let crf = pair["crf"];
      // let url_left = pair["videos_pair"][0];
      // let url_right = pair["videos_pair"][1];

      let url_left =  globalStatus.videos_url_mapping[pair["videos_pair"][0]];
      let url_right =  globalStatus.videos_url_mapping[pair["videos_pair"][1]];

      let video_pair_html = `
        <div class="video-cover"
          id=vc-${ref_video}-crf${crf}-${presentation}
          style="z-index:-1; 
          height: ${globalStatus.video_h}px; 
          width: ${globalStatus.video_w * 2 + 20}px; 
          visibility: hidden;"
          >
                
          <video 
            id="left-${ref_video}-crf${crf}-${presentation}" 
            loop="loop" 
            muted 
            height="${globalStatus.video_h}" 
            width="${globalStatus.video_w}"
          >
              <source src=${url_left} 
                  type='video/mp4'
              >
          </video>

          <video 
            id="right-${ref_video}-crf${crf}-${presentation}" 
            loop="loop" 
            muted 
            height="${globalStatus.video_h}" 
            width="${globalStatus.video_w}"
          >
            <source src=${url_right} 
                type='video/mp4'
            >
          </video>
        </div>
      `
      $(video_pair_html).appendTo($video_pool);
    })
  })
}

function _startCountExpireTime(timeout_type){
    sendMsg(
      {
        "action":"resource_monitor", 
        "workerid": getLocalData("workerid"), 
        "puid":getLocalData("puid"), 
        "euid":getLocalData("euid")
      }
    ).then(response => {
      if (response["status"] == "successful") {
        globalStatus.start_time = response["data"]["start_date"];
        globalStatus.waiting_timeout_msg = response["data"]["waiting_timeout_msg"];
        globalStatus.download_timeout_msg = response["data"]["download_timeout_msg"];
        _setExpireTimer(timeout_type);
      } else if (response["status"] == "failed") {
        console.log("Error: _startCountExpireTime")
      }
    }); 
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
    $("#hit-end-text").html("");
    _showTimeoutMsg(timeout_type);
    sendMsg({
      "action":"release_resource", 
      "puid":getLocalData("puid")
    });

    $("#hit-end-panel, #hit-panel").css("display", "none");
    storeLocalData("quitexp", "true");
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
