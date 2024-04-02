from django.db import models
from ckeditor.fields import RichTextField
import uuid
from django.utils.timezone import now
from django.core.validators import MaxValueValidator, MinValueValidator 
import jsonfield
from videoJnd.src.GetConfig import get_config
from videoJnd.src.GetTrainQuizGt import get_training_gt, get_quiz_gt

class Experiment(models.Model):
    euid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=20, default="demo", editable=True)
    active = models.BooleanField(default=False, editable=True)
    description = models.TextField(max_length=4096, default="This is a demo.", editable=True)
    configuration = jsonfield.JSONField(default=get_config())
    download_time = models.IntegerField(
        "Download Time Limitation(seconds)", 
        default=300, 
        editable=True, 
        validators=[MinValueValidator(10)]
    )
    wait_time = models.IntegerField(
        "Waiting Time Limitation(seconds)", 
        default=300, 
        editable=True, 
        validators=[MinValueValidator(10)]
    )
    max_qp_one_ref_worker = models.IntegerField(
        "Maximum rating number of a reference videos for a worker", 
        default=1, 
        editable=True
    )
    pub_date = models.DateTimeField(
        editable=False, 
        blank=True, 
        auto_now=True, 
        null=True
    )
    qua_hit_worker_num = models.IntegerField(
        "Number of Qua. HIT", 
        default=10, 
        editable=True
    )
    qua_hit_count = models.IntegerField(
        "Number of finished Qua. HIT", 
        default=0, 
        editable=False
    )
    study_hit_count = models.IntegerField(
        "Number of finished study HIT", 
        default=0, 
        editable=False
    )
    training_videos_json = jsonfield.JSONField(default=get_training_gt())
    quiz_video_json = jsonfield.JSONField(default=get_quiz_gt())
    
    def __str__(self):
        return self.name

class EncodedRefVideoObj(models.Model):
    refuid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ref_video = models.TextField(max_length=4096, editable=False, null=True, blank=True)
    exp = models.ForeignKey(Experiment, on_delete=models.CASCADE)
    ratingIdx = models.IntegerField(default=0, editable=False)
    codec = models.CharField(max_length=10, editable=False, null=True, blank=True)
    target_qp_num = models.IntegerField("Target QP number of a ref video", default=0, editable=False)
    # status
    curr_qp_cnt = models.IntegerField("QP count of two tests", default=0, editable=False)
    ongoing = models.BooleanField(default=False, editable=False)
    is_finished = models.BooleanField(default=False, editable=False)
    cur_workerid = models.CharField(max_length=50, editable=False, null=True, blank=True)
    cur_worker_uid = models.CharField(max_length=64, editable=False, null=True, blank=True, default="")
    worker_start_date = models.DateTimeField(editable=False, blank=True, null=True)

    # result
    videoGroupsResult  = jsonfield.JSONField(default={})
    """
    {
        "264":{
            "reference_url": ""
            , "distortion_url": ""
            , "flickering_url": ""
            , "proc_distortion_d_code": [] 
            , "proc_flickering_d_code": []
            , "side_of_reference_distortion": []
            , "side_of_reference_flickering": []
            , "ori_distortion_decision": []
            , "ori_flickering_decision": []
        },
        "266":{
            "reference_url": ""
            , "distortion_url": ""
            , "flickering_url": ""
            , "proc_distortion_d_code": []
            , "proc_flickering_d_code": []
            , "side_of_reference_distortion": []
            , "side_of_reference_flickering": []
            , "ori_distortion_decision": []
            , "ori_flickering_decision": []
        },
    }
    """
    flickering_qp  = jsonfield.JSONField(default={"flickering_qp_seq":[]})
    distortion_qp  = jsonfield.JSONField(default={"distortion_qp_seq":[]})
    flickering_response  = jsonfield.JSONField(default={"flickering_response":[]})
    distortion_response  = jsonfield.JSONField(default={"distortion_response":[]})

    assigments_sequence = jsonfield.JSONField(default={"sequence":[]})


    def __str__(self):
        return self.ref_video   

class StudyParticipant(models.Model):
    puid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workerid = models.CharField(max_length=20, default="", editable=False, null=False, blank=False) # pname
    exp = models.ForeignKey(Experiment, on_delete=models.CASCADE)
    start_date = models.DateTimeField(editable=False, blank=True, null=True)
    end_date = models.DateTimeField(editable=False, blank=True, null=True)
    ongoing = models.BooleanField(default=False, editable=False)
    ongoing_encoded_ref_videos = jsonfield.JSONField(default={"ongoing_encoded_ref_videos":[]}) 
    ongoing_videos_pairs = jsonfield.JSONField(default={"distortion":[], "flickering":[]}) 
    finished_ref_videos = jsonfield.JSONField(default={}) # limitation of the number for each reference video for each worker
    
    def __str__(self):
        return self.workerid

class StudyAssignment(models.Model): # study HIT
    auid = models.UUIDField(primary_key=True,  default=uuid.uuid4, editable=False)
    puid = models.UUIDField(default=uuid.uuid4, editable=False)
    exp = models.ForeignKey(Experiment, on_delete=models.CASCADE)
    workerid = models.CharField(max_length=20, default="", editable=False, null=False, blank=False) # pname
    result = jsonfield.JSONField(default={})
    calibration = models.TextField(max_length=40960, default="", editable=False)
    operation_system = models.TextField(max_length=40960, default="", editable=False)
    submit_time = models.DateTimeField(editable=False, blank=True, auto_now=True, null=True)
    paid = models.BooleanField(default=False, editable=False)
    payamount = models.IntegerField("Dollar", default=0, editable=False)
    paid_time = models.DateTimeField(editable=False, blank=True, auto_now=True, null=True)
    comment = models.TextField(max_length=2048, default="", editable=False)
    
    def __str__(self):
        return str(self.auid)

class QuaAssignment(models.Model): # qua HIT
    auid = models.UUIDField(primary_key=True,  default=uuid.uuid4, editable=False)
    exp = models.ForeignKey(Experiment, on_delete=models.CASCADE)
    workerid = models.CharField(max_length=20, default="", editable=False, null=False, blank=False) # pname
    isPassQuiz = models.BooleanField(default=False, editable=False)
    result = jsonfield.JSONField(default={})
    calibration = models.TextField(max_length=40960, default="", editable=False)
    operation_system = models.TextField(max_length=40960, default="", editable=False)
    submit_time = models.DateTimeField(editable=False, blank=True, auto_now=True, null=True)
    paid = models.BooleanField(default=False, editable=False)
    payamount = models.IntegerField("Dollar", default=0, editable=False)
    paid_time = models.DateTimeField(editable=False, blank=True, auto_now=True, null=True)
    comment = models.TextField(max_length=2048, default="", editable=False)
    plate16_value = models.IntegerField(default=0, blank=True)  
    plate2_value = models.IntegerField(default=0, blank=True) 
    
    def __str__(self):
        return str(self.auid)

class Survey(models.Model):
    suid = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workerid = models.CharField(max_length=20, default="", editable=False, null=False, blank=False) # pname
    exp = models.ForeignKey(Experiment, on_delete=models.CASCADE)
    submit_date = models.DateTimeField(editable=False, blank=True, auto_now=True, null=True)
    result = jsonfield.JSONField(default={"result":{}})
    
    def __str__(self):
        return self.workerid

