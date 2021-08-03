import { Layout, Row, Col, Button, Input } from 'antd';
import { Canvas, UserDisplay, ChatDisplay } from 'components';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const { Header, Content } = Layout;


function RoomPage(props) {
    const [ socket, setSocket ] = useState(null);
    const [ room, setRoom ] = useState(null);

    const sendMessage = (message) => {
        if (message === '') return;
        if (socket) {
            socket.emit('send-message', {
                'sender': props.userName,
                'message': message
            });
        }
    }

    const synchronizeMessages = () => {
        if (socket) {
            socket.emit('synchronize-messages', {'username': props.userName});
        }
    }

    const synchronizeImage = () => {
        if (socket) {
            socket.emit('synchronize-image', {'username': props.userName});
        }
    }

    const sendLine = data => {
        if (socket) {
            socket.emit('draw', data);
        }
    }

    const sendImage = (userRequested, dataURL) => {
        socket.emit('send-image', {'send_to': userRequested, 'imageDataURL': dataURL, 'room_id': room.id});
    }

    const addSocketListener = (event, action) => {
        if (socket) {
            socket.on(event, action);
        }
    }

    const removeSocketListener = (event) => {
        if (socket) {
            socket.off(event);
        }
    }

    const initSocket = () => {
        const { roomId } = props.match.params;
        const socket = io('ws://127.0.0.1:5000/room', { transports: ["websocket"] });

        socket.on('connect', () => {
            socket.emit('enter-room', {
                'room_id': roomId,
                'username': props.userName
            });
            console.log('Connected!');
            }
        )
        
        socket.on('enter-room', data => {
            if (!data.success) {
                props.history.push('/lobby');
            } else {

            }
        });

        socket.on('update-room', room => {
            setRoom(room);
        });
        return socket;
    }

    useEffect(() => {
        const { roomId } = props.match.params;

        const socket = initSocket();
        setSocket(socket);

        return () => {
            if (socket) {
                socket.emit('leave-room', {
                    'room_id': roomId,
                    'username': props.userName
                });
                socket.disconnect();
                setSocket(null);
            }
        }
    }, []);
    

    return (
        <Layout>
            <Header style={{
                background: 'white'
            }}>
                <span>Hi, {props.userName}!</span> 
                <Button 
                    type='link' 
                    onClick={() => {
                        props.logOut();
                    }}
                >Logout</Button>
                <Button
                    type='primary'
                    onClick={() => {
                        props.history.push('/lobby');
                    }}
                >Leave room</Button>
            </Header>
            { socket && room ? 
                <Content>
                    <Row style={{width: '1200px', margin: '120px auto'}}>
                        <Col span={5}>
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', borderRadius: '2px'}}>
                                {
                                    room && 
                                    room.joinedUsers.slice(0, 4).map((user, index) => 
                                        <UserDisplay key={index} user={user} me={props.userName === user} socket={socket}></UserDisplay>
                                    )
                                }
                            </div>
                        </Col>
                        <Col span={14}>                        
                            <Canvas sendImage={sendImage} synchronizeImage={synchronizeImage} sendLine={sendLine} userName={props.userName} room={room} addSocketListener={addSocketListener}></Canvas>
                            <ChatDisplay synchronizeMessages={synchronizeMessages} sendMessage={sendMessage} removeSocketListener={removeSocketListener} addSocketListener={addSocketListener} userName={props.userName}></ChatDisplay>
                        </Col>
                        <Col span={5}>
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', borderRadius: '2px'}}>
                                {
                                    room && 
                                    room.joinedUsers.slice(4, 8).map((user, index) => 
                                        <UserDisplay key={index} user={user} me={props.userName === user} socket={socket}></UserDisplay>
                                    )
                                }
                            </div>
                        </Col>
                    </Row>
                </Content>
                :
                null
            }
        </Layout>
    )
}

export default RoomPage;