from flask import Flask
from flask_cors import CORS
from game import Lobby

lobby = Lobby()

if __name__ == '__main__':
    app = Flask(__name__)
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config['CORS_SUPPORTS_CREDENTIALS'] = True
    app.config['SECRET_KEY'] = 'mypassword'
    CORS(app)

    import api
    app.register_blueprint(api.bp)

    from event_handler import socketio
    socketio.init_app(app, cors_allowed_origins='*')

    socketio.run(app, debug=True)