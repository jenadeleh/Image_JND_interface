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
        default="", 
        null=False, 
        blank=False
    )
    
    distortion_question = RichTextField(
        "Question for distortion test", 
        max_length=4096, 
        default="", 
        null=False, 
        blank=False
    )
    
    text_end_exp = RichTextField(
        "When the experiment is done, display", 
        default="", 
        null=False, 
        blank=False
    )
    
    text_end_hit = RichTextField(
        "When the HIT is done, display", 
        default="", 
        null=False, 
        blank=False
    )

    text_end_hit_no_avl = RichTextField(
        "When the HIT is done and no available videos, display", 
        default="", 
        null=False, 
        blank=False
    )
    
    decision_timeout_msg = models.TextField(
        "When user doesn't make a decision, display", 
        max_length=4096, 
        default="", 
        null=False, 
        blank=False
    ) # for image
    
    btn_text_end_hit = models.TextField(
        "Text of the button when the HIT is done", 
        max_length=4096, 
        default="", 
        null=False, 
        blank=False
    )
    
    instruction_btn_text = models.CharField(
        "Text of the button in the instruction page", 
        max_length=20, 
        default="", 
        null=False, 
        blank=False
    )
    
    consent_btn_text = models.CharField(
        "Text of the button in the consent form page", 
        max_length=20, 
        default="", 
        null=False, 
        blank=False
    )
    
    no_available_exp = RichTextField(
        "When there is no experiment available, display", 
        default="", 
        null=False, 
        blank=False
    )
    
    waiting_timeout_msg = models.TextField(
        "When the HIT is expired, display", 
        max_length=4096, 
        default="", 
        null=False, 
        blank=False
    ) # for hit
    
    download_timeout_msg = models.TextField(
        "When download timeout, display", 
        max_length=4096, 
        default="", 
        null=False, 
        blank=False
    ) # for hit
    
    fail_quiz_text = RichTextField(
        "Text for failed quiz session", 
        max_length=4096, 
        default="Sorry, you failed the quiz session", 
        null=False, 
        blank=False
    )

    pass_quiz_text = RichTextField(
        "Text for passed quiz session", 
        max_length=4096, 
        default="You passed the quiz session", 
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
        default="You pass one question!", 
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
      default="", 
      null=False, 
      blank=False
    ) # for image

    assignment_num_text = models.TextField(
        "Tell user how many assignments they have finished", 
        max_length=4096, 
        default="The number of the completed assignments: placeholder. (you can edit this text on 'interface text' page. Please use 'placeholder' to represent the number.)"
    ) # for hit

    training_description = RichTextField(
        "Description of training", 
        default="Description of training", 
        null=False, 
        blank=False
    )
    
    quiz_description = RichTextField(
        "Description of quiz", 
        default="Description of quiz", 
        null=False, 
        blank=False
    )

    flickering_test_description = RichTextField(
        "Flickering test description", 
        default="Flickering test description", 
        null=False, 
        blank=False
    )
    quality_test_description = RichTextField(
        "Quality test description", 
        default="Quality test description", 
        null=False, 
        blank=False
    )

    study_hit_url = models.URLField(max_length=200, default="")

    wrong_browser_msg = RichTextField(
        "Displayed message when workers don't use firefox", 
        max_length=4096, 
        default="", 
        null=False, 
        blank=False
    )

    survey_btn_text = models.TextField(
        "Text on the survey button", 
        max_length=4096, 
        default="Text on the survey button"
    ) # for hit

    def __str__(self):
        return self.title

class Instruction(models.Model):
    title = models.CharField(primary_key=True, max_length=20, default="Instruction", editable=False)
    description = RichTextField(default="", null=False, blank=False)
    def __str__(self):
        return self.title

class ConsentForm(models.Model):
    title = models.CharField(primary_key=True, max_length=20, default="Consent Form", editable=False)
    description = RichTextField(default="", null=False, blank=False)
    def __str__(self):
        return self.title

