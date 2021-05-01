import { Layout, Row, Col } from 'antd';
import { Canvas } from 'components';

const { Header, Content } = Layout;

function RoomPage(props) {
    return (
        <Layout>
            <Header></Header>
            <Content>
                <Row style={{width: '1200px', margin: '120px auto'}}>
                    <Col span={5}>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', borderRadius: '2px'}}>
                            <div style={{width: '90%', height: '20%', borderRadius: '2px', margin: 'auto', boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', backgroundColor: 'white'}}>
                                abc
                            </div>
                            <div style={{width: '90%', height: '20%', borderRadius: '2px', margin: 'auto', boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', backgroundColor: 'white'}}>
                                abc
                            </div>
                            <div style={{width: '90%', height: '20%', borderRadius: '2px', margin: 'auto', boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', backgroundColor: 'white'}}>
                                abc
                            </div>
                            <div style={{width: '90%', height: '20%', borderRadius: '2px', margin: 'auto', boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', backgroundColor: 'white'}}>
                                abc
                            </div>
                        </div>
                    </Col>
                    <Col span={14} style={{borderRadius: '10px', boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.2)'}}>
                        <Canvas></Canvas>
                    </Col>
                    <Col span={5}>
                        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', borderRadius: '2px'}}>
                            <div style={{width: '90%', height: '20%', borderRadius: '2px', margin: 'auto', boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', backgroundColor: 'white'}}>
                                abc
                            </div>
                            <div style={{width: '90%', height: '20%', borderRadius: '2px', margin: 'auto', boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', backgroundColor: 'white'}}>
                                abc
                            </div>
                            <div style={{width: '90%', height: '20%', borderRadius: '2px', margin: 'auto', boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', backgroundColor: 'white'}}>
                                abc
                            </div>
                            <div style={{width: '90%', height: '20%', borderRadius: '2px', margin: 'auto', boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', backgroundColor: 'white'}}>
                                abc
                            </div>
                        </div>
                    </Col>
                </Row>
            </Content>
        </Layout>
    )
}

export default RoomPage;