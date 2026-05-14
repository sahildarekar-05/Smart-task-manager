from extensions import db
from datetime import datetime

class Task(db.Model):

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.String(50))
    status = db.Column(db.String(50))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    due_date = db.Column(db.String(100))

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('user.id')
    )