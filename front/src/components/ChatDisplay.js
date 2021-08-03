import { List, Input, Avatar, Comment } from 'antd';
import { useEffect, useState, useRef } from 'react';
import './ChatDisplay.css';
const { Search } = Input;


function ChatDisplay(props) {
    const [ inputText, setInputText ] = useState('');
    const [ chatList, setChatList ] = useState([]);
    const [ isSynchronized, setIsSynchronized ] = useState(false);
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
        if (!isSynchronized) return;
        props.sendMessage(inputText);
        updateMessage(props.userName, inputText);
        setInputText('');
    }

    const updateMessage = (userName, message) => {
        setChatList(prevChatList => [...prevChatList, {'userName': userName, 'message': message}]);
    }

    useEffect(() => {
        scrollToBottom();

        props.addSocketListener('send-message', data => {
            const { sender, message } = data;
            updateMessage(sender, message);
        });

        props.addSocketListener('synchronize-messages', data => {
            const { messages, sendTo } = data;
            if (sendTo !== props.userName) return;
            const chatList = [];
            for (let message of messages) {
                chatList.push({'userName': message[0], 'message': message[1]});
            }
            setChatList(chatList);
            setIsSynchronized(true);
        });

        if (!isSynchronized)
            props.synchronizeMessages();
        
        return () => {
            props.removeSocketListener('send-message');
            props.removeSocketListener('synchronize-message');
        }
    }, []);

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