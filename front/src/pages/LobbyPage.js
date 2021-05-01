import { Layout, Table } from 'antd';

const { Header, Content } = Layout;

function LobbyPage(props) {
    return (
        <Layout>
            <Header>
                {props.userName}
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
                            render: data => <span>{`${data.playing}/${data.maximum}`}</span>
                        }]}
                        dataSource={[{
                            key: '1',
                            title: 'room A',
                            status: 'waiting',
                            users: {
                                playing: 3,
                                maximum: 8
                            }
                        }]}
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