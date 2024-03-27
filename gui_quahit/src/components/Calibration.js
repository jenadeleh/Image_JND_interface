import * as $ from 'jquery';
import { storeLocalData, getLocalData } from "../utils/ManageLocalData";
import { config } from "./Configuration"; 
import { globalStatus } from "./GlobalStatus";
import { showWarningCover } from './Environment';


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

    // $("#dist-browser-width").html(`Browser width: ${browser_width_cm} cm (${browser_width_inches} inches)`);
    // $("#dist-value").html(`Please adjust your distance. Distance=${config.DISTANCE} cm (${(config.DISTANCE*0.393701).toFixed(0) } inches)`);
    globalStatus.exp_status = "ishihara_1_panel";
    $("#isihara-1-panel").css("display", "inline");
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


// This script detecs the screen and window, and the browser resolution. 
// It checks if the screen and window resolution are at least full hd and equall to each other.

var offset = 100;
var browserName = (function (agent) {
    switch (true) {
        case agent.indexOf("edge") > -1: return "MS Edge";
        case agent.indexOf("edg/") > -1: return "Edge ( chromium based)";
        case agent.indexOf("opr") > -1 && !!window.opr: return "Opera";
        case agent.indexOf("chrome") > -1 && !!window.chrome: return "Chrome";
        case agent.indexOf("trident") > -1: return "MS IE";
        case agent.indexOf("firefox") > -1: return "Mozilla Firefox";
        case agent.indexOf("safari") > -1: return "Safari";
        case agent.indexOf("brave") > -1: return "Brave";
        default: return "other";
    }
})(window.navigator.userAgent.toLowerCase());



// window.addEventListener("load", event => {
//     // Only google Chrome is allowed
//     if (browserName != 'Chrome') {
//         document.getElementById("hTag").innerHTML = "Chrome browser is required in order to advance. Your browser is " + browserName;
//         // document.getElementById("browserNameTag").innerHTML = browserName + " was detected";
//         document.getElementById("mainDiv").setAttribute("hidden", "hidden")
//     }

// });


function windowCheck(realWindowWidth, realWindowHeight) {

    // Window size does not met the requirements
    if (realWindowWidth < 1920 || realWindowHeight < 1080) {
        document.getElementById("windowCheckMark").innerHTML = '&#10060';
    }

    // Window size met the requirements
    if (realWindowWidth >= 1920 && realWindowHeight >= 1080) {
        document.getElementById("windowCheckMark").innerHTML = '&#9989';
    }

    // Inform the users about their window size (If full screen or not)
    var windowSize = document.getElementById("windowSize");
    windowSize.textContent = parseInt(realWindowWidth) + "x" + parseInt(realWindowHeight);
}

function screenCheck(realScreenWidth, realscreenHeight) {

    // Screen  size does not met the requirements
    if (realScreenWidth < 1920 || realscreenHeight < 1080) {
        document.getElementById("windowCheckMark").innerHTML = '&#10060';
    }

    // Screen size met the requirements
    if (realScreenWidth >= 1920 && realscreenHeight >= 1080) {
        document.getElementById("screenCheckMark").innerHTML = '&#9989';
    }

    // Inform the users about their screen size 
    var screensize = document.getElementById("screensize");
    screensize.textContent = parseInt(realScreenWidth) + "x" + parseInt(realscreenHeight);
}

function screenAndWindowCheck() {
    const realScreenWidth = window.screen.width;
    const realscreenHeight = window.screen.height;

    var realWindowWidth = innerWidth;
    var realWindowHeight = innerHeight;

    // var forTest = document.getElementById("forTest");
    // forTest.textContent = " view port is: " + window.outerHeight + "Device pixel ratio is:" + window.devicePixelRatio + " -" + "availHeight:" + window.screen.availHeight + "- " + "availWidth:" + window.screen.availWidth + "-" + "innerWidth:" + innerWidth + "- " + "innerHeight:" + innerHeight + "-" + "screen.width:" + screen.width + "-" + "screen.height:" + screen.height;


    screenCheck(realScreenWidth, realscreenHeight);
    // manually adjust for testing
    realWindowHeight = realWindowHeight 
    // windowCheck(realWindowWidth, realWindowHeight);
    // Inform the users about their window size (If full screen or not)
    var windowSize = document.getElementById("windowSize");
    windowSize.textContent = parseInt(realWindowWidth) + "x" + parseInt(realWindowHeight);

    // At least one of the screen or window size does not met the requirements
    if (realWindowWidth < 1920 || realWindowHeight < 1080 || realScreenWidth < 1920 || realscreenHeight < 1080 || realWindowWidth < realScreenWidth - offset || realWindowHeight < realscreenHeight - offset) {
        let proceedButton = document.getElementById("proceed");
        let windowCheckMark = document.getElementById("windowCheckMark");

        if(proceedButton) {
            proceedButton.disabled = true;
            proceedButton.style.backgroundColor = "#cccccc";
        }
        if(windowCheckMark) {
            document.getElementById("windowCheckMark").innerHTML = '&#10060';
        }
        showWarningCover("maximize_browser");
        globalStatus.isMaximizedBrowser = false;
    }

    // Window and screen size both met the requirements
    if (realWindowWidth >= 1920 && realWindowHeight >= 1080 && realScreenWidth >= 1920 && realscreenHeight >= 1080 && realWindowWidth >= realScreenWidth - offset && realWindowHeight >= realscreenHeight - offset) {
        let proceedButton = document.getElementById("proceed");
        let windowCheckMark = document.getElementById("windowCheckMark");
        if(proceedButton) {
            proceedButton.disabled = false;
            proceedButton.style.backgroundColor = "#4CAF50";
        }
        if(windowCheckMark) {
            document.getElementById("windowCheckMark").innerHTML = '&#9989';
        }
        globalStatus.isMaximizedBrowser = true;

    }
}


screenAndWindowCheck();


// Update the screen and window chack after each resize
window.addEventListener("resize", () => {
    screenAndWindowCheck();

});






