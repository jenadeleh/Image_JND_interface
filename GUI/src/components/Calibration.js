import * as $ from 'jquery';
import { storeLocalData, getLocalData } from "../utils/ManageLocalData";
import { config } from "./Configuration"; 
import { globalStatus } from "./GlobalStatus";

export function calibration() {
        if (getLocalData("hasCalibrated") === null) {
            storeLocalData("hasCalibrated", "false");
        }

        incCaliFrame();
        decCaliFrame();

        $("#cali-fit-btn").on('click', (e)=> {
            let cali_time = (new Date()).getTime() - globalStatus.cali_start_time;
            storeLocalData("cali_time", cali_time);
            globalStatus.os_info["cali_time"] = cali_time
            _scaleMediaSize();
            globalStatus.exp_status = "dist_panel";
        });
}

export function checkCaliStatus() {
        
    if ( // did not do the calibration
        getLocalData("outerWidth") == null 
        && getLocalData("outerHeight") == null
        && getLocalData("availWidth") == null
        && getLocalData("availHeight") == null
    ) {
        storeLocalData("outerWidth", window.outerWidth);
        storeLocalData("outerHeight", window.outerHeight);
        storeLocalData("availWidth", screen.availWidth);
        storeLocalData("availHeight", screen.availHeight);
        storeLocalData("hasCalibrated", "false");
    } 

    if ( // environment is changed
        window.outerWidth != getLocalData("outerWidth") 
        || window.outerHeight != getLocalData("outerHeight") 
        || screen.availWidth != getLocalData("availWidth") 
        || screen.availHeight != getLocalData("availHeight")
    ) { // environment is fixed
        storeLocalData("hasCalibrated", "false");
        storeLocalData("outerWidth", window.outerWidth);
        storeLocalData("outerHeight", window.outerHeight);
        storeLocalData("availWidth", screen.availWidth);
        storeLocalData("availHeight", screen.availHeight);
    }
}

export function passCali() {
    $("#cali-panel").css("display", "none");

    let px_cm_rate = getLocalData("px_cm_rate");
    let scaled_h = px_cm_rate * config.IMAGE_HEIGHT_CM;
    let scaled_w = px_cm_rate * config.IMAGE_WIDTH_CM;
    globalStatus.video_h = scaled_h;
    globalStatus.video_w = scaled_w;
    let browser_width_cm = getLocalData("browser_width_cm");
    let browser_width_inches = Math.ceil(browser_width_cm*0.393701)

    $("#dist-browser-width").html(`Browser width: ${browser_width_cm} cm (${browser_width_inches} inches)`);
    $("#dist-value").html(`Please adjust your distance. Distance=${config.DISTANCE} cm (${(config.DISTANCE*0.393701).toFixed(0) } inches)`);
    $("#dist-panel").css("display", "inline");
}

function incCaliFrame() {
    let frameInterval = null;
    $("#cali-zoom-in-btn").on('mousedown', (e)=>  {
        if (e.which == 1) { // left key 1, 2, scroll, 3, right key
            $("#cali-fit-btn").css("visibility", "visible");
            recordCaliStartTime();
            frameInterval = setInterval(()=>increase(),30);
        }
    })
    
    $("#cali-zoom-in-btn").on('mouseup', (e)=> {
        if (e.which == 1) { // lefy key 1, 2, scroll, 3, right key
            clearInterval(frameInterval);
        }
    })
    
    $("#cali-zoom-in-btn").on('mouseleave', (e)=> {
        if (e.which == 1) { // lefy key 1, 2, scroll, 3, right key
            clearInterval(frameInterval);
        }
    })
}

function decCaliFrame() {
    let frameInterval = null;
    $("#cali-zoom-out-btn").on('mousedown', (e)=>  {
        if (e.which == 1) { // lefy key 1, 2, scroll, 3, right key
            $("#cali-fit-btn").css("visibility", "visible");
            recordCaliStartTime();
            frameInterval = setInterval(()=>decrease(),30);
        }
    })

    $("#cali-zoom-out-btn").on('mouseup', (e)=> {
        if (e.which == 1) { // lefy key 1, 2, scroll, 3, right key
            clearInterval(frameInterval);
        }
    })

    $("#cali-zoom-out-btn").on('mouseleave', (e)=> {
        if (e.which == 1) { // lefy key 1, 2, scroll, 3, right key
            clearInterval(frameInterval);
        }
    })
}


export function increase() {
    $("#cali-frame").width($("#cali-frame").width() * 1.005)
                    .height($("#cali-frame").height() * 1.005);
}

export function decrease() {
    $("#cali-frame").width($("#cali-frame").width() / 1.005)
                    .height($("#cali-frame").height() / 1.005);
}


export function recordCaliStartTime() {
    globalStatus.cali_start_time = (new Date()).getTime();
}

function _scaleMediaSize() {

    console.log("THIS FUNCTION SHOULD NEVER BE CALLED")
    // var frame_height = $(".card-area").height();
    // w=53.98 mm, h=85.60mm. ISO 7810
    // var image_width = 0.6 * document.documentElement.clientWidth; //20%, 20%
    // var physical_width = (image_width * 85.60 / frame_width)/10; //cm        
    // var distance = Math.round((physical_width / 2.) / Math.tan(Math.PI / 12.));

    let frame_width = $("#cali-frame").width() + 6; //px
    let px_cm_rate = frame_width / 8.56
    let browser_height_cm = Math.ceil(screen.height  / px_cm_rate);
    let browser_width_cm = Math.ceil(screen.width / px_cm_rate);
    
    globalStatus.devicePixelRatio = window.devicePixelRatio;

    storeLocalData("px_cm_rate", px_cm_rate);
    storeLocalData("browser_width_cm", browser_width_cm);
    storeLocalData("browser_height_cm", browser_height_cm);
    storeLocalData("devicePixelRatio", globalStatus.devicePixelRatio);

    globalStatus.os_info["px_cm_rate"] = px_cm_rate;
    globalStatus.os_info["browser_width_cm"] = browser_width_cm;
    globalStatus.os_info["browser_height_cm"] = browser_height_cm;
    globalStatus.os_info["devicePixelRatio"] = globalStatus.devicePixelRatio;

    if (browser_height_cm >= config.MONITOR_MIN_HEIGHT) {
        globalStatus.hasCalibrated = true;
        storeLocalData("hasCalibrated", "true");
        passCali();
    } else {
        $("#reminder-modal-text").html(config.WARNING_MESSAGE["incorrect_cali"]);
        $("#reminder-modal-btn").html("OK");
        $("#reminder-modal").modal("show");
    }
}