class InterfaceText(models.Model):
    title = models.CharField(
        primary_key=True, 
        max_length=20, 
        default="InterfaceText", 
        editable=False
    )
    
    flickering_question = RichTextField(
        "Question for flickering test", 
        max_length=4096, 
        default="On which side did you notice a flickering effect?", 
        null=False, 
        blank=False
    )
    
    distortion_question = RichTextField(
        "Question for distortion test", 
        max_length=4096, 
        default="Which video is of lower quality?", 
        null=False, 
        blank=False
    )
    
    text_end_exp = RichTextField(
        "When the experiment is done, display", 
        default='<p style="text-align:center"><span style="font-size:28px"><strong>Thank you for your participation and help.</strong></span></p> <p><span style="font-size:20px">The current experiment has ended. We look forward to your participation in our future studies.</span></p>',
        null=False, 
        blank=False
    )

    
    text_end_hit = RichTextField(
        "When the HIT is done, display", 
        default='<p><span style="color:#1abc9c"><span style="font-size:22px"><strong>The current assignment is completed.</strong></span></span></p> <p><span style="font-size:18px"><strong>You have completed NUM assignments.</strong></span></p> <p><span style="font-size:20px">&nbsp;You can take a break or start a new assignment by pressing the &quot;<span style="color:#3498db">Next assignment</span>&quot;.</span></p>',
        null=False, 
        blank=False
    )

    text_end_hit_no_avl = RichTextField(
        "When the HIT is done and no available videos, display", 
        default='<p><span style="font-size:22px"><span style="color:#2ecc71"><strong>The experiment is finished.</strong></span></span></p> <p><span style="font-size:22px"><strong>You have completed NUM assignments.</strong></span></p> <p><span style="font-size:22px">Please click the button below to receive your payment code and take&nbsp;the survey.</span></p>',
        null=False, 
        blank=False
    )

    decision_timeout_msg = models.TextField(
        "When user doesn't make a decision, display", 
        max_length=4096, 
        default="Please make your decision within three seconds.", 
        null=False, 
        blank=False
    ) # for image
    
    btn_text_end_hit = models.TextField(
        "Text of the button when the HIT is done", 
        max_length=4096, 
        default="Show the payment code and quit the experiment", 
        null=False, 
        blank=False
    )
    
    instruction_btn_text = models.CharField(
        "Text of the button in the instruction page", 
        max_length=20, 
        default="Continue", 
        null=False, 
        blank=False
    )
    
    consent_btn_text = models.CharField(
        "Text of the button in the consent form page", 
        max_length=20, 
        default="Accept", 
        null=False, 
        blank=False
    )
    
    no_available_exp = RichTextField(
        "When there is no experiment available, display", 
        default='<p><span style="font-size:28px"><strong>No experiment is available at the moment !</strong></span></p> <p><span style="font-size:18px">Thank you for your interest in our experiments. There is no subjective test running at the moment. We look forward to your participation in our future studies.</span></p>',
        null=False, 
        blank=False
    )

    waiting_timeout_msg = models.TextField(
        "When the HIT is expired, display", 
        max_length=4096, 
        default='Session timeout!\n\nYour session has timed out due to inactivity. You must start the experiment within 5 minutes after the video loading is finished.', 
        null=False, 
        blank=False
    )
    
    download_timeout_msg = models.TextField(
        "When download timeout, display", 
        max_length=4096, 
        default="Your Internet speed is low. The experiment requires an Internet speed of at least 8 Mb/s.", 
        null=False, 
        blank=False
    ) # for hit
    
    fail_quiz_text = RichTextField(
        "Text for failed quiz session", 
        max_length=4096, 
        default='<p><span style="font-size:18px"><span style="color:#e74c3c"><strong>Sorry, you failed the quiz session.</strong></span></span></p> <p><span style="font-size:18px"><span style="color:#3498db">Please click the &quot;</span><span style="color:#c0392b">Show the payment code and quit the experiment</span><span style="color:#3498db">&quot; button to to receive your payment code and take&nbsp;the survey.</span></span></p>',
        null=False, 
        blank=False
    )


    pass_quiz_text = RichTextField(
        "Text for passed quiz session", 
        max_length=4096, 
        default='<p><span style="font-size:18px"><span style="color:#2ecc71"><strong>You passed the quiz session.&nbsp;</strong></span></span></p> <p><span style="font-size:18px"><span style="color:#2980b9">To start the main experiment, please click on the main study link.</span></span></p> <p><span style="font-size:18px"><a href="http://134.34.224.174:8000/studyhit/">Main study</a>&nbsp;</span></p> <p>&nbsp;</p>',
        null=False, 
        blank=False
    )


    failedQuizNumThr = models.IntegerField(
        "Maximum failed tasks in the quiz", 
        default=1, 
        editable=True, 
        validators=[MinValueValidator(0)]
    )

    pass_training_question_text = models.TextField(
        "Text for passing a training question", 
        max_length=4096, 
        default="Your answer is correct!", 
        null=False, 
        blank=False
    )

    traing_pass_text_timeout = models.IntegerField(
        "Time for showing text for passing one training question (second)", 
        default=1, 
        editable=True, 
        validators=[MinValueValidator(1)]
    )

    no_decision_training_msg = models.TextField(
        "Message for making 'no decision' in training", 
        max_length=4096, 
        default='Please click on one of the buttons "left", "not sure" or "right" according to the question asked under the videos.', 
        null=False, 
        blank=False
    ) # for image


    assignment_num_text = models.TextField(
        "Tell user how many assignments they have finished", 
        max_length=4096, 
        default="The number of the completed assignments: placeholder."
    ) # for hit

    training_description = RichTextField(
        "Description of training", 
        default='<div><span style="font-size:22px"><strong><span style="color:#27ae60">You are in the training session.</span></strong></span></div> <div><span style="font-size:22px">In this session, you will learn how to do the experiment accurately. &nbsp;In each question, you will be presented with two videos side by side: a pristine (high quality) reference video and a version that may exhibit some flickering effect.&nbsp;</span></div> <div><span style="font-size:22px">The questions are from the &quot;<span style="color:#2980b9">Flicker test</span>&quot; experiment described in the instructions.</span></div> <div><span style="font-size:22px">Please determine in which video you see a&nbsp;<span style="color:#3498db">flickering effect</span> by pressing the &laquo;left&raquo;or &laquo;right&raquo; button or choose the &laquo;not sure&raquo; &nbsp;button if you don&#39;t see a flickering effect on either video.</span></div>',
        null=False, 
        blank=False
    )

    
    quiz_description = RichTextField(
        "Description of quiz", 
        default='<div><h2><span style="font-size:22px"><span style="color:#27ae60"><strong>You are in the Quiz session</strong></span></span></h2></div> <div><span style="font-size:22px">This session is about the the Flicker test.</span></div> <div><span style="font-size:22px">Only if you pass this quiz, you will be allowed to do further HITs in this study.</span></div>', 
        null=False, 
        blank=False
    )


    flickering_test_description = RichTextField(
        "Flickering test description", 
        default='<p><span style="font-size:22px">The following NUM&nbsp;questions are from the &quot;<span style="color:#2980b9">Flicker Test</span>&quot; experiment. Please determine in which video you see a flickering effect.</span></p>',
        null=False, 
        blank=False
    )

    # quality_test_description = RichTextField(
    #     "Quality test description", 
    #     default="Quality test description", 
    #     null=False, 
    #     blank=False
    # )

    study_hit_url = models.URLField(max_length=200, default="http://localhost:8000/studyhit/")

    wrong_browser_msg = RichTextField(
        "Displayed message when workers don't use Firefox", 
        max_length=4096, 
        default='<p><span style="color:#e74c3c"><span style="font-size:22px"><strong>Please use the Firefox browser to run the experiment</strong></span></span></p><p><span style="font-size:22px"><span style="font-family:Roboto,sans-serif">If you do not have this page open in your Firefox browser, please copy and paste this link into your Firefox browser to start the experiment:&nbsp;</span><a href="http://localhost:8000/quahit/">http://localhost:8000/quahit/</a></span></p>',
        null=False, 
        blank=False
    )


    survey_btn_text = models.TextField(
        "Text on the survey button", 
        max_length=4096, 
        default="survey"
    ) # for hit

    def __str__(self):
        return self.title


class Instruction(models.Model):
    title = models.CharField(primary_key=True, max_length=20, default="Instruction", editable=False)
    description = RichTextField(default='<p><!--{C}%3C!%2D%2D%20%3Cscript%20type%3D"\'text%2Fjavascript\'"%20src%3D"https%3A%2F%2Fs3.amazonaws.com%2Fmturk-public%2FexternalHIT_v1.js"%3E%3C%2Fscript%3E%20%2D%2D%3E--></p><div class="main"><div class="imgpanel">&nbsp;</div>&nbsp;<div class="modal-body"><p><span style="font-size:20px"><span style="color:#2980b9"><strong><span style="color:blue; font-size:28px">Instructions</span> </strong> </span> </span></p><p dir="ltr"><span style="color:#191970; font-size:14px">This study includes two types of tests: a flicker test and a quality test</span></p><p><span style="font-size:20px"><span style="color:#2980b9"><strong>Flicker test:</strong> </span> </span></p><p dir="ltr"><span style="color:#191970; font-size:14px">In each question, you are presented with two videos side by side: a high quality reference video and a flickering version of it.</span></p><p dir="ltr"><span style="color:#191970; font-size:14px">In the flickering video, the frames alternate between high-quality reference frames and lower &nbsp;quality versions.</span></p><p dir="ltr"><span style="color:#191970; font-size:14px">Here is an example of a video with a very noticeable flickering effect.</span></p><div id="myContainer"><p>&nbsp;</p></div><p dir="ltr"><span style="color:#191970; font-size:14px">In some videos, the flickering effect may be barely perceptible. &nbsp;For example, some people do not see the flickering effect in the following video. </span></p><div id="myContainer"><p>&nbsp;</p></div><p dir="ltr"><span style="color:#191970; font-size:14px">You have to decide in which video you see a flicker effect. As soon as you notice flicker, press the &ldquo;left&rdquo; button if you see it in the left video and press the &ldquo;right&rdquo; button&rdquo; if you see it in the right &nbsp;video. The &ldquo;not sure&rdquo; button is disabled while the videos are still running. Note that the flicker effect may appear only at the end of the video. After the video ends, you can still make a decision within three seconds. If you have not noticed any flicker, click the &quot;not sure&quot; button. </span></p><p dir="ltr"><span style="color:#191970; font-size:14px">For each question, the side on which the flicker video is placed is random. The figure below shows an example. </span></p><p dir="ltr"><img alt="" src="https://videojnd1crf.s3.ap-south-1.amazonaws.com/Study_1crf_JND_videos/interfaceMedia/flicker_11.jpg" style="width:90%" /></p><p dir="ltr"><span style="color:#191970; font-size:14px">You can make your decision &ldquo;left&rdquo; or &ldquo;right&rdquo; while the videos are playing. If you cannot yet decide, a blank screen will be shown for three seconds following the videos and then please enter your answer, either &ldquo;left&rdquo;, &ldquo;right&rdquo;, or &ldquo;not sure&rdquo;.</span></p><p dir="ltr"><img alt="" src="https://videojnd1crf.s3.ap-south-1.amazonaws.com/Study_1crf_JND_videos/interfaceMedia/flicker_122.jpg" style="width:90%" /></p>&nbsp;<p dir="ltr"><span style="color:#191970; font-size:14px">Note that once you click the button, you cannot change your answer, and you will automatically jump to the next question. </span></p><p><strong><span style="color:red; font-size:14px">Disqualification</span></strong></p><p dir="ltr"><span style="color:red; font-size:14px">Please note that we are scoring your answers. If you skip too many questions by not giving an answer in the time provided or if you give wrong answers too often, your qualification for future assignments will be revoked and you will not be able take on any more assignments for this study. </span></p><p dir="ltr"><span style="color:#191970; font-size:14px">Thank you very much for doing your best, we appreciate your help! </span></p></div></div>', null=False, blank=False)
    def __str__(self):
        return self.title


    
    def __str__(self):
        return self.title
class ConsentForm(models.Model):
    title = models.CharField(primary_key=True, max_length=20, default="Consent Form", editable=False)
    description = RichTextField(default='<p><strong>CONSENT FORM</strong></p><p>Title of the project:&nbsp; JND-based video quality assessment</p><p>Principal Investigator:&nbsp; Dr. Mohsen Jenadeleh</p><p>Contact information: <a href="mailto:mohsen.jenadeleh@uni-konstanz.de">mohsen.jenadeleh@uni-konstanz.de </a>(phone: +4915126862754)</p><p>Thank you for your interest in this project. We want to remind you that the data you provide during this experiment will be kept strictly confidential and will only be used for research purposes. As a participant in this research, you will never be identified in the results (e.g., reports, research articles) that come out of this research project.</p><p>1. I&nbsp;understand that my participation in this study is voluntary and that I may withdraw at any time without giving any reason and without my legal rights being affected.</p><p>2. I understand that the information collected based on my opinion in this subjective experiment will be used to support other future research and may be shared anonymously with other researchers.</p><p>3. I have received enough information about this subjective experiment.</p><p>4. I agree with my own free will to participate in this study with full knowledge of all foregoing.</p>', null=False, blank=False)

    def __str__(self):
        return self.title

