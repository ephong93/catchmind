from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mypassword'
socketio = SocketIO(app, cors_allowed_origins='*')


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