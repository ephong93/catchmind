import React, { useEffect, useRef, useState } from "react";


function Canvas(props) {
    const canvasRef = useRef(null);
    let isDrawing = false;
    let startTime = 0;
    let prevPoint = null;
    let playersAreDrawing = new Map();

    const setIsDrawing = v => { isDrawing = v; }
    const setStartTime = v => { startTime = v; }
    const setPrevPoint = v => { prevPoint = v; }

    const handleMouseUp = () => {
        setIsDrawing(false);

        const { socket } = props;
        socket.emit('end-drawing', props.userName);
    }

    const handleMouseDown = e => {
        const point = [e.nativeEvent.offsetX, e.nativeEvent.offsetY];
        setIsDrawing(true);
        setPrevPoint(point);
        draw(point);

        const { socket } = props;
        socket.emit('start-drawing', {
            username: props.userName,
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
            draw([prevPoint, currentPoint]);
            setPrevPoint(currentPoint);
            setStartTime(currentTime);
            send({
                sender: userName,
                data: currentPoint
            });
        }
    }

    const send = data => {
        const { socket } = props;
        socket.emit('data', data);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        const { socket } = props;
        if (socket) {
            socket.on('broadcast-data', res => {
                const { sender, data } = res;
                if (sender === props.userName) return;
                if (!playersAreDrawing.has(sender)) return;
                const prevPoint = playersAreDrawing.get(sender);
                const point = data;

                draw([prevPoint, point]);

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
                const userName = res;
                if (props.userName === userName) return;

                if (playersAreDrawing.has(userName)) {
                    playersAreDrawing.delete(userName);
                }
            });
        }

    }, [props.socket]);


    const draw = line => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'black';
        ctx.lineCap = 'round';
        ctx.lineWidth = 10;
        ctx.lineJoin = 'round';

        console.log(line);

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
                ctx.moveTo(prevPoint[0], prevPoint[1]);
                ctx.lineTo(nextPoint[0], nextPoint[1]);
                prevPoint = nextPoint;
            }
            ctx.stroke();
        }
    }

    return <canvas height={500} width={700} ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
    ></canvas>
}

export default Canvas;