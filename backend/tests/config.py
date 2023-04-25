from flask import Flask
import pyrebase
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

firebase = pyrebase.initialize_app(config)
db = firebase.database()
    #storage
storage = firebase.storage()
firebase = pyrebase.initialize_app(config)
db = firebase.database()
#storage
storage = firebase.storage()
def create_app():
    app = Flask(__name__)

    # Configure app here
    
    return app