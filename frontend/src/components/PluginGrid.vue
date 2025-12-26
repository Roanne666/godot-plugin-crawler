<template>
  <div class="asset-search-results">
    <ol class="asset-list" v-if="plugins.length > 0">
      <PluginCard
        v-for="plugin in plugins"
        :key="plugin.url"
        :plugin="plugin"
        :sort-key="sortKey"
        :is-favorite="isFavorite(plugin.url)"
        @toggle-favorite="toggleFavorite"
        @refresh-plugin="refreshPlugin"
      />
    </ol>
    <div v-else class="no-results">
      <p>{{ t('no_plugins_match') }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import PluginCard from "./PluginCard.vue";
import { useI18n } from "../utils/i18n";
import type { Asset } from "../services/api";

export default defineComponent({
  name: "PluginGrid",
  components: {
    PluginCard,
  },
  props: {
    plugins: { type: Array as PropType<Asset[]>, required: true },
    sortKey: { type: String as PropType<"lastUpdated" | "stars" | "lastCommit">, required: true },
    isFavorite: { type: Function as PropType<(url: string) => boolean>, required: true },
    toggleFavorite: { type: Function as PropType<(url: string) => void>, required: true },
    refreshPlugin: { type: Function as PropType<(url: string) => void>, required: true },
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
});
</script>

<style scoped>
.asset-search-results {
  width: 1200px;
  margin: 0 auto;
}

.asset-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 15px;
}

.no-results {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
  color: #888;
}
</style>