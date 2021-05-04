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


@socketio.on('enter_room')
def handle_enter_room(data):
    room_id = int(data['room_id'])
    username = data['username']
    room = room_list.get_room(room_id)
    print('enter_room', room_list.rooms)
    joined_users = room['joinedUsers']
    if username not in joined_users:
        joined_users.append(username)
    emit('update', room, broadcast=True)

@socketio.on('leave_room')
def handle_leave_room(data):
    room_id = int(data['room_id'])
    username = data['username']
    room = room_list.get_room(room_id)
    joined_users = room['joinedUsers']
    joined_users.remove(username)
    if len(room['joinedUsers']) == 0:
        room_list.rooms.pop(room_id)
    print('leave_room', room_list.rooms)
    emit('update', room, broadcast=True)


if __name__ == '__main__':
    socketio.run(app, debug=True)