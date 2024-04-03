## Goal
please read issue [#56](https://github.com/angchen-dev/video_jnd/issues/56).

## Set up the environment
Clone repo
```
git clone git@github.com:angchen-dev/video_jnd.git
```

Add a SECRET_KEY of Django to ~/.bashrc <br />
Get a token from https://django-secret-key-generator.netlify.app/

```
> echo 'export SECRET_KEY="token"' >> ~/.bashrc 
> source ~/.bashrc
```

Setup Python virtual environment
```
> apt install python3-venv
> python3 -m venv videojnd-venv
> source videojnd-venv/bin/activate
```
Install python dependencies <br />
In directory ../video_jnd
```
> pip install -r requirements.txt
```

For MacOs there will be most likely an issue regarding webpack.

Solution:
```
> npm i --save-dev html-webpack-plugin
```


Configure Django project <br />
In directory ../video_jnd/videoJnd
```
> python3 manage.py makemigrations
> python3 manage.py migrate --run-syncdb
> python3 manage.py createsuperuser # for admin page
```

Launch website <br />
In directory ../video_jnd/videoJnd
```
> python3 manage.py runserver
# Open http://127.0.0.1:8000/quahit/ in firefox
```

## For development
- Front-end <br/>
../video_jnd/GUI is for study HIT <br/>
../video_jnd/gui_quahit is for qualification HIT <br/>

   I developed the two HITs separately. However, most of the functions are the same. So the better way refactor the code.

    To run the two interfaces, run the following commands in ../video_jnd/GUI and ../video_jnd/gui_quahit, respectively.
    ```
    npm install
    npm start
    ```
    To compile the code, please run
    ```
    webpack ./src/main.js -o ./dist/bundle.js
    ```
    The compiled codes are stored in folder ../dist. <br/>
    After finished developing the front-end, the .html, .js, .css files need to be copied to the folder of Django project.

    Go to folder video_jnd/videoJnd/videoJnd/src/utils
    ```
    # comment / uncomment
    # hit = "studyhit"
    # hit = "quahit"

    python3 cp_front_files.py
    ```

- Back-end <br/>
../video_jnd/videoJnd is for backend <br/>


## The whole program should be refactored.
The requirements of the project were changed frequently during the development and the project had a tight deadline such that the architecture of the whole program was not well-designed. To extend the project, the whole program should be refactored. 

