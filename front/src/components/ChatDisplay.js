import { List, Input, Avatar, Comment } from 'antd';
import { useEffect, useState, useRef } from 'react';
import './ChatDisplay.css';
const { Search } = Input;


function ChatDisplay(props) {
    const [ inputText, setInputText ] = useState('');
    const [ chatList, setChatList ] = useState([]);
    const chatListRef = useRef(null);

    const scrollToBottom = () => {
        const chatList = chatListRef.current;
        const scrollHeight = chatList.scrollHeight;
        const height = chatList.clientHeight;
        const maxScrollTop = scrollHeight - height;
        chatList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }

    const handleChange = e => {
        setInputText(e.target.value);
    }

    const sendMessage = () => {
        if (inputText === '') return;
        const socket = props.socket;
        if (socket) {
            socket.emit('send-message', {
                'sender': props.userName,
                'message': inputText
            });
        }
        updateMessage(props.userName, inputText);
        setInputText('');
    }

    const handleReceiveMessage = (data) => {
        const { sender, message } = data;
        updateMessage(sender, message);
    }

    const handleSyncrhonizeMessages = (data) => {
        console.log('syncrhonize message');
        const { messages, sendTo } = data;
        console.log(sendTo,  props.userName);
        if (sendTo !== props.userName) return;
        const chatList = [];
        console.log(messages);
        for (let message of messages) {
            chatList.push({'userName': message[0], 'message': message[1]});
        }
        console.log(chatList);
        setChatList(chatList);
    }

    const updateMessage = (userName, message) => {
        setChatList(prevChatList => [...prevChatList, {'userName': userName, 'message': message}]);
    }

    useEffect(() => {
        scrollToBottom();
        const socket = props.socket;
        if (socket) {
            console.log('socket add listener');
            socket.on('send-message', handleReceiveMessage);
            socket.on('synchronize-messages', handleSyncrhonizeMessages);
        }
        return () => {
            if (socket) {
                socket.off('send-message', handleReceiveMessage);
            }
        }
    }, [props.socket]);

    useEffect(() => {
        scrollToBottom();
    }, [chatList]);

    return <>
        <div
            ref={chatListRef}
            className='chatListContainer'
        >
            <List
                dataSource={chatList}
                renderItem={item => (
                    <li
                        style={{
                            border: '1px solid #eee',
                            borderTop: 'none'
                        }}
                    >
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
            enterButton="Send"
            onSearch={sendMessage}
            value={inputText}
        ></Search>
    </>
}

export default ChatDisplay;