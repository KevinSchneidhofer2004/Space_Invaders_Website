import unittest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app')))


from app.app import create_app

class TestFlaskApp(unittest.TestCase):
    def setUp(self):
        app = create_app()
        self.app = app.test_client()

    def test_index(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)

    def test_login(self):
        response = self.app.post('/login', data={'userName': 'test_user', 'userPassword': 'test_password'})
        self.assertEqual(response.status_code, 200)

    def test_register(self):
        response = self.app.post('/register', data={'userName': 'new_user', 'userPassword': 'new_password'})
        self.assertEqual(response.status_code, 302)
        location_header = response.headers['Location']
        print(response.headers)
        location_bytes = location_header.encode('utf-8')
        self.assertIn(b'/login', location_bytes)

    def test_game(self):
        response = self.app.get('/game')
        self.assertEqual(response.status_code, 302)

    def test_save_score(self):
        response = self.app.post('/save_score', json={'score': 100})
        self.assertEqual(response.status_code, 302)

    def test_highscores(self):
        response = self.app.get('/highscores')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)

    def test_invalid_credentials_login(self):
        response = self.app.post('/login', data={'userName': 'nonexistent_user', 'userPassword': 'wrong_password'})
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Invalid username or password', response.data)

    def test_unauthorized_game_access(self):
        with self.app as client:
            response = client.get('/game', follow_redirects=True)
            self.assertEqual(response.status_code, 200)
            self.assertIn(b'login', response.data)

    def test_unauthorized_highscores_access(self):
        response = self.app.get('/highscores')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'user', response.data)
        self.assertIn(b'score', response.data)

if __name__ == '__main__':
    unittest.main()
