import { List, Input } from 'antd';
import { useState } from 'react';

const data = [
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'cccccccccccccccccccccccccccccc',
    'ddddddddddddddddddddddddddddddd',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'cccccccccccccccccccccccccccccc',
    'ddddddddddddddddddddddddddddddd',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'cccccccccccccccccccccccccccccc',
    'ddddddddddddddddddddddddddddddd',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    'cccccccccccccccccccccccccccccc',
    'ddddddddddddddddddddddddddddddd'
]

function ChatDisplay(props) {
    const [ inputText, setInputText ] = useState('');
    const [ chatList, setChatList ] = useState(data);

    const handleChange = e => {
        console.log(e.value);
    }
    const handleKeyDown = e => {
        if (e.code === 'Enter') {
            console.log(chatList.concat([inputText]));
            //setChatList(chatList.concat([inputText]));
            setInputText('');
        }
    }
    return <>
        <div
            style={{
                height: '200px',
                overflow: 'scroll',
                backgroundColor: 'white'
            }}
        >
            <List
                bordered
                dataSource={chatList}
                renderItem={item => (<List.Item>
                    {item}
                </List.Item>)}
            >

            </List>
        </div>
        <Input
            onChange={handleChange}
            onKeyDown={handleKeyDown}
        ></Input>
    </>
}

export default ChatDisplay;