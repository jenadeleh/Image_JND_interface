export const globalStatus = {
    FIRST_DURATION_timer:Object(),
    SECOND_DURATION_timer:Object(),
    env_bg_interval: Object(),
    result: [],
    video_h: 480,
    video_w:640,
    videos: [],
    videos_load: [],
    video_num:0,
    cur_video: {},
    mode: "development", // development or production
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
    exp_status: "",
    ispexist: false,
    jnd_video_data:{},
    text_end_exp:""
}