from flask import Flask, render_template, request, redirect, url_for, session, make_response
from models import db, User, Score
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "super secret key"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST', 'GET'])
def login():
    error = None
    if request.method == 'POST':
        username = request.form.get('userName')
        password = request.form.get('userPassword')
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            error = None
            session['user_id'] = user.id
            return redirect(url_for('game'))
        else:
            error = 'Invalid username or password'
            return render_template('login.html', error=error)
    else:
        error = None
        response = make_response(render_template('login.html', error=error))
        response.cache_control.no_cache = True
        response.cache_control.no_store = True
        response.cache_control.must_revalidate = True
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response

@app.route('/register', methods=['POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('userName')
        password = request.form.get('userPassword')

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return redirect(url_for('login'))
        else:
            password_hash = generate_password_hash(password)
            new_user = User(username=username, password_hash=password_hash)
            db.session.add(new_user)
            db.session.commit()
            session['user_id'] = new_user.id
            return redirect(url_for('game'))
    else:
        return redirect(url_for('login'))

@app.route('/game')
def game():
    user_id = session.get('user_id')
    if user_id:
        user = User.query.get(user_id)
        return render_template('game.html', highest_score=user.highest_score.score if user.highest_score else 0)
    else:
        return redirect(url_for('login'))

@app.route('/save_score', methods=['POST'])
def save_score():
    if request.method == 'POST':
        # Check the JSON data sent in the request
        print(request.json)
        
        # Check if the 'score' key exists in the JSON data
        if 'score' in request.json:
            score_value = int(request.json['score'])
            user_id = session.get('user_id')
            if user_id:
                user = User.query.get(user_id)

                new_score = Score(score=score_value, user=user)
                db.session.add(new_score)
                db.session.commit()

                if not user.highest_score or score_value > user.highest_score.score:
                    user.highest_score = new_score
                    db.session.commit()

            return redirect(url_for('game'))
        else:
            # If 'score' key is missing, return a suitable response
            return "Score data missing", 400



if __name__ == '__main__':
    app.run(debug=True)