from flask import Flask, request, session
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'mypassword'
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/api/user', methods=['POST'])
def user_register():
    print(request.get_json())
    return 'hello'


@socketio.on('data')
def handle_event(data):
    print(data)
    emit('broadcast-data', data, broadcast=True, include_self=False)

@socketio.on('start-drawing')
def handle_start_drawing_event(data):
    print(data)
    emit('start-drawing', data, broadcast=True, include_self=False)

@socketio.on('end-drawing')
def handle_end_drawing_event(data):
    print(data)
    emit('end-drawing', data, broadcast=True, include_self=False)

if __name__ == '__main__':
    socketio.run(app, debug=True)