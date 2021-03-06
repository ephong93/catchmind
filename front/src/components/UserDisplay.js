import { useState } from 'react';
import { Typography, Avatar, Button } from 'antd';
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
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
            }}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        width: '90%',
                        height: '90%'
                    }}>
                        {
                            props.user ?
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexBasis: '100%'
                                }}
                            >
                                <Avatar size='large' icon={<UserOutlined />} />
                                <div
                                    style={{
                                        display: 'inline-block',
                                        margin: '0 10px 0 10px',
                                        fontSize: 'large'
                                    }}
                                >{props.user}</div>
                            </div>
                            :
                            <div
                                style={{
                                    backgroundColor: '#eee',
                                    flexBasis: '100%',
                                    height: '100%',
                                    borderRadius: '3px'
                                }}
                            >
                            </div>
                        }
                </div>
    </div>
}

export default UserDisplay;