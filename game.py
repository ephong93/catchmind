from flask_socketio import emit

class Lobby:
    def __init__(self):
        self.rooms = {}
        self.next_id = 0

    def create_room(self, title, username):
        room_id = self.next_id
        self.rooms[room_id] = {
            'id': room_id,
            'title': title,
            'status': 'waiting',
            'total': 8,
            'joinedUsers': []
        }
        self.next_id += 1

        room = self.rooms[room_id]
        room['joinedUsers'].append(username)

        # send data
        emit('enter-room', { 'success': True, 'roomId': room_id}, namespace='/lobby')
        emit('update-room-list', self.get_room_list(), broadcast=True, namespace='/lobby')
        emit('update-room', room, broadcast=True, namespace='/room')


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

    def enter_room(self, username, room_id):
        room = self.get_room(room_id)
    
        if len(room['joinedUsers']) < room['total']:
            room['joinedUsers'].append(username)

            emit('enter-room', { 'success': True, 'roomId': room_id }, namespace='/lobby')
            emit('update-room-list', self.get_room_list(), broadcast=True, namespace='/lobby')




class Room:
    def __init__(self, room_id, title, total=8, joined_users=[]):
        self.room_id = room_id
        self.title = title
        self.status = 'waiting'
        self.total = total
        self.joined_users = joined_users
        self.drawing_user = None
        
    def start(self):
        pass
    
    def end(self):
        pass

    def turn(self):
        pass

    def answer(self):
        pass

    



    

        