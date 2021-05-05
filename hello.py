from flask import Flask, request, session
from flask_socketio import SocketIO, emit
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SECRET_KEY'] = 'mypassword'
app.config['CORS_HEADERS'] = 'Content-Type'
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/api/user', methods=['GET', 'POST'])
def user_register():
    if request.method == 'GET':
        if 'username' in session:
            return {
                'success': True,
                'username': session['username']
            }
        else:
            return {
                'success': False,
                'message': 'Not registered'
            }
    elif request.method == 'POST':
        data = request.get_json()
        username = data['username']
        if username in session['username']:
            return {
                'success': True,
                'username': session['username']
            }

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