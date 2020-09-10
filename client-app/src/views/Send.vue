<template>
  <h1>房间号: {{roomId}} 发送端</h1>
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

    function waitForConnection(roomId) {
      peer.waitForConnection(roomId);
    }

    function sendMessage() {
      peer.sendData();
    }

    function onReceiveMessage(msg) {
      message.value = msg;
    }

    onMounted(() => {
      ws.on("message", function (message) {
        console.log("Client received message:", message);
        peer.signalingMessageCallback(message);
      });

      waitForConnection(roomId.value);
      eventBus.on("onReceiveMessage", onReceiveMessage);
    });
    return { roomId, sendMessage, message };
  },
};
</script>