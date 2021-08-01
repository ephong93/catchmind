from flask_socketio import emit, join_room, leave_room

users = []

class Lobby:
    def __init__(self):
        self.rooms = {}
        self.next_id = 0

    def create_room(self, title, username):
        room_id = self.next_id
        self.rooms[room_id] = Room(room_id, title)
        self.next_id += 1
        room = self.rooms[room_id]

        emit('check-if-enterable', { 'success': True, 'roomId': room_id}, namespace='/lobby')
        emit('update-room-list', self.get_room_list(), broadcast=True, namespace='/lobby')
        emit('update-room', room.to_json(), broadcast=True, namespace='/room')

    def remove_room(self, room_id):
        self.rooms.pop(room_id)

    def get_room_list(self):
        room_list = []
        for room_id in self.rooms:
            room = self.rooms[room_id].to_json()
            room_list.append(room)
        return room_list

    def get_room(self, room_id):
        if room_id in self.rooms:
            return self.rooms[room_id]
        else:
            return None

    def enter_room(self, username, room_id):
        room = self.get_room(room_id)
    
        if len(room.joined_users) < room.total:
            room.joined_users.append(username)

            emit('enter-room', { 'success': True, 'roomId': room_id }, namespace='/room')
            emit('update-room-list', self.get_room_list(), broadcast=True, namespace='/lobby')
        else:
            emit('enter-room', { 'success': False, 'roomId': room_id }, namespace='/room')


class Room:
    session_table = {}

    def __init__(self, room_id, title, total=8, joined_users={}):
        self.room_id = room_id
        self.title = title
        self.status = 'waiting' # waiting, playing
        self.total = total
        self.joined_users = joined_users
        self.messages = []

    def check_if_enterable(self, username):
        if len(self.joined_users) >= self.total:
            return False, 'full-room'
        if username in [self.joined_users[sid] for sid in self.joined_users]:
            return False, 'already-entered'
        return True, None

    def enter_room(self, username, session_id):
        if len(self.joined_users) >= self.total:
            emit('enter-room', { 'success': False, 'roomId': self.room_id, 'message': 'full-room' }, namespace='/room')
            return

        if username in [self.joined_users[sid] for sid in self.joined_users]:
            print('enter room failed')
            emit('enter-room', { 'success': False, 'roomId': self.room_id, 'message': 'already-entered' }, namespace='/room')
            return

        self.joined_users[session_id] = username
        Room.session_table[session_id] = self.room_id
        join_room(self.room_id)

        if len(self.joined_users) > 1:
            for joined_user_session_id in self.joined_users:
                joined_user = self.joined_users[joined_user_session_id]
                if joined_user != username:
                    break
            emit('request-image', {'userRequested': username, 'requestedTo': joined_user}, to=self.room_id, include_self=False)
        emit('update-room', self.to_json(), to=self.room_id, include_self=True)


    def leave_room(self, session_id):
        if session_id in self.joined_users:
            self.joined_users.pop(session_id)
        if len(self.joined_users) == 0:
            lobby.remove_room(self.room_id)
        leave_room(self.room_id)

        emit('update-room', self.to_json(), to=self.room_id)
        emit('update-room-list', lobby.get_room_list(), broadcast=True, namespace='/lobby')

    def put_message(self, sender, message):
        self.messages.append((sender, message))

    def get_messages(self):
        return self.messages

    def to_json(self):
        return {
            'id': self.room_id,
            'title': self.title,
            'status': self.status,
            'joinedUsers': [self.joined_users[session_id] for session_id in self.joined_users] + [None] * (self.total - len(self.joined_users)),
            'currentNumberOfUsers': len(self.joined_users),
            'total': self.total
        }


lobby = Lobby()
