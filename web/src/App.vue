<template>
  <div id="app">
    <div id="nav">
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
import { ref } from "vue";

export default {
  setup() {
    const lobbies = ref([]);

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
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
