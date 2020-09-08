<template>
  <div class="state" v-if="!gameStarted">
    <section class="flex flex-row">
      <div
        class="w-32 text-center m-4"
        v-for="player in players"
        :key="player.id"
      >
        <img :src="player.logo" :alt="player.display_name" />
        <span>{{ player.display_name }}</span>
      </div>
    </section>
    <button class="p-2 bg-green-700 text-white" @click="playGame()">
      Play
    </button>
    <hr />
  </div>
  <div id="game"></div>
</template>

<script>
import { SubscriptionClient } from "subscriptions-transport-ws";
import { useRoute } from "vue-router";
import { inject, ref } from "vue";

import { usePIXI } from "../composable/usePIXI";

const wsclient = new SubscriptionClient("ws://localhost:5001/v1/graphql", {
  reconnect: true,
});

export default {
  setup() {
    const { params } = useRoute();
    const { PIXI, app, startPIXI } = usePIXI();
    const players = ref([]);
    const gameStarted = inject("gameStarted");

    function playGame() {
      gameStarted.value = true;
      startPIXI();

      const images = players.value.map((player) => {
        return player.logo;
      });

      const playerSprites = [];
      app.loader.add(images).load(({ resources }) => {
        Object.entries(resources).forEach(([, resource], index) => {
          let player = new PIXI.Sprite(resource.texture);
          player.width = 80;
          player.height = 80;

          player.vx = 5;
          player.vy = 5;

          player.position.set(50, (index + 1) * 100);

          playerSprites.push(player);

          app.stage.addChild(player);
        });
      });

      function hitTestRectangle(r1, r2) {
        let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

        hit = false;

        r1.centerX = r1.x + r1.width / 2;
        r1.centerY = r1.y + r1.height / 2;
        r2.centerX = r2.x + r2.width / 2;
        r2.centerY = r2.y + r2.height / 2;

        r1.halfWidth = r1.width / 2;
        r1.halfHeight = r1.height / 2;
        r2.halfWidth = r2.width / 2;
        r2.halfHeight = r2.height / 2;

        vx = r1.centerX - r2.centerX;
        vy = r1.centerY - r2.centerY;

        combinedHalfWidths = r1.halfWidth + r2.halfWidth;
        combinedHalfHeights = r1.halfHeight + r2.halfHeight;

        if (Math.abs(vx) < combinedHalfWidths) {
          if (Math.abs(vy) < combinedHalfHeights) {
            hit = true;
          } else {
            hit = false;
          }
        } else {
          hit = false;
        }
        return hit;
      }

      app.ticker.add(() => {
        playerSprites.forEach((player) => {
          if (player.x >= app.view.width - player.width || player.x <= 0) {
            player.vx = player.vx * -1;
          }
          if (player.y >= app.view.height - player.height || player.y <= 0) {
            player.vy = player.vy * -1;
          }

          playerSprites.forEach((otherPlayer) => {
            if (otherPlayer === player) return;

            if (hitTestRectangle(player, otherPlayer)) {
              /* let major = otherPlayer,
                minor = player;

              if (player.vx + player.vy > otherPlayer.vx + otherPlayer.vy) {
                major = player;
                minor = otherPlayer;
              } */

              player.vx = player.vx * -1;
              otherPlayer.vx = otherPlayer.vx * -1;

              player.vy = player.vy * -1;
              otherPlayer.vy = otherPlayer.vy * -1;
            }
          });

          player.x += player.vx;
          player.y += player.vy;
        });
      });
    }

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
      gameStarted,

      playGame,
    };
  },
};
</script>

<style>
canvas {
  background-color: #ccc;
}
</style>