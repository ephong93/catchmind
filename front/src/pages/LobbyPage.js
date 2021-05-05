import { Layout, Table, Button } from 'antd';
import { useEffect, useState } from 'react';
import { axios } from 'myaxios';

const { Header, Content } = Layout;

function LobbyPage(props) {
    const [ roomList, setRoomList ] = useState([]);
    useEffect(() => {
        axios.get('http://localhost:5000/api/room/ALL').then(res => {
            const data = res.data;
            if (data.success) {
                setRoomList(data.roomList);
            }
        });
    }, []);

    const createRoom = () => {
        axios.post('http://localhost:5000/api/room', {
            title: 'A'
        }).then(res => {
            const data = res.data;
            if (data.success) {
                console.log('create room success');
            }
        });
    }

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
                    onClick={createRoom}
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
                                        current: room['joinedUsers'].length,
                                        total: room.total
                                    }
                                }
                            })
                        }
                        onRow={(record, rowIndex) => {
                            return {
                                onClick: () => {
                                    props.history.push(`/room/${record.key}`);
                                }
                            }
                        }}
                    >
                    </Table>
                </div>
            </Content>
        </Layout>
    );
}

export default LobbyPage;