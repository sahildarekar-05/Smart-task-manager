from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db
from models.user import User

auth = Blueprint('auth', __name__)

# REGISTER
@auth.route('/register', methods=['POST'])
def register():

    data = request.get_json()

    existing_user = User.query.filter_by(username=data['username']).first()

    if existing_user:
        return jsonify({
            "message": "Username already exists"
        }), 400

    hashed_password = generate_password_hash(data['password'])

    new_user = User(
        username=data['username'],
        password=hashed_password
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully"
    })


# LOGIN
@auth.route('/login', methods=['POST'])
def login():

    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    if check_password_hash(user.password, data['password']):

        return jsonify({
            "message": "Login successful",
            "user_id": user.id,
            "username": user.username
        })

    return jsonify({
        "message": "Invalid password"
    }), 401