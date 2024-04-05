import json
from videoJnd.src.ReqVideos import req_videos
from videoJnd.src.RecordResult import record_study_result
from videoJnd.src.RecordQuaResult import record_qua_result, is_quiz_passed
from videoJnd.src.ReqInstConsentF import req_inst_cf
from videoJnd.src.UserRegister import user_register
from videoJnd.src.ResourceMonitor import resource_monitor, add_idle_thread, release_resource
from videoJnd.src.RecordSurvey import record_survey
from videoJnd.src.Log import logger
from videoJnd.models import InterfaceText

def process_request(request):
    try:
      if request.method == "POST":
          if request.body:
                  recv_data = json.loads(request.body)
                #   print(recv_data)
                  if  recv_data["action"] not in  ["record_result", "record_quiz_result"]:
                      print(recv_data)
                  
                  if recv_data["action"] == "req_inst_cf":
                      response = req_inst_cf(recv_data)
                  
                  elif recv_data["action"] == "user_register":
                      response = user_register(recv_data)

                  elif recv_data["action"] == "req_videos":
                      response = req_videos(recv_data)

                  elif recv_data["action"] == "resource_monitor":
                      response = resource_monitor(recv_data)

                  elif recv_data["action"] == "stop_expire_timer":
                      response = add_idle_thread(recv_data["puid"])
                      
                  elif recv_data["action"] == "release_resource":
                      response = release_resource(recv_data)

                  elif recv_data["action"] == "record_result":
                      response = record_study_result(recv_data)

                  elif recv_data["action"] == "record_quiz_result":
                      response = record_qua_result(recv_data)

                  elif recv_data["action"] == "get_browser_msg":
                      interface_text = InterfaceText.objects.all()[0]
                      response = {
                        "status":"successful", 
                        "wrong_browser_msg":interface_text.wrong_browser_msg
                        }
                  elif recv_data["action"] == "is_quiz_passed":
                        print("here")
                        response = is_quiz_passed(recv_data)
                  elif recv_data["action"] == "survey":
                        record_survey(recv_data)

          else:
              response = {"status":"failed", "restype":"request-body", "data":"empty request body"}
      else:
          response = {"status":"failed", "restype":"request-method", "data":"bad method"}

    except Exception as e:
        print(str(e))
        response = {"status":"failed", "restype":"request-send", "data":"errors"}

    return response






