import ws from './WebSocketManager';
import eventBus from './EventBus';

const BUFFERED_AMOUNT_LOW_THRESHOLD = 256 * 1024;
const BUF_WAITING_THRESHOLD = 1024 * 1024;

export default class PeerConnectionManager {
    constructor() {
        this.roomId = null;
        this.peerConnection = null;
        this.dataChannel = null;

        this.initiateConnection = this.initiateConnection.bind(this);
        this.waitForConnection = this.waitForConnection.bind(this);
        this.signalingMessageCallback = this.signalingMessageCallback.bind(this);
        this.setupDataChannel = this.setupDataChannel.bind(this);
        this.onIceCandidate = this.onIceCandidate.bind(this);
        this.onDescription = this.onDescription.bind(this);
        this.onReceiveMessageCallback = this.onReceiveMessageCallback.bind(this);
        this.sendData = this.sendData.bind(this);
        this.onChannelOpen = this.onChannelOpen.bind(this);
        this.onChannelClose = this.onChannelClose.bind(this);
    }

    initiateConnection(roomId) {
        console.log("initiate connection...");
        this.roomId = roomId;
        this.createRTCConnection(true);
    }

    waitForConnection(roomId) {
        console.log("waiting for remote description... (offer)")
        this.roomId = roomId;
        this.createRTCConnection(false);
    }

    createRTCConnection(isCaller) {
        const config = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302',
                },
                {
                    urls: 'turn:0.peerjs.com:3478',
                    username: 'peerjs',
                    credential: 'peerjsp',
                },
            ],
        };
        const peerConnection = new RTCPeerConnection(config);
        this.peerConnection = peerConnection;
        peerConnection.onicecandidate = this.onIceCandidate;

        if (isCaller) {
            const dataChannel = peerConnection.createDataChannel('file-transfer', { ordered: true });
            this.setupDataChannel(dataChannel);
            this.createOffer();
        } else {
            this.peerConnection.ondatachannel = e => {
                const dataChannel = e.channel || e.target;
                this.setupDataChannel(dataChannel);
            };
        }
    }

    createOffer() {
        console.log("create offer.")
        this.peerConnection.createOffer()
            .then(description => {
                this.onDescription(description);
            });
    }

    createAnswer() {
        console.log("create answer.")
        this.peerConnection.createAnswer()
            .then(description => {
                this.onDescription(description)
            });
    }

    setupDataChannel(dataChannel) {
        this.dataChannel = dataChannel;
        dataChannel.bufferedAmountLowThreshold = BUFFERED_AMOUNT_LOW_THRESHOLD;
        dataChannel.binaryType = 'arraybuffer';
        dataChannel.onopen = this.onChannelOpen;
        dataChannel.onclose = this.onChannelClose;
        dataChannel.onerror = this.onChannelError;
    }

    onDescription(description) {
        this.peerConnection.setLocalDescription(description)
            .then(() => {
                this.sendMessage(description);
            })
            .catch(e => console.log('onDescription error: ', e));
    }

    onIceCandidate(e) {
        if (!e.candidate) {
            return;
        }
        console.log('ICE candidate, send to remote:', JSON.stringify(e.candidate));
        this.sendMessage({ ice: e.candidate });
    }

    onChannelOpen(e) {
        console.log('## channel open: ', e);
        this.dataChannel.onmessage = this.onReceiveMessageCallback;
    }

    onChannelClose(e) {
        console.log('## channel close: ', e);
    }

    onChannelError(e) {
        console.log('## channel error: ', e);
    }

    signalingMessageCallback(message) {
        if (message.type === 'offer') {
            console.log('Got offer. Sending answer to peer.');
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(message)).then(_ => {
                this.createAnswer();
            });
        } else if (message.type === 'answer') {
            console.log('Got answer.');
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(message));

        } else if (message.ice) {
            console.log("Got candidate.")
            this.peerConnection.addIceCandidate(message.ice).catch(e => {
                console.log("Failure during addIceCandidate(): " + e.name);
            });
        }
    }

    onReceiveMessageCallback() {
        eventBus.emit("onReceiveMessage", "hello world!");
        // let count;
        // let fileSize, fileName;
        // let receiveBuffer = [];

        // return function onmessage(event) {
        //     if (typeof event.data === 'string') {
        //         const fileMetaInfo = event.data.split(',');
        //         fileSize = parseInt(fileMetaInfo[0]);
        //         fileName = fileMetaInfo[1];
        //         count = 0;
        //         return;
        //     }

        //     receiveBuffer.push(event.data);
        //     count += event.data.byteLength;

        //     if (fileSize === count) {
        //         const received = new Blob(receiveBuffer);
        //         receiveBuffer = [];

        //         console.log(`${fileName} (${fileSize} bytes)`);
        //     }
        // };
    }

    sendData() {
        //send file size and file name as comma separated value.
        this.dataChannel.send("hello world!");

        // const chunkSize = 16384;
        // fileReader = new FileReader();
        // let offset = 0;
        // fileReader.addEventListener('error', error => console.error('Error reading file:', error));
        // fileReader.addEventListener('abort', event => console.log('File reading aborted:', event));
        // fileReader.addEventListener('load', e => {
        //     console.log('FileRead.onload ', e);
        //     dataChannel.send(e.target.result);
        //     offset += e.target.result.byteLength;
        //     if (offset < file.size) {
        //         readSlice(offset);
        //     } else {
        //         alert(`${file.name} has been sent successfully.`);
        //         sendFileBtn.disabled = false;
        //     }
        // });
        // const readSlice = o => {
        //     console.log('readSlice ', o);
        //     const slice = file.slice(offset, o + chunkSize);
        //     fileReader.readAsArrayBuffer(slice);
        // };
        // readSlice(0);
    }

    sendMessage(message) {
        console.log('Client sending message: ', message);
        ws.invoke("SendMessage", this.roomId, message).catch(function (err) {
            return console.error(err.toString());
        });
    }

    logError(err) {
        if (!err) return;
        if (typeof err === 'string') {
            console.warn(err);
        } else {
            console.warn(err.toString(), err);
        }
    }
}