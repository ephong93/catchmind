from flask_socketio import emit, join_room, leave_room
import random

class Lobby:
    def __init__(self):
        self.rooms = {}
        self.next_id = 0

    def create_room(self, title, username):
        room_id = self.next_id
        self.rooms[room_id] = Room(room_id, title, joined_users=[username])
        self.next_id += 1
        room = self.rooms[room_id]

        # send data
        emit('enter-room', { 'success': True, 'roomId': room_id}, namespace='/lobby')
        emit('update-room-list', self.get_room_list(), broadcast=True, namespace='/lobby')
        emit('update-room', room.to_json(), broadcast=True, namespace='/room')

    def remove_room(self, room_id):
        self.rooms.remove(room_id)

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

            emit('enter-room', { 'success': True, 'roomId': room_id }, namespace='/lobby')
            emit('update-room-list', self.get_room_list(), broadcast=True, namespace='/lobby')




class Room:
    def __init__(self, room_id, title, total=8, joined_users=[]):
        self.room_id = room_id
        self.title = title
        self.status = 'waiting' # waiting, playing
        self.total = total
        self.joined_users = joined_users
        self.current_player = None
        self.current_answer = None
        self.count_turns = {}
        self.total_rounds = 2
        self.current_round = 0
        self.point_status = {}
        self.ready_status = {}

    
    def enter_room(self, username):
        self.ready_status[username] = 0
        join_room(self.room_id)

        if len(self.joined_users) > 1:
            for joined_user in self.joined_users:
                if joined_user != username:
                    break
            emit('request-image', {'userRequested': username, 'requestedTo': joined_user}, to=self.room_id, include_self=False)
        emit('update-room', self.to_json(), to=self.room_id, include_self=True)


    def leave_room(self, username):
        self.ready_status.pop(username)
        self.joined_users.remove(username)
        if len(room.joined_users) == 0:
            lobby.remove_room(room_id)
        leave_room(room_id)

        emit('update-room', self.to_json(), to=room_id)
        emit('update-room-list', lobby.get_room_list(), broadcast=True, namespace='/lobby')

    def to_json(self):
        return {
            'id': self.room_id,
            'title': self.title,
            'status': self.status,
            'joinedUsers': self.joined_users,
            'total': self.total
        }

    def ready(self, username):
        if username in self.ready_status:
            self.ready_status[username] = 1
        emit('update-ready-status', self.ready_status)


    def unready(self, username):
        if username in self.ready_status:
            self.ready_status[username] = 0
        emit('update-ready-status', self.ready_status)


    def start_game(self):
        self.current_round = 1
        self.count_turns = {}
        self.point_status = {}
        for user in self.joined_users:
            self.count_turns[user] = 0
            self.point_status[user] = 0
        self.turn = self.next_turn()
        emit('start-game', to=self.room_id)

    def end_game(self):
        emit('end-game', to=self.room_id)

    def guess(self, username, word):
        if word == self.current_answer:
            self.point_status[username] += 1
            emit('answer-correct', {'winner': username, 'pointStatus': self.point_status}, to=self.room_id)
            self.next_turn()        

    def next_turn(self):
        candidates = [user for user in self.joined_users if self.count_turns[user] < self.current_round]
        self.current_player = random.sample(candidates, k=1)
        self.current_answer = random.sample(self.answers, k=1)
        self.count_turns[next_player] += 1
        emit('next-turn', {'nextTurn': next_player}, to=self.room_id)
        return self.current_player, self.current_answer

        