import os
from pathlib import Path
import shutil

if __name__ == "__main__":
    # hit = "studyhit"
    hit = "quahit"

    print(hit)


    js_path = Path("../../static/js/")
    css_path = Path("../../static/css/")
    images_path = Path("../../static/images/")
    html_path = Path("../../templates/")
    
    dist_path = Path(f"../../../../gui_{hit}/dist/")

    if hit == "studyhit":
      dist_path = Path(f"../../../../GUI/dist/")

    
    new_html_line = """<script type="text/javascript" src="../static/js/""" + "%s_bundle.js"  % hit + """"></script></body>"""


    with open(dist_path / "index.html", "r") as fi:
        html = fi.read()
        html = html.replace(
            """<script type="text/javascript" src="bundle.js"></script></body>""",
            new_html_line
        )

    with open(dist_path / "index.html", "w") as fi:
        fi.write(html)

    with open(dist_path / "bundle.js", "r") as fi:
        bundle = fi.read()
        bundle = bundle.replace(
            "http://127.0.0.1:8000/scheduler",
            "/scheduler"
        )    

    with open(dist_path / "bundle.js", "w") as fi:
        fi.write(bundle)

    bundle = "%s_bundle.js" % hit
    bundle_map = "%s_bundle.js.map" % hit
    html = "%s.html" % hit

    shutil.copy(dist_path / "bundle.js", js_path / bundle)
    shutil.copy(dist_path / "bundle.js.map", js_path / bundle_map)
    shutil.copy(dist_path / "css/style.css", css_path / "style.css")
     # Kopieren Sie das gesamte Verzeichnis mit den Bildern
     # only doing it when we have new images
    # shutil.copytree(dist_path / "images", images_path)
    shutil.copy(dist_path / "index.html", html_path / html)




