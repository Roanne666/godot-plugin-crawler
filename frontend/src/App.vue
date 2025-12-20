<template>
  <div>
    <LanguageSwitcher />
    <PluginList />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PluginList from "./components/PluginList.vue";
import LanguageSwitcher from "./components/LanguageSwitcher.vue";

export default defineComponent({
  name: "App",
  components: {
    PluginList,
    LanguageSwitcher,
  },
});
</script>
