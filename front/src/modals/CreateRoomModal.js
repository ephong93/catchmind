import { Modal, Form, Input } from 'antd';
import { useState } from 'react';

function CreateRoomModal(props) {
    const [ roomTitle, setRoomTitle ] = useState('');
    const [ form ] = Form.useForm();

    const createRoom = () => {
        if (props.socket) {
            props.socket.emit('create-room', { title: roomTitle, username: props.userName });
            close();
        }
    }

    const handleChange = values => {
        const { title } = values;
        setRoomTitle(title);
    }

    const close = () => {
        /*
        form.setFieldsValue({
            'title': ''
        });
        */
        props.setIsVisible(false);
    }

    return (
        <Modal 
            title='Create Room'
            visible={props.visible}
            onOk={createRoom}
            onCancel={close}>
            <Form
                form={form}
                layout='vertical'
                onValuesChange={handleChange}
            >
                <Form.Item name='title' label='Room title'>
                    <Input></Input>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default CreateRoomModal;