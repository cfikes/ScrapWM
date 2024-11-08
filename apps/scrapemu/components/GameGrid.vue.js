const GameGrid = {
    props: ['games'],
    template: `
      <div class="grid-view">
        <game-item v-for="game in games" :key="game.title" :game="game"></game-item>
      </div>
    `,
    components: {
      GameItem,
    },
  };
  