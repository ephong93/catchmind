import { io } from 'socket.io-client';

const getSocket = (function () {
    this.socket = null;

    return () => {
        if (this.socket) return this.socket;
        else {
            this.socket = io('ws://127.0.0.1:5000/lobby', { transports: ["websocket"] });
        }
    }
})();