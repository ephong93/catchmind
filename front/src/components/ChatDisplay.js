import { List, Input, Avatar, Comment } from 'antd';
import { useEffect, useState, useRef } from 'react';

const { Search } = Input;


function ChatDisplay(props) {
    const [ inputText, setInputText ] = useState('');
    const [ chatList, setChatList ] = useState([]);
    const messagesEndRef = useRef(null);
    const chatListRef = useRef(null);

    const scrollToBottom = () => {
        const chatList = chatListRef.current;
        const scrollHeight = chatList.scrollHeight;
        const height = chatList.clientHeight;
        const maxScrollTop = scrollHeight - height;
        console.log(height, maxScrollTop, chatList.scrollTop);
        chatList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
        //console.log(maxScrollTop, chatList.scrollTop);
        // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth'})
    }

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
        updateMessage(props.userName, inputText);
        setInputText('');
    }

    const handleSendMessage = (data) => {
        const { sender, message } = data;
        updateMessage(sender, message);
    }

    const updateMessage = (userName, message) => {
        setChatList(prevChatList => [...prevChatList, {'userName': userName, 'message': message}]);
    }

    useEffect(() => {
        scrollToBottom();
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
    }, [props.socket, chatList]);

    return <>
        <div
            style={{
                height: '200px',
                overflow: 'scroll',
                backgroundColor: 'white'
            }}
            ref={chatListRef}
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
            <div ref={messagesEndRef} />
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