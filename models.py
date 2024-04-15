from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String)
    password_hash = db.Column(db.String)
    highest_score_id = db.Column(db.Integer, db.ForeignKey('score.id'))
    latest_score_id = db.Column(db.Integer, db.ForeignKey('score.id'))

    highest_score = db.relationship("Score", foreign_keys=[highest_score_id])
    latest_score = db.relationship("Score", foreign_keys=[latest_score_id])

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer)
    date_time = db.Column(db.DateTime, default=datetime.utcnow())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    user = db.relationship("User", foreign_keys=[user_id])
