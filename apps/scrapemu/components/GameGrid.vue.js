const GameGrid = {
    props: ['games'],
    computed: {
      sortedGames() {
        return [...this.games].sort((a, b) => a.title.localeCompare(b.title));
      },
    },
    template: `
      <div class="grid-view">
        <game-item v-for="game in sortedGames" :key="game.title" :game="game"></game-item>
      </div>
    `,
    components: {
      GameItem,
    },
  };
  