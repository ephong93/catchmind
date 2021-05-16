from flask_socketio import emit, join_room, leave_room
from event_handler import socketio
from app import lobby

@socketio.on('draw', namespace='/room')
def handle_event(data):
    # read data
    room_id = int(data['room_id'])
    # send data
    emit('draw', data, to=room_id, include_self=False)


@socketio.on('enter-room', namespace='/room')
def handle_enter_room(data):
    # read data
    username = data['username']
    room_id = int(data['room_id'])
    room = lobby.get_room(room_id)
    room.enter_room(username)


@socketio.on('update-room', namespace='/room')
def handle_update_in_room(data):
    # read data
    room_id = int(data['room_id'])
    room = lobby.get_room(room_id)
    # send data
    emit('update-room', room, to=room_id, include_self=True)


@socketio.on('leave-room', namespace='/room')
def handle_leave_room(data):
    # read data
    room_id = int(data['room_id'])
    username = data['username']
    room = lobby.get_room(room_id)
    joined_users = room['joinedUsers']

    # process
    joined_users.remove(username)
    if len(room['joinedUsers']) == 0:
        lobby.rooms.pop(room_id)
    leave_room(room_id)

    # send data
    emit('update-room', room, to=room_id)
    emit('update-room-list', lobby.get_room_list(), broadcast=True, namespace='/lobby')


@socketio.on('send-image', namespace='/room')
def handle_send_image_in_room(data):
    # read data
    send_to = data['send_to']
    room_id = data['room_id']
    image = data['imageDataURL']
    
    # send data
    emit('send-image', {'imageDataURL': image, 'sendTo': send_to}, to=room_id, include_self=False)




