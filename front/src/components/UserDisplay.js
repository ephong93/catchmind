import { Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
const { Title } = Typography;

function UserDisplay(props) {
    return <div 
        style={{
            width: '90%', 
            height: '20%', 
            borderRadius: '2px', 
            margin: 'auto', 
            boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)', 
            backgroundColor: 'white',
            padding: '10px'}}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                    <Avatar size='large' icon={<UserOutlined />} />
                    <div
                        style={{
                            display: 'inline-block',
                            margin: '0 10px 0 10px',
                            fontSize: 'large'
                        }}
                    >{props.user}</div>
                </div>
    </div>
}

export default UserDisplay;