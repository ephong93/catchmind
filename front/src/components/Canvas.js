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
        setIsDrawing(false);

        const { socket } = props;
        socket.emit('end-drawing', {'username': props.userName, 'room_id': props.room.id});
    }

    const handleMouseDown = e => {
        const point = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
        setIsDrawing(true);
        setPrevPoint(point);
        draw([point], penWidth, color);

        const { socket } = props;
        socket.emit('start-drawing', {
            username: props.userName,
            'room_id': props.room.id,
            point: point
        });
    }

    const handleMouseMove = e => {
        if (!isDrawing) return;
        const { userName } = props;

        const currentTime = Date.now();
        const timeGap = currentTime - startTime;
        if (timeGap > 10) {
            const currentPoint = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
            draw([prevPoint, currentPoint], penWidth, color);
            setPrevPoint(currentPoint);
            setStartTime(currentTime);
            send({
                sender: userName,
                'room_id': props.room.id,
                data: [currentPoint, penWidth, color]
                
            });
        }
    }

    const handleWheel = e => {
        const deltaY = parseInt(-1 * e.deltaY / 100);
        setPenWidth(Math.max(3, Math.min(20, penWidth+deltaY)));
    }

    const send = data => {
        const { socket } = props;
        socket.emit('data-drawing', data);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const { socket } = props;
        if (socket) {
            socket.on('data-drawing', res => { // TODO: send dot -> send line
                const { sender, data } = res;
                const point = data[0];
                const penWith = data[1];
                const color = data[2];
                if (sender === props.userName) return;
                if (!playersAreDrawing.has(sender)) {
                    const point = data[0];
                    playersAreDrawing.set(props.userName, point);
                    return;
                }
                const prevPoint = playersAreDrawing.get(sender);

                draw([prevPoint, point], penWidth, color);

                playersAreDrawing.set(sender, point);
            });

            socket.on('start-drawing', res => {
                const userName = res.username;
                const point = res.point;
                if (props.userName === userName) return;

                console.log('start-drawing', userName, point);

                playersAreDrawing.set(userName, point);
            });

            socket.on('end-drawing', res => {
                const userName = res.username;
                if (props.userName === userName) return;

                if (playersAreDrawing.has(userName)) {
                    playersAreDrawing.delete(userName);
                }
            });

            socket.on('send-image', res => {
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
            else {
                const { socket, room } = props;
                socket.on('request-image', res => {
                    const { userRequested, requestedTo } = res;

                    const canvas = canvasRef.current;

                    if (props.userName === requestedTo) {
                        socket.emit('send-image', {'send_to': userRequested, imageDataURL: canvas.toDataURL(), room_id: room.id});
                    }
                });
            }
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