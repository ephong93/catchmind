import React, { useEffect, useRef, useState } from "react";

function Canvas(props) {
    const canvasRef = useRef(null);
    const [ isDrawing, setIsDrawing ] = useState(false);
    

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    const handleMouseDown = e => {
        setIsDrawing(true);
    }

    const handleMouseUp = e => {
        setIsDrawing(false);
    }

    const handleMouseMove = e => {
        if (!isDrawing) return;
        const mouseX = e.clientX - canvasRef.current.offsetLeft;
        const mouseY = e.clientY - canvasRef.current.offsetTop;
        console.log(mouseX, mouseY);
    }

    return <canvas height={500} width={700} ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
    ></canvas>
}

export default Canvas;