
from flask import Flask
from flask import render_template
from extensions import db, login_manager, socketio

from models.user import User
from models.task import Task

import os  
app = Flask(__name__)
app.config.from_object('config.Config')
db.init_app(app)
login_manager.init_app(app)
socketio.init_app(app)

from models.user import User
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

from models.task import Task

from routes.auth_routes import auth
app.register_blueprint(auth)

from routes.task_routes import task
app.register_blueprint(task)

from routes.analytics_routes import analytics
app.register_blueprint(analytics)

# for rendering login , register pages and dashboard 
@app.route('/')
def home():
    return render_template('login.html')


@app.route('/login-page')
def login_page():
    return render_template('login.html')


@app.route('/register-page')
def register_page():
    return render_template('register.html')


@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')


# RUN APP
if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    port = int(os.environ.get('PORT', 5000))
    socketio.run(
        app,
        host='0.0.0.0',
        port=port
    )


