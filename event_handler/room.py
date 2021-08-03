from flask_socketio import emit, join_room, leave_room
from flask import request
from event_handler import socketio
from game import lobby, Room

@socketio.on('draw', namespace='/room')
def handle_event(data):
    # read data
    room_id = int(data['room_id'])
    # send data
    emit('draw', data, to=room_id, include_self=False)

@socketio.on('connect', namespace='/room')
def handle_connect():
    print('connected!', request.sid)

@socketio.on('disconnect', namespace='/room')
def handle_disconnect():
    if request.sid not in Room.session_table:
        return
    room_id = Room.session_table[request.sid]
    room = lobby.get_room(room_id)
    print('disconnected!', request.sid)
    room.leave_room(request.sid)

@socketio.on('update-room', namespace='/room')
def handle_update_in_room(data):
    # read data
    room_id = int(data['room_id'])
    room = lobby.get_room(room_id)
    # send data
    emit('update-room', room, to=room_id, include_self=True)

@socketio.on('enter-room', namespace='/room')
def handle_enter_room(data):
    # read dataw
    username = data['username']
    room_id = int(data['room_id'])
    room = lobby.get_room(room_id)
    room.enter_room(username, request.sid)

@socketio.on('leave-room', namespace='/room')
def handle_leave_room(data):
    print('leave room!')
    # read data
    room_id = int(data['room_id'])
    username = data['username']
    room = lobby.get_room(room_id)
    room.leave_room(request.sid)

@socketio.on('send-image', namespace='/room')
def handle_send_image_in_room(data):
    # read data
    send_to = data['send_to']
    room_id = data['room_id']
    image = data['imageDataURL']
    room = lobby.get_room(room_id)
    messages = room.get_messages()

    # send data
    emit('synchronize-image', {'imageDataURL': image, 'sendTo': send_to}, to=room_id, include_self=False)

    
@socketio.on('send-message', namespace='/room')
def handle_send_message(data):
    session_id = request.sid
    room_id = Room.session_table[session_id]
    room = lobby.get_room(room_id)
    room.put_message(data['sender'], data['message'])
    emit('send-message', {'sender': data['sender'], 'message': data['message']}, to=room_id, include_self=False)


@socketio.on('synchronize-messages', namespace='/room')
def handle_synchronize_messages(data):
    session_id = request.sid
    room_id = Room.session_table[session_id]
    room = lobby.get_room(room_id)
    username = data['username']
    emit('synchronize-messages', {'messages': room.messages, 'sendTo': username}, to=room_id, include_self=True)

@socketio.on('synchronize-image', namespace='/room')
def handle_synchronize_image(data):
    session_id = request.sid
    room_id = Room.session_table[session_id]
    room = lobby.get_room(room_id)
    username = data['username']
    if len(room.joined_users) == 1:
        emit('synchronize-image', {'imageDataURL': None, 'sendTo': username}, to=room_id, include_self=True)
    for joined_user_session_id in room.joined_users:
        joined_user = room.joined_users[joined_user_session_id]
        if joined_user != username:
            break
    emit('request-image', {'userRequested': username, 'requestedTo': joined_user}, to=room_id, include_self=False)