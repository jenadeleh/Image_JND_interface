from videoJnd.models import Instruction, ConsentForm, InterfaceText, StudyParticipant, Experiment
from videoJnd.src.ReqVideos import select_encoded_ref_videos
from videoJnd.src.Log import logger
from videoJnd.src.GetConfig import get_config
config = get_config()
URL_PREFIX = config["URL_PREFIX"] 
def req_inst_cf(recv_data:dict) -> dict:
    puid = recv_data["puid"]
    
    try:
        active_exps = Experiment.objects.filter(active=True)
        interface_text = InterfaceText.objects.all()[0]
        instruction = Instruction.objects.all()[0]
        consent_form = ConsentForm.objects.all()[0]
        
        if len(active_exps)>0:
            exp_obj = active_exps[0]

            text_end_hit = interface_text.text_end_hit
            text_end_hit_no_avl = interface_text.text_end_hit_no_avl

            text_end_hit = text_end_hit.replace("NUM", "<span id='ass-num'></span>")
            text_end_hit_no_avl = text_end_hit_no_avl.replace("NUM", "<span id='ass-num'></span>")

            data = {
                "instruction":instruction.description, 
                "consent_form": consent_form.description,
                "flickering_question": interface_text.flickering_question,
                "distortion_question": interface_text.distortion_question,
                "text_end_hit": text_end_hit,
                "text_end_hit_no_avl": text_end_hit_no_avl,
                "text_end_exp": interface_text.text_end_exp,
                "btn_text_end_hit": interface_text.btn_text_end_hit,
                "decision_timeout_msg": interface_text.decision_timeout_msg,
                "instruction_btn_text": interface_text.instruction_btn_text,
                "consent_btn_text": interface_text.consent_btn_text,
                "training_description": interface_text.training_description,
                "quiz_description": interface_text.quiz_description,
                "flickering_test_description": interface_text.flickering_test_description,
                # "quality_test_description": interface_text.quality_test_description,
                "no_decision_training_msg": interface_text.no_decision_training_msg,
                "study_hit_url": interface_text.study_hit_url,
                "survey_btn_text":interface_text.survey_btn_text,
            }

            if "quahit" in recv_data:
                training_videos = exp_obj.training_videos_json
                quiz_videos = exp_obj.quiz_video_json
                for t in ["flickering", "distortion"]:
                  for idx, item in enumerate(training_videos[t]):
                    training_videos[t][idx]["videos_pair"] = [
                      URL_PREFIX + l for l in training_videos[t][idx]["videos_pair"]
                    ]
                  for idx, item in enumerate(quiz_videos[t]):
                    quiz_videos[t][idx]["videos_pair"] = [
                      URL_PREFIX + l for l in quiz_videos[t][idx]["videos_pair"]
                    ]

                data["training_videos"] = training_videos
                data["quiz_videos"] = quiz_videos
                data["euid"] = exp_obj.euid
                data["download_time"] = exp_obj.download_time
                data["wait_time"] = exp_obj.wait_time
                data["download_time"] = exp_obj.download_time
                data["wait_time"] = exp_obj.wait_time
                data["download_timeout_msg"] = interface_text.download_timeout_msg
                data["waiting_timeout_msg"] = interface_text.waiting_timeout_msg
                data["fail_quiz_text"] = interface_text.fail_quiz_text
                data["pass_quiz_text"] = interface_text.pass_quiz_text
                data["pass_training_question_text"] = interface_text.pass_training_question_text
                data["traing_pass_text_timeout"] = interface_text.traing_pass_text_timeout
                data["failedQuizNumThr"] = interface_text.failedQuizNumThr
                data["study_hit_url"] = interface_text.study_hit_url
                data["no_available_exp"] = interface_text.no_available_exp

                response_data =  {
                    "status":"successful", 
                    "restype": "req_inst_cf", 
                    "data":data,
                    "avl_next_exp":"true"
                }

                return response_data

            else:
                if puid:
                    avl_encoded_ref_videos_objs  = select_encoded_ref_videos(exp_obj, puid)
                else: 
                    avl_encoded_ref_videos_objs  = select_encoded_ref_videos(exp_obj, "")

                if len(avl_encoded_ref_videos_objs)>0:
                    isPExist = False
                    if puid:
                        cur_p = StudyParticipant.objects.filter(puid=puid, exp=exp_obj)
                        if cur_p:
                            isPExist = True

                    data["ispexist"] = isPExist
                    
                    response_data =  {
                        "status":"successful", 
                        "restype": "req_inst_cf", 
                        "data":data,
                        "avl_next_exp":"true"
                    }

                    return response_data
                else:
                    return {
                        "status":"failed", 
                        "data":interface_text.no_available_exp, 
                        "restype": "req_inst_cf", 
                        "avl_next_exp":"false"
                    }
        else:
            return {
                "status":"failed", 
                "data":interface_text.no_available_exp, 
                "restype": "req_inst_cf",
                "avl_next_exp":"false"
            }

    except Exception as e:
        logger.info("req_inst_cf error: %s" % str(e))
        return {"status":"failed", "data":"system error", "restype": "req_inst_cf"}