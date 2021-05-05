from flask import Flask, request, session
from flask_socketio import SocketIO, emit
from flask_cors import CORS


app = Flask(__name__)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['CORS_SUPPORTS_CREDENTIALS'] = True
app.config['SECRET_KEY'] = 'mypassword'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins='*')

class RoomList:
    def __init__(self):
        self.rooms = {}
        self.next_id = 0

    def create_room(self, title):
        room_id = self.next_id
        self.rooms[room_id] = {
            'id': room_id,
            'title': title,
            'status': 'waiting',
            'total': 8,
            'joinedUsers': []
        }
        self.next_id += 1
        return self.rooms[room_id].copy()

    def get_room_list(self):
        room_list = []
        for room_id in self.rooms:
            room = self.rooms[room_id].copy()
            room_list.append(room)
        return room_list

    def get_room(self, room_id):
        if room_id in self.rooms:
            return self.rooms[room_id].copy()
        else:
            return None


room_list = RoomList()


@app.route('/api/user', methods=['GET', 'POST', 'DELETE'])
def user():
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
        session['username'] = username
        print(session)
        return {
            'success': True,
            'username': username
        }
    elif request.method == 'DELETE':
        session.pop('username', None)
        return {
            'success': True,
            'message': 'logout succeess'
        }


@app.route('/api/room', methods=['POST'])
@app.route('/api/room/<room_id>', methods=['GET'])
def room(room_id=None):
    if request.method == 'GET':
        if room_id == 'ALL':
            rooms = room_list.get_room_list()
            return {
                'success': True,
                'roomList': rooms
            }
        else:
            # Join the room
            if 'username' not in session:
                print(session)
                return {
                    'success': False,
                    'message': 'Not logged in'
                }
            username = session['username']
            room_id = int(room_id)
            room = room_list.get_room(room_id)
            if username not in room['joinedUsers']:
                room['joinedUsers'].append(username)
            if room is not None:
                return {
                    'success': True,
                    'room': room
                }
            else:
                return {
                    'success': False,
                    'message': 'Room not exist'
                }
    elif request.method == 'POST':
        data = request.get_json()
        title = data['title']
        room = room_list.create_room(title)
        print(room_list.rooms)
        return {
            'success': True,
            'room': room
        }


@socketio.on('connect', namespace='/lobby')
def handle_connect_in_lobby():
    emit('update-room-list', room_list.get_room_list(), broadcast=True, namespace='/lobby')

@socketio.on('create-room', namespace='/lobby')
def handle_create_room_in_lobby(data):
    title = data['title']
    room = room_list.create_room(title)
    emit('update-room-list', room_list.get_room_list(), broadcast=True, namespace='/lobby')

@socketio.on('enter-room', namespace='/lobby')
def handle_enter_room_in_lobby(data):
    room_id = data['room_id']
    username = data['username']
    room = room_list.get_room(room_id)
    if len(room['joinedUsers']) < room['total']:
        room['joinedUsers'].append(username)
        emit('enter-room', { 'success': True, 'roomId': room_id }, namespace='/lobby')
        emit('update-room-list', room_list.get_room_list(), broadcast=True, namespace='/lobby')
        emit('update-room', room, broadcast=True, namespace='/room')



@socketio.on('update-room', namespace='/room')
def handle_connect_in_room(data):
    room_id = int(data['room_id'])
    room = room_list.get_room(room_id)
    print('update-room', room)
    emit('update-room', room, namespace='/room')

@socketio.on('data', namespace='/room')
def handle_event(data):
    print(data)
    emit('broadcast-data', data, broadcast=True, include_self=False, namespace='/room')

@socketio.on('start-drawing', namespace='/room')
def handle_start_drawing_event(data, namespace='/room'):
    print('start-drawing', data)
    emit('start-drawing', data, broadcast=True, include_self=False, namespace='/room')

@socketio.on('end-drawing', namespace='/room')
def handle_end_drawing_event(data, namespace='/room'):
    print(data)
    emit('end-drawing', data, broadcast=True, include_self=False, namespace='/room')


@socketio.on('leave-room', namespace='/room')
def handle_leave_room(data):
    room_id = int(data['room_id'])
    username = data['username']
    room = room_list.get_room(room_id)
    joined_users = room['joinedUsers']
    joined_users.remove(username)
    if len(room['joinedUsers']) == 0:
        room_list.rooms.pop(room_id)
    print('leave_room', room_list.rooms)
    emit('update-room', room, broadcast=True, namespace='/room')
    emit('update-room-list', room_list.get_room_list(), broadcast=True, namespace='/lobby')


if __name__ == '__main__':
    socketio.run(app, debug=True)