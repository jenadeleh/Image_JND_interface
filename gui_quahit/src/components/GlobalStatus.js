export const globalStatus = {
    FIRST_DURATION_TIMER:Object(),
    SECOND_DURATION_TIMER:Object(),
    EXPIRE_TIMER:Object(),
    env_bg_interval: Object(),
    result: [],
    video_h: 0,
    video_w: 0,
    videos_original_url: [],
    videos_load: [],
    video_num:0,
    loaded_video_num:0,
    cur_video_pair: {},
    mode: "development", // development or production, production mode displays the instruction model
    cali_start_time: 0,
    cali_end_time: 0,
    os_info:{},
    cali_info:{},
    devicePixelRatio:0,
    isCorrectEnv: false,
    isMaximizedBrowser: true,
    isTheSameBrowser: true,
    isNotZoomedBrowser: true,
    reso_warnings: "",
    exp_status: "screen_check_panel",
                    // screen_check_panel: ensure the requirements are fullfilled
                    // dist_panel: adjust distance panel is being shown, 
                    // inst_panel:instruction is being shown, 
                    // cf_form: consenst form page is shown. 
                    // ishahara1: the first vision test.
                    // ishahara2: the second vision test.
                    // hit_panel:after adjusting distance, hit is being shown, before videos are finished downloading
                    // decision: after videos are finished downloading before clicking "start experiment" button
                    // next-hit-panel: hit ends, before clicking "next assignment" button,
                    
    ispexist: false,
    jnd_video_data:{},
    text_end_exp:"",
    assignment_num_text: "",
    finished_assignment_num:0,
    download_time:0,// time limitation for downloading videos
    wait_time:0, // time limitation between finishing downloading videos and clicking "start experiment" button
    start_time:Object(), // the time that finish loading the videos 
    download_timeout_msg:"", 
    waiting_timeout_msg:"",
    warning_status:"env",
    canMakeDecision: false, // exp_status=decision, but use doesn't press "start experiment", or next video is loading
    isWarning: false, // true, can not make a decision
    isNotSureBtnAvl: false, // not_sure_button is available or not
    videos_pairs:{},
    task_num:0,
    videos_url_mapping:{}, //original url to cache url
    videos_pairs_sequence:[],
    training_description: "",
    quiz_description:"",
    flickering_test_description_template:"",
    // quality_test_description_template:"",
    flickering_test_description:"",
    // quality_test_description:"",
    training_videos: {},
    quiz_videos: {},
    session: "training",
    flickering_question:"",
    distortion_question:"",
    failedQuizNum:0,
    failedQuizNumThr:0,
    isPassQuiz: false,
    no_decision_training_msg:"",
    fail_quiz_text: "",
    pass_quiz_text: "",
    pass_training_question_text: "",
    traing_pass_text_timeout:0,
    code:"",
    copy_code:"IMPORTANT: Please copy the code below to the experiment page in&nbsp;Mechanical Turk in order to get your compensation!",
    study_hit_url:"",
    no_available_exp:"",
    wrong_browser_msg:"To enable all interface features, please use Firefox.",
    survey_btn_text:"",
}