<template>
  <button  @click="createRoom">创建房间</button>
</template>

<script>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import ws from "../utils/WebSocketManager";

export default {
  setup() {
    const router = useRouter();

    function createRoom() {
      ws.invoke("CreateRoom").catch(function (err) {
        return console.error(err.toString());
      });
    }

    onMounted(() => {
      ws.on("created", function (roomId) {
        console.log("Created room", roomId);
        router.push("/s/" + roomId);
      });
    });

    return { createRoom };
  },
};
</script>
