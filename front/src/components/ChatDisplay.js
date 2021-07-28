import { List, Input, Avatar, Comment } from 'antd';
import { useEffect, useState } from 'react';

const { Search } = Input;

const data = [
    {'userName': 'abc', 'message': 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa'},
]

function ChatDisplay(props) {
    const [ inputText, setInputText ] = useState('');
    const [ chatList, setChatList ] = useState(data);

    const handleChange = e => {
        setInputText(e.target.value);
    }

    const sendMessage = () => {
        const socket = props.socket;
        if (socket) {
            socket.emit('send-message', {
                'sender': props.userName,
                'message': inputText
            });
        }
        setChatList(prevChatList => [...prevChatList, {'userName': props.userName, 'message': inputText}]);
        setInputText('');
    }

    const handleSendMessage = (data) => {
        const { sender, message } = data;
        setChatList(prevChatList => [...prevChatList, {'userName': sender, 'message': message}]);
    }

    useEffect(() => {

        const socket = props.socket;
        if (socket) {
            console.log('socket add listener');
            socket.on('send-message', handleSendMessage);
        }
        return () => {
            if (socket) {
                socket.off('send-message', handleSendMessage);
            }
        }
    }, [props.socket]);

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
                renderItem={item => (
                    <li>
                        <Comment
                            author={item.userName}
                            avatar={
                                <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                            }
                            content={item.message}
                        />
                    </li>
                    
                )}
            >
            </List>
        </div>
        <Search
            onChange={handleChange}
            //onKeyDown={handleKeyDown}
            enterButton="Send"
            onSearch={sendMessage}
            value={inputText}
        ></Search>
    </>
}

export default ChatDisplay;