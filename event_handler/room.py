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
    
    # send data
    emit('send-image', {'imageDataURL': image, 'sendTo': send_to}, to=room_id, include_self=False)


@socketio.on('request-answer', namespace='/room')
def handle_request_answer_in_room(data):
    room_id = data['room_id']
    user_requested = data['userRequested']

    room = lobby.get_room(room_id)
    if user_requested == room.current_player:
        emit('answer', room.current_answer)
    
