const TopNav = {
    template: `
      <div class="top-nav">
        <button v-for="(button, index) in buttons" :key="index" :class="{ active: index === 0 }">
          {{ button }}
        </button>
        <input type="search" placeholder="Search" />
      </div>
    `,
    data() {
      return {
        buttons: ['Library', 'Save States', 'Screenshots', 'Homebrew', 'Settings'],
      };
    }
  };
  