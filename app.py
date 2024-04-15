from flask import Flask, jsonify, render_template, request, redirect, url_for, session, make_response
from models import db, User, Score
from werkzeug.security import generate_password_hash, check_password_hash


def create_app():
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
            print(request.json)

            if 'score' in request.json:
                score_value = int(request.json['score'])
                user_id = session.get('user_id')
                if user_id:
                    user = User.query.get(user_id)

                    new_score = Score(score=score_value, user=user)
                    db.session.add(new_score)
                    db.session.commit()

                    user.latest_score_id = new_score.id
                    db.session.commit()

                    if not user.highest_score or score_value > user.highest_score.score:
                        user.highest_score = new_score
                        db.session.commit()

                return redirect(url_for('game'))
            else:
                return "Score data missing", 400

    @app.route('/highscores')
    def highscores():
        top_scores = Score.query.order_by(Score.score.desc()).limit(10).all()
        scores_data = [{'user': score.user.username, 'score': score.score} for score in top_scores]
        return jsonify(scores_data)

    return app

def main():
    app = create_app()
    app.run(debug=True)

if __name__ == '__main__':
    main()
