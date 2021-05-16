from flask_socketio import emit
from event_handler import socketio
from app import lobby

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
    

