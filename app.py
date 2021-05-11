from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room, rooms
from flask_cors import CORS

socketio = SocketIO()

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