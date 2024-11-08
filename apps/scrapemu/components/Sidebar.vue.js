const Sidebar = {
    template: `
    <div class="sidebar">
        <ul>
          <li v-for="console in consoles" :key="console" :class="{ active: console === selectedConsole }" @click="$emit('select-console', console)">
            <img v-if="console === 'Nintendo (NES)'" src="assets/img/icons/NES.png" alt="NES Icon" class="icon">
            {{ console }}
          </li>
        </ul>
      </div>
    `,
    props: {
      consoles: Array,
      selectedConsole: String,
    },
  };