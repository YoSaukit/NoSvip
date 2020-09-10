<template>
  <h1>房间号: {{roomId}} 接收端</h1>
  <button @click="sendMessage">发消息</button>
  <p>{{message}}</p>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import ws from "../utils/WebSocketManager";
import PeerConnectionManager from "../utils/PeerConnectionManager";
import eventBus from "../utils/EventBus";

export default {
  setup() {
    const route = useRoute();
    const roomId = computed(() => route.params.rid);
    const message = ref("");
    const peer = new PeerConnectionManager();

    function joinRoom(roomId) {
      ws.invoke("JoinRoom", roomId).catch(function (err) {
        return console.error(err.toString());
      });
    }

    function initiateConnection(roomId) {
      peer.initiateConnection(roomId);
    }

    function sendMessage() {
      peer.sendData();
    }

    function onReceiveMessage(msg) {
      message.value = msg;
    }

    onMounted(() => {
      ws.on("joined", function (roomId) {
        console.log("This peer has joined room", roomId);
        initiateConnection(roomId);
      });

      ws.on("message", function (message) {
        console.log("Client received message:", message);
        peer.signalingMessageCallback(message);
      });

      joinRoom(roomId.value);

      eventBus.on("onReceiveMessage", onReceiveMessage);
    });
    return { roomId, sendMessage, message };
  },
};
</script>
