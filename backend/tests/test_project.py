from io import BytesIO
import pytest
import pyrebase
from config import create_app, storage, db
import os

@pytest.fixture(scope='module')
def app():
    app = create_app()
    app.config['TESTING'] = True
    yield app

@pytest.fixture(scope='module')
def firebase():
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
    yield firebase

# créer un client de test Flask à partir de l'instance d'application Flask fournie par la fixture app
@pytest.fixture(scope='module')
def client(app):
    with app.test_client() as client:
        yield client

# tester l'authentification de l'utilisateur
def test_create_user(client, firebase):
    auth = firebase.auth()

    # create a test user
    user_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    auth.create_user_with_email_and_password(user_data['email'], user_data['password'])

    # check that the user was created
    user = auth.sign_in_with_email_and_password(user_data['email'], user_data['password'])
    assert user is not None

# test pour la fonction register qui permet d'enregistrer les utilisateurs
def test_register_success(client):
    # Test with valid registration data
    data = {
        "firstname": "John",
        "lastname": "Doe",
        "email": "johndoe@example.com",
        "password": "password123"
    }
    response = client.post('/api/register', data=data)
    assert response.status_code == 200
    assert response.get_json() == {'result': 'success'}


def test_login(client):
    # Test with valid login data
    data = {
        "email": "johndoe@example.com",
        "password": "password123"
    }
    response = client.post('/api/login', data=data)
    assert response.status_code == 200
    assert response.get_json() == {'status': True}

    # Test with invalid login data
    data = {
        "email": "johndoe@example.com",
        "password": "wrongpassword"
    }
    response = client.post('/api/login', data=data)
    assert response.status_code == 200
    assert response.get_json() == {'status': False}



# tester quand la session est  crée
def test_getuser_authenticated(client):
    # Set up the session for an authenticated user
    with client.session_transaction() as session:
        session['loggedin'] = True
        session['id'] = '1'
        session['email'] = 'test@example.com'
        session['firstname'] = 'John'
        session['lastname'] = 'Doe'

    # Make a request to the /api/getuser endpoint
    response = client.post('/api/getuser')

    # Check that the response is a JSON object with the correct keys and values
    assert response.status_code == 200
    assert response.json == {
        'id': '1',
        'email': 'test@example.com',
        'firstname': 'John',
        'lastname': 'Doe'
    }

# tester quand la session n'est pas crée
def test_getuser_unauthenticated(client):
    # Make a request to the /api/getuser endpoint without setting up the session
    response = client.post('/api/getuser')

    # Check that the response is None
    assert response.status_code == 200
    assert response.json == None


#  test logout
def test_getuser_and_logout(client):
    # simulate a user login
    data = {'email': 'testuser@test.com', 'password': 'testpassword'}
    client.post('/api/login', data=data)
    
    # test getuser()
    response = client.post('/api/getuser')
    assert response.status_code == 200
    assert response.json == {'id': '1', 'email': 'testuser@test.com', 'firstname': 'Test', 'lastname': 'User'}
    
    # test logout()
    response = client.get('/api/logout')
    assert response.status_code == 200
    assert response.json == {'status': 'logged out'}
    
    # test that user is no longer logged in
    response = client.post('/api/getuser')
    assert response.status_code == 200
    assert response.json is None


# test ajout d'un fichier
def test_addpost(client):
    # create a session for the user
    with client.session_transaction() as sess:
        sess['loggedin'] = True
        sess['id'] = 'user_id'
        sess['firstname'] = 'John'
        sess['lastname'] = 'Doe'
    
    # create a temporary file
    file = BytesIO(b'some data')
    file.filename = 'test.csv'

    # send a POST request with the file
    response = client.post('/api/addpost', 
                           data={'cover': file},
                           content_type='multipart/form-data')

    # check that the response status code is 200
    assert response.status_code == 200
    
    # check that the response data is valid
    data = response.get_json()
    assert data['data'] == 'test.csv'
    
    # check that the file was uploaded to Firebase Storage
    storage_file = storage.child('uploads/test.csv').get_url(None)
    assert storage_file is not None
    
    # check that the file info was saved to Firebase Realtime Database
    db_file = db.child('users').child('user_id').child('csvfile').get()
    assert db_file is not None
    
    # clean up temporary file
    os.remove(file.filename)


