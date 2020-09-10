<template>
  <div id="root">
    <div id="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/r">Room</router-link>
    </div>
    <router-view />
  </div>
</template>

<script>
import { onMounted } from "vue";
import ws from "./utils/WebSocketManager";
export default {
  setup() {
    onMounted(() => {
      ws.start();
    });
  },
};
</script>