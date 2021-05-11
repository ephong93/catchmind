from flask_socketio import emit
from event_handler import socketio
from app import lobby

@socketio.on('connect', namespace='/lobby')
def handle_connect_in_lobby():
    emit('update-room-list', lobby.get_room_list(), broadcast=True, namespace='/lobby')

@socketio.on('create-room', namespace='/lobby')
def handle_create_room_in_lobby(data):
    print(data)
    title = data['title']
    username = data['username']
    room = lobby.create_room(title)
    room['joinedUsers'].append(username)
    room_id = room['id']
    emit('enter-room', { 'success': True, 'roomId': room_id}, namespace='/lobby')
    emit('update-room-list', lobby.get_room_list(), broadcast=True, namespace='/lobby')
    emit('update-room', room, broadcast=True, namespace='/room')

@socketio.on('enter-room', namespace='/lobby')
def handle_enter_room_in_lobby(data):
    room_id = data['room_id']
    username = data['username']
    room = lobby.get_room(room_id)
    if len(room['joinedUsers']) < room['total']:
        room['joinedUsers'].append(username)
        emit('enter-room', { 'success': True, 'roomId': room_id }, namespace='/lobby')
        emit('update-room-list', lobby.get_room_list(), broadcast=True, namespace='/lobby')
        #emit('update-room', room, broadcast=True, namespace='/room')


