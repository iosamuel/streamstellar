<template>
  <div id="app">
    <div id="nav" v-if="!gameStarted">
      <router-link
        :to="`/channel/${lobby.channel}`"
        v-for="lobby in lobbies"
        :key="lobby.id"
      >
        {{ lobby.channel }}
      </router-link>
    </div>
    <router-view />
  </div>
</template>

<script>
import { request as gFetch } from "graphql-request";
import { provide, ref } from "vue";

export default {
  setup() {
    const lobbies = ref([]);
    const gameStarted = ref(false);

    provide("gameStarted", gameStarted);

    gFetch(
      "http://localhost:5001/v1/graphql",
      /* GraphQL */ `
        query Lobbies {
          lobby {
            id
            channel
          }
        }
      `
    ).then((data) => {
      lobbies.value = data.lobby;
    });

    return {
      lobbies,
      gameStarted,
    };
  },
};
</script>

<style></style>
