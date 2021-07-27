import { Layout, Row, Col, Button, Input } from 'antd';
import { Canvas, UserDisplay, ChatDisplay } from 'components';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const { Header, Content } = Layout;


function RoomPage(props) {
    const [ socket, setSocket ] = useState(null);
    const [ room, setRoom ] = useState(null);

    const cleanup = (roomId) => {
        window.removeEventListener('beforeunload', cleanup);

        console.log('cleanup!');
        if (socket) {
            socket.emit('leave-room', {
                'room_id': roomId,
                'username': props.userName
            });
            socket.disconnect();
            setSocket(null);
        }
    }

    useEffect(() => {
        console.log('roompage useeffect');
        const { roomId } = props.match.params;

        const socket = io('ws://127.0.0.1:5000/room', { transports: ["websocket"] });
        setSocket(socket);

        socket.on('connect', () => {
            socket.emit('enter-room', {
                'room_id': roomId,
                'username': props.userName
            });
            console.log('Connected!');
        });

        socket.on('enter-room', data => {
            if (!data.success) {
                props.history.push('/lobby');
            }
        })

        socket.on('disconnect', () => {
            console.log('Disconnected!');
        });

        socket.on('update-room', room => {
            console.log('update-room!', room);
            setRoom(room);
        });
        
        window.addEventListener('beforeunload', () => {
            socket.emit('leave-room', {
                'room_id': roomId,
                'username': props.userName
            });
        });

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
            <Content>
                <Row style={{width: '1200px', margin: '120px auto'}}>
                    <Col span={5}>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', borderRadius: '2px'}}>
                            {
                                room && 
                                room.joinedUsers.slice(0, 4).map((user, index) => 
                                    <UserDisplay key={index} user={user}></UserDisplay>
                                )
                            }
                        </div>
                    </Col>
                    <Col span={14}>                        
                        <Canvas userName={props.userName} room={room} socket={socket} ></Canvas>
                        <ChatDisplay></ChatDisplay>
                    </Col>
                    <Col span={5}>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', borderRadius: '2px'}}>
                            {
                                room && 
                                room.joinedUsers.slice(4, 8).map((user, index) => 
                                    <UserDisplay key={index} user={user}></UserDisplay>
                                )
                            }
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    )
}

export default RoomPage;