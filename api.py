from flask import Blueprint
from flask import request, session
from app import room_list


bp = Blueprint('api', __name__, '/api')


@bp.route('/api/user', methods=['GET', 'POST', 'DELETE'])
def user():
    if request.method == 'GET':
        if 'username' in session:
            return {
                'success': True,
                'username': session['username']
            }
        else:
            return {
                'success': False,
                'message': 'Not registered'
            }
    elif request.method == 'POST':
        data = request.get_json()
        username = data['username']
        session['username'] = username
        print(session)
        return {
            'success': True,
            'username': username
        }
    elif request.method == 'DELETE':
        session.pop('username', None)
        return {
            'success': True,
            'message': 'logout succeess'
        }


@bp.route('/api/room', methods=['POST'])
@bp.route('/api/room/<room_id>', methods=['GET'])
def room(room_id=None):
    if request.method == 'GET':
        if room_id == 'ALL':
            rooms = room_list.get_room_list()
            return {
                'success': True,
                'roomList': rooms
            }
        else:
            # Join the room
            if 'username' not in session:
                print(session)
                return {
                    'success': False,
                    'message': 'Not logged in'
                }
            username = session['username']
            room_id = int(room_id)
            room = room_list.get_room(room_id)
            if username not in room['joinedUsers']:
                room['joinedUsers'].append(username)
            if room is not None:
                return {
                    'success': True,
                    'room': room
                }
            else:
                return {
                    'success': False,
                    'message': 'Room not exist'
                }
    elif request.method == 'POST':
        data = request.get_json()
        title = data['title']
        room = room_list.create_room(title)
        print(room_list.rooms)
        return {
            'success': True,
            'room': room
        }
