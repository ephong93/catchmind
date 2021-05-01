import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';

function WelcomePage(props) {
    const [ inputUserName, setInputUserName ] = useState('');

    console.log(props);
    return  <>
                <h1 style={{ marginTop: '130px'}}>Enter your name</h1>
                <Form style={{ width: 300, margin: 'auto'}} layout="inline">
                    <Form.Item style={{ width: '70%', margin: 'auto'}}>
                        <Input value={inputUserName} onChange={e => setInputUserName(e.target.value)}></Input>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={() => {
                            props.logIn(inputUserName);
                        }}>Go</Button>
                    </Form.Item>
                </Form>
            </>
}

export default WelcomePage;