import csv
import datetime
from io import StringIO
from flask import Flask, request, jsonify, session, render_template
import json
from flask_mysqldb import MySQL
# utiliser mysql avec flask
from flask_cors import CORS, cross_origin
import os
import uuid 
from werkzeug.utils import secure_filename
import pyrebase
#import pyrebase
import urllib.request
import pandas as pd
from analyse import analysefunc
# local uploads 
UPLOAD_FOLDER = "./uploads"
ALLOWED_EXTENTIONS = {"csv", "png", "jpeg", "gif"}


#filter mime-types 
def allowed_files(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENTIONS

app = Flask(__name__, static_folder='static')
app.secret_key = 'your_secret_key'
#config
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config["MYSQL_DB"] = "visualisation"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER 
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config['SESSION_COOKIE_SAMESITE'] = "None"


# app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=True)
# session['loggedin'] = False
# session['id'] = ""
# session['email'] = ""
# session['firstname'] = ""
# session['lastname'] = ""
# session['password'] = ""
mysql = MySQL(app)
cors = CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

# email of firebase admin: visualisationproj@gmail.com
# password of firebase admin: iiiia2023
#fire base config
config = {
    "apiKey": "AIzaSyBAghCslXj0tiegqo-_BJzOeaLZH_DvpSY",
  "authDomain": "visualisation-c78b5.firebaseapp.com",
  "projectId": "visualisation-c78b5",
  "storageBucket": "visualisation-c78b5.appspot.com",
  "messagingSenderId": "584789840609",
  "appId": "1:584789840609:web:04e2cabef94a4a8c365da0",
  "serviceAccount": "./keyfile.json",
  "databaseURL": "https://visualisation-c78b5-default-rtdb.firebaseio.com"

}

#init firebase app
firebase = pyrebase.initialize_app(config)
auth = firebase.auth()
#real time database instance
db = firebase.database()
#storage
storage = firebase.storage()
# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route("/api/posts", methods=["GET"])
# def index():
#     if request.method == "GET":
#         return jsonify(data="posts main response")

# @app.route("/api/addposts", methods=["POST"])
#     if request.method == "POST":
        
# fonction permettant le sign up de l'utilisateur
@app.route("/api/register", methods=["POST"])
def register():
    if request.method == "POST":

        firstname = request.form.get("firstname")
        lastname = request.form.get("lastname")
        email = request.form.get("email")
        password = request.form.get("password")
        try:
            
        #create the user
            user = auth.create_user_with_email_and_password(email, password)
            
            userinfo = {
                "email":email,
                "firstname":firstname,
                "lastname":lastname
            }
            local = auth.get_account_info(user['idToken'])
            localId = local['users'][0]['localId']
           
         
            db.child('users').child(localId).set(userinfo)
            status = "success"
        except:
            status = "emailexists"
           
    return jsonify({'result': status})



@app.route('/api/login', methods=['POST'])
def login():
    print("allllllllllllllllooooooooo")
    if request.method == 'POST':
        print("alllllllllllllllllllllllllllllllooooooooo")
        email = request.form['email']
        password = request.form['password']
        # Check if account exists using MySQL
        try:
        # Verify user credentials with Firebase Authentication
           
            user = auth.sign_in_with_email_and_password(email, password)
     
            local = auth.get_account_info(user['idToken'])
            localId = local['users'][0]['localId']

            orderedDict = db.child("users").order_by_key().equal_to(localId).limit_to_first(1).get()
            items = list(orderedDict.val().items())
        
            session['loggedin'] = True
            session['id'] = items[0][0]
            session['email'] = items[0][1]['email']
            session['firstname'] = items[0][1]['firstname']
            session['lastname'] = items[0][1]['lastname']
            status = "success"
            return jsonify({'status': True})
        except:
            print("error")
            return jsonify({'status': False})

      
        
@app.route('/api/getuser',  methods=['POST'])
def getuser():
    if request.method == "POST":
        print(session)
        if session.get("loggedin"):
         
            return jsonify({"id": session['id'], "email": session["email"], "firstname": session['firstname'], "lastname": session['lastname']})
        else:
            return None

@app.route('/api/logout')
def logout():
    # Remove session data, this will log the user out
   session.pop('loggedin', None)
   session.pop('id', None)
   session.pop('username', None)

   return jsonify({'status': "logged out"})


@app.route("/api/addpost", methods=["POST"])
def addpost():
    if request.method == "POST":

        cover = request.files["cover"]
        if cover.filename.split(".")[1] == "csv":
            filename = str(uuid.uuid4())
            filename += "."
            filename += cover.filename.split(".")[1]

            #save the file inside the uploads folder
            cover.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

            #local file
            local_filename = "./uploads/"
            local_filename += filename   

            #firebase filename
            firebase_filename = "uploads/"
            firebase_filename += filename

            #upload the file
            storage.child(firebase_filename).put(local_filename)
            #get the url of the file
            cover_image = storage.child(firebase_filename).get_url(None)
            infofile = {
                "filename": filename,
                "URL": cover_image
            }
            print("le fichier ajouté", filename, cover_image)
            #get cursor to exec the mysql functions

            print(session['firstname'])
            try:
                
                localId = session["id"]
                db.child("users").child(localId).child("csvfile").push(infofile)

                status = filename

            except: 
                status = 'fail'
            os.remove(os.path.join(app.config["UPLOAD_FOLDER"], filename))

            return jsonify({"data" : status})
        else:

            return jsonify({"data" : "fail"})


# une fonction qui vérifie si l'utilisateur est authentifié, elle est utilisé pour l'intediction des lien niveau frontend
@app.route('/api/protected',  methods=['GET'])
def protected():
    if 'loggedin' in session:
        if session['loggedin']:
            return jsonify({"authenticated" : True})
        else:
            return jsonify({"authenticated" : False})
    else:
        return jsonify({"authenticated" : False})




@app.route("/api/analyse", methods=["POST"])   
def analyse():
    if request.method == "POST":
        print(request.form)
        data1 = request.get_json()
        filename = data1.get('filename')
        filename = 'uploads/' + filename
        print(filename)
        print(type(filename))
        blob = storage.bucket.blob(filename)
        url = blob.generate_signed_url(
            expiration=datetime.timedelta(minutes=15),
            method="GET"
        )

        if filename.split(".")[1] == "csv":
        # Retrieve contents of uploaded file from Firebase Storage
            with urllib.request.urlopen(url) as url:
                content = url.read().decode("latin1")
    
            result, resultdfcluster = analysefunc(content)

            # si il y a eu une exception au niveau de l'analyse
            if result == "fail":
                # Delete the file
                blob.delete()
                localId = session["id"]
                # delete file reference in user so it don't appear in history
                csvfile = db.child("users").child(localId).child("csvfile").order_by_key().limit_to_last(1).get()
                most_recent_child_key = list(csvfile.val().items())[0][0]
                print(most_recent_child_key)

                most_recent_child_ref = db.child("users").child(localId).child("csvfile").child(most_recent_child_key).remove()

        
                return jsonify({"json" : "nothing"})
            else:
                
                #local filename
                filenamejson = filename.split(".")[0]
                filenamejson += ".json"
                result_firebase_filename = "results/"
                result_firebase_filename += filename.split("/")[1]

                #local file csv
                local_filename = "./result/"
                local_filename += filename.split("/")[1]
                resultdfcluster.to_csv(local_filename) 
                
                #upload the file
                storage.child(result_firebase_filename).put(local_filename)
                #get the url of the file
                cover_imagedf = storage.child(result_firebase_filename).get_url(None)
                infofiledf = {
                    "filename": filename.split("/")[1],
                    "URL": cover_imagedf
                }
                os.remove(os.path.join("", local_filename))
                try:
                    if "id" in session:
                        localId = session["id"]
                        db.child("users").child(localId).child('resultdf').push(infofiledf)
                    status = filenamejson
                except: 
                    status = 'success'

                #firebase filename
                firebase_filename = filenamejson
                with open(filenamejson, "w") as f:
                    jsonify(json.dump(result, f))

                storage.child(firebase_filename).put(filenamejson)
                print("fichier enregistré")
                #get the url of the file
                cover_image = storage.child(firebase_filename).get_url(None)
            
                infofile = {
                    "filename": filenamejson,
                    "URL": cover_image
                }
                # supprimer fichier localement
                os.remove(os.path.join("./", filenamejson))
                try:
                    if "id" in session:
                        localId = session["id"]
                        db.child("users").child(localId).child('jsonfiles').push(infofile)
                    status = filenamejson
                except: 
                    status = 'fail'
        else:
            status = "nothing"
        return jsonify({"json" : status})
    else:
        return jsonify({"json" : "nothing"})


# fonction permettant de recuperer les fichiers stocké 
@app.route("/api/getfiles", methods=["GET"])   
def getfiles():  
    try:
        if "id" in session:
            files = db.child("users").child(session["id"]).child("csvfile").get()
            
            #compter le nombre de fichier
            count = 0 
            dic = {}
            for file in files:
                count += 1
                
                dic[count] = file.val()['filename'].split('.')[0]
    except:
        dic = {"0": "nothing"}
        
    return jsonify(dic)





   # Redirect to login page
if __name__== "__main__":
    app.run()


