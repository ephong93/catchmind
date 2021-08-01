import { Layout, Table, Button, message } from 'antd';
import { useEffect, useState } from 'react';
import { CreateRoomModal } from 'modals';
import io from 'socket.io-client';

const { Header, Content } = Layout;

function LobbyPage(props) {
    const [ roomList, setRoomList ] = useState([]);
    const [ socket, setSocket ] = useState(null);
    const [ isCreateRoomModalVisible, setIsCreateRoomModalVisible ] = useState(false);


    const showMessage = (messageContent) => {
        message.info(messageContent);
    };

    useEffect(() => {
        const socket = io('ws://127.0.0.1:5000/lobby', { transports: ["websocket"] });
        setSocket(socket);

        socket.on('update-room-list', data => {
            setRoomList(data);
        });

        socket.on('check-if-enterable', data => {
            if (data.success) {
                const roomId = data.roomId;
                props.history.push(`/room/${roomId}`);
            } else if(data.message === 'full-room') {
                showMessage('Full room!');
            } else if (data.message === 'already-entered') {
                showMessage('Already in room!');
            }
        });

        return () => {
            socket.disconnect();
            setSocket(null);
        }

    }, []);

    const openCreateRoomModal = () => {
        setIsCreateRoomModalVisible(true);
    }

    const enterRoom = roomId => {
        console.log(roomId);
        socket.emit('check-if-enterable', { 'room_id': roomId, 'username': props.userName });
    }

    return (
        <>
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
                        onClick={openCreateRoomModal}
                    >Create room</Button>
                </Header>
                <Content>
                    <div style={{margin: '100px auto', width: '1200px'}}>
                        <Table
                            columns={[{
                                title: 'Title',
                                dataIndex: 'title',
                                key: 'title',
                            },{
                                title: 'Status',
                                dataIndex: 'status',
                                key: 'status',
                            },{
                                title: 'Users',
                                dataIndex: 'users',
                                key: 'users',
                                render: data => <span>{`${data.current}/${data.total}`}</span>
                            }]}
                            dataSource={
                                roomList && 
                                roomList.map(room => {
                                    return {
                                        key: room.id,
                                        title: room.title,
                                        status: room.status,
                                        users: {
                                            current: room.currentNumberOfUsers,
                                            total: room.total
                                        }
                                    }
                                })
                            }
                            onRow={(record, rowIndex) => {
                                return {
                                    onClick: () => {
                                        console.log(record);
                                        enterRoom(record.key);
                                    }
                                }
                            }}
                        >
                        </Table>
                    </div>
                </Content>
            </Layout>
            <CreateRoomModal 
                socket={socket}
                userName={props.userName}
                visible={isCreateRoomModalVisible}
                setIsVisible={setIsCreateRoomModalVisible}
            ></CreateRoomModal>
        </>
    );
}

export default LobbyPage;