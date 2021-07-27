from flask_socketio import emit
from event_handler import socketio
from game import lobby

@socketio.on('connect', namespace='/lobby')
def handle_connect_in_lobby():
    emit('update-room-list', lobby.get_room_list(), broadcast=True, namespace='/lobby')
    

@socketio.on('create-room', namespace='/lobby')
def handle_create_room_in_lobby(data):
    title = data['title']
    username = data['username']

    lobby.create_room(title, username)

@socketio.on('enter-room', namespace='/lobby')
def handle_enter_room_in_lobby(data):
    room_id = data['room_id']
    username = data['username']

    lobby.enter_room(username, room_id)

@socketio.on('check-if-enterable', namespace='/lobby')
def handle_check_if_enterable(data):
    # read data
    username = data['username']
    room_id = int(data['room_id'])
    room = lobby.get_room(room_id)
    is_enterable = room.check_if_enterable()
    emit('check-if-enterable', { 'success': is_enterable, 'roomId': room_id }, namespace='/lobby')
    

