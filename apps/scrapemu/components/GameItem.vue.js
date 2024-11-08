const GameItem = {
    props: ['game'],
    template: `
      <div class="grid-item">
        <img :src="game.image" :alt="game.title" />
        <h3>{{ game.title }}</h3>
      </div>
    `,
  };
  