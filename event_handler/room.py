from flask_socketio import emit, join_room, leave_room
from event_handler import socketio
from app import room_list

@socketio.on('enter-room', namespace='/room')
def handle_enter_room(data):
    username = data['username']
    room_id = int(data['room_id'])
    join_room(room_id)
    room = room_list.get_room(room_id)
    emit('update-room', room, to=room_id, include_self=True)

    if len(room['joinedUsers']) > 1:
        for joined_user in room['joinedUsers']:
            if joined_user != username:
                break
        emit('request-image', {'userRequested': username, 'requestedTo': joined_user}, to=room_id, include_self=False)


@socketio.on('send-image', namespace='/room')
def handle_send_image_in_room(data):
    send_to = data['send_to']
    room_id = data['room_id']
    image = data['imageDataURL']
    emit('send-image', {'imageDataURL': image, 'sendTo': send_to}, to=room_id, include_self=False)


@socketio.on('update-room', namespace='/room')
def handle_update_in_room(data):
    room_id = int(data['room_id'])
    room = room_list.get_room(room_id)
    print('update-room', room)
    emit('update-room', room, to=room_id, include_self=True)


@socketio.on('start-drawing', namespace='/room')
def handle_start_drawing_event(data):
    print('start-drawing', data)
    room_id = int(data['room_id'])
    emit('start-drawing', data, to=room_id, include_self=False)

@socketio.on('data-drawing', namespace='/room')
def handle_event(data):
    print(data)
    room_id = int(data['room_id'])
    emit('data-drawing', data, to=room_id, include_self=False)

@socketio.on('end-drawing', namespace='/room')
def handle_end_drawing_event(data):
    username = data['username']
    room_id = int(data['room_id'])
    emit('end-drawing', data, to=room_id, include_self=False)


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
    leave_room(room_id)
    emit('update-room', room, to=room_id)
    emit('update-room-list', room_list.get_room_list(), broadcast=True, namespace='/lobby')