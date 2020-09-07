<template>
  <ul>
    <li v-for="player in players" :key="player.id">
      <img :src="player.logo" :alt="player.display_name" />
      <span>{{ player.display_name }}</span>
    </li>
  </ul>
</template>

<script>
import { SubscriptionClient } from "subscriptions-transport-ws";
import { useRoute } from "vue-router";
import { ref } from "vue";

const wsclient = new SubscriptionClient("ws://localhost:5001/v1/graphql", {
  reconnect: true,
});

export default {
  setup() {
    const { params } = useRoute();
    const players = ref([]);

    wsclient
      .request({
        query: /* GraphQL */ `
          subscription PlayersInLobby($lobby: String) {
            players(where: { lobby: { _eq: $lobby } }) {
              id
              lobby
              logo
              display_name
            }
          }
        `,
        variables: {
          lobby: params.channel,
        },
      })
      .subscribe({
        next: (data) => {
          players.value = data.data.players;
        },
      });

    return {
      players,
    };
  },
};
</script>
