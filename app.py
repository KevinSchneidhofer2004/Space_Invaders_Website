from flask import Flask, render_template, request, flash, redirect, url_for, session, make_response
from models import db
from models import User, Score
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "super secret key"

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///G:/Schule/INSY 5AHIT/Space Invaders ReWebed/test.db'

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
            #flash('Username already exists', 'error')
            return redirect(url_for('login'))
        else:
            password_hash = generate_password_hash(password)
            new_user = User(username=username, password_hash=password_hash)
            db.session.add(new_user)
            db.session.commit()
            #flash('Registration successful', 'success')
            return redirect(url_for('game'))
    else:
        return redirect(url_for('login'))



@app.route('/game')
def game():
    return render_template('game.html')

app.run(debug=True)
