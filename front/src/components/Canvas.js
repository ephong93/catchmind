import { useEffect, useRef, useState } from "react";
import { ColorIconList } from 'components';
import { Slider, Row, Col } from 'antd';

function Canvas(props) {
    const canvasRef = useRef(null);
    let isDrawing = false;
    let startTime = 0;
    let prevPoint = null;
    let playersAreDrawing = new Map();

    const [ color, setColor ] = useState('black');
    const [ penWidth, setPenWidth ] = useState(10);
    const [ isSynchronized, setIsSynchronized ] = useState(false);

    const setIsDrawing = v => { isDrawing = v; }
    const setStartTime = v => { startTime = v; }
    const setPrevPoint = v => { prevPoint = v; }

    const handleMouseUp = () => {
        if (!isSynchronized) return;
        setIsDrawing(false);

        const { socket } = props;
        socket.emit('end-drawing', {'username': props.userName, 'room_id': props.room.id});
    }

    const handleMouseDown = e => {
        if (!isSynchronized) return;
        const point = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
        setIsDrawing(true);
        setPrevPoint(point);
        draw([point, point], penWidth, color);
        send({
            sender: props.userName,
            'room_id': props.room.id,
            data: [[point, point], penWidth, color]
        });
    }

    const handleMouseMove = e => {
        if (!isSynchronized) return;
        if (!isDrawing) return;
        const { userName } = props;

        const currentTime = Date.now();
        const timeGap = currentTime - startTime;
        if (timeGap > 10) {
            const currentPoint = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
            const line = [prevPoint, currentPoint].slice();
            draw(line, penWidth, color);
            setPrevPoint(currentPoint);
            setStartTime(currentTime);
            send({
                sender: userName,
                'room_id': props.room.id,
                data: [line, penWidth, color]
            });
        }
    }

    const handleWheel = e => {
        const deltaY = parseInt(-1 * e.deltaY / 100);
        setPenWidth(Math.max(3, Math.min(20, penWidth+deltaY)));
    }

    const send = data => {
        const { socket } = props;
        socket.emit('draw', data);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const { socket } = props;
        if (socket) {
            socket.on('draw', res => { // TODO: send dot -> send line
                const { sender, data } = res;
                const line = data[0];
                const penWidth = data[1];
                const color = data[2];
                if (sender === props.userName) return;
                draw(line, penWidth, color);
            });

            socket.on('send-image', res => {
                console.log('send-image');
                const { sendTo, imageDataURL } = res;
                if (sendTo === props.userName) {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    const img = new Image;
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0);
                    };
                    img.src = imageDataURL
                    setIsSynchronized(true);
                }
            });
        }

    }, [props.socket]);

    useEffect(() => {
        if (props.room) {
            if (props.room.joinedUsers.length === 1) setIsSynchronized(true);
            
            const { socket, room } = props;
            socket.on('request-image', res => {
                console.log('request-iamge');
                const { userRequested, requestedTo } = res;

                const canvas = canvasRef.current;

                if (props.userName === requestedTo) {
                    socket.emit('send-image', {'send_to': userRequested, imageDataURL: canvas.toDataURL(), room_id: room.id});
                }
            });
        }
    }, [props.room]);


    const draw = (line, penWidth, color) => {
        console.log(line, penWidth, color);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.lineWidth = penWidth;
        ctx.lineJoin = 'round';


        if (line.length === 1) {
            const point = line[0];
            ctx.beginPath();
            ctx.arc(point[0], point[1], 5, 0, 2*Math.PI);
            ctx.fill();
        } else {
            ctx.beginPath();
            let prevPoint = line[0];
            for (let i = 1; i < line.length; i++) {
                let nextPoint = line[i];
                console.log('prev', prevPoint, 'next', nextPoint);
                ctx.moveTo(prevPoint[0], prevPoint[1]);
                ctx.lineTo(nextPoint[0], nextPoint[1]);
                prevPoint = nextPoint;
            }
            ctx.stroke();
        }
    }

    return <div 
            style={{
                width: '700px',
                height: '600px'
            }}
            onWheel={handleWheel}
            >
        <canvas height={500} width={600} ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
        ></canvas>
        <Row>
            <Col span={14}>
                <ColorIconList colors={['black', 'blue', 'yellow', 'green', 'red']} selectedColor={color} selectColor={setColor}></ColorIconList>
            </Col>
            <Col span={1}>
                {penWidth}
            </Col>
            <Col span={6}>
                <Slider min={3} max={20} step={1} defaultValue={10} value={penWidth} onChange={value => setPenWidth(value)}></Slider>
            </Col>
        </Row>
        </div>
}

export default Canvas;