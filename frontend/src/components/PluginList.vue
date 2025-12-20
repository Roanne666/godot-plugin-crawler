<template>
  <div class="container">
    <FilterSidebar
      v-model:search-query="searchQuery"
      v-model:sort-key="sortKey"
      v-model:filter-godot-version="filterGodotVersion"
      v-model:filter-category="filterCategory"
      v-model:filter-license="filterLicense"
      v-model:filter-support-level="filterSupportLevel"
      v-model:show-only-favorites="showOnlyFavorites"
      :categories="categories"
      :versions="versions"
      :licenses="licenses"
      :support-levels="supportLevels"
    />
    <div class="main-content">
      <PluginGrid
        :plugins="paginatedPlugins"
        :sort-key="sortKey"
        :is-favorite="isFavorite"
        :toggle-favorite="toggleFavorite"
        :refresh-plugin="refreshPlugin"
      />
    </div>
  </div>
  <div class="pagination-container">
    <Pagination v-model="currentPage" :total-items="filteredAndSortedPlugins.length" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, watch } from "vue";
import FilterSidebar from "./FilterSidebar.vue";
import PluginGrid from "./PluginGrid.vue";
import Pagination from "./Pagination.vue";
import { assetApi, type Asset } from "../services/api";
import { useI18n } from "../utils/i18n";

export default defineComponent({
  name: "PluginList",
  components: {
    FilterSidebar,
    PluginGrid,
    Pagination,
  },
  setup() {
    const { t } = useI18n();
    const plugins = ref<Asset[]>([]);
    const sortKey = ref<"lastUpdated" | "stars" | "lastCommit">("lastUpdated");
    const filterGodotVersion = ref("Any");
    const filterCategory = ref("Any");
    const filterLicense = ref("Any");
    const filterSupportLevel = ref("Any");
    const searchQuery = ref("");
    const showOnlyFavorites = ref(false);
    const currentPage = ref(1);

    const categories = [
      "Any",
      "2D Tools",
      "3D Tools",
      "Shaders",
      "Materials",
      "Tools",
      "Scripts",
      "Misc",
      "Templates",
      "Projects",
      "Demos",
    ];
    const versions = [
      "Any",
      "2.0",
      "2.1",
      "2.2",
      "3.0",
      "3.1",
      "3.2",
      "3.3",
      "3.4",
      "3.5",
      "3.6",
      "4.0",
      "4.1",
      "4.2",
      "4.3",
      "4.4",
      "4.5",
      "Unknown",
      "Custom build",
    ];
    const licenses = [
      "Any",
      "MIT",
      "MPL2.0",
      "GPLv3",
      "GPLv2",
      "LGPLv3",
      "LGPLv2.1",
      "LGPLv2",
      "AGPLv3",
      "European Union Public License 1.2",
      "Apache2.0",
      "CC0",
      "CC-BY-4.0",
      "CC-BY-3.0",
      "CC-BY-SA-4.0",
      "CC-BY-SA-3.0",
      "BSD-2-clause",
      "BSD-3-clause",
      "Boost-Software",
      "ISC",
      "Unlicense",
      "Proprietary",
    ];
    const supportLevels = ["Any", "Testing", "Community", "Featured"];

    onMounted(async () => {
      await loadAssets();
    });

    const loadAssets = async () => {
      try {
        plugins.value = await assetApi.getAll();
      } catch (error) {
        console.error("Error loading assets:", error);
        plugins.value = [];
      }
    };

    const filteredAndSortedPlugins = computed(() => {
      let result = plugins.value;

      // Handle license mapping: convert empty string to "Unlicense"
      result = result.map((plugin) => ({
        ...plugin,
        license: plugin.license === "" ? "Unlicense" : plugin.license,
      }));

      if (searchQuery.value) {
        const lowerCaseQuery = searchQuery.value.toLowerCase();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(lowerCaseQuery) ||
            p.author.toLowerCase().includes(lowerCaseQuery) ||
            p.summary.toLowerCase().includes(lowerCaseQuery)
        );
      }

      // Filtering
      if (filterGodotVersion.value && filterGodotVersion.value !== "Any") {
        result = result.filter((p) => p.godotVersion === filterGodotVersion.value);
      }
      if (filterCategory.value && filterCategory.value !== "Any") {
        result = result.filter((p) => p.category.toLowerCase() === filterCategory.value.toLowerCase());
      }
      if (filterLicense.value && filterLicense.value !== "Any") {
        result = result.filter((p) => p.license.toLowerCase() === filterLicense.value.toLowerCase());
      }
      if (filterSupportLevel.value && filterSupportLevel.value !== "Any") {
        result = result.filter((p) => p.supportLevel.toLowerCase() === filterSupportLevel.value.toLowerCase());
      }

      if (showOnlyFavorites.value) {
        result = result.filter((p) => p.favorite === true);
      }

      // Sorting
      result = result.slice().sort((a, b) => {
        const key = sortKey.value;
        if (key === "stars") {
          return b.stars - a.stars;
        } else {
          const dateA = new Date(a[key]);
          const dateB = new Date(b[key]);

          const isInvalidA = isNaN(dateA.getTime());
          const isInvalidB = isNaN(dateB.getTime());

          if (!isInvalidA && !isInvalidB) {
            return dateB.getTime() - dateA.getTime();
          }
          if (isInvalidA && !isInvalidB) {
            return 1;
          }
          if (!isInvalidA && isInvalidB) {
            return -1;
          }
          return 0;
        }
      });

      return result;
    });

    const paginatedPlugins = computed(() => {
      const PAGE_SIZE = 30;
      const start = (currentPage.value - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      return filteredAndSortedPlugins.value.slice(start, end);
    });

    watch(
      [sortKey, filterGodotVersion, filterCategory, filterLicense, filterSupportLevel, searchQuery, showOnlyFavorites],
      () => {
        currentPage.value = 1;
      }
    );

    watch(currentPage, () => {
      const mainContent = document.querySelector('.main-content');
      if (mainContent) {
        mainContent.scrollTop = 0;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const isFavorite = (pluginUrl: string) => {
      const plugin = plugins.value.find((p) => p.url === pluginUrl);
      return plugin?.favorite === true;
    };

    const toggleFavorite = async (pluginUrl: string) => {
      try {
        const plugin = plugins.value.find((p) => p.url === pluginUrl);
        if (!plugin) return;

        const newFavoriteStatus = !plugin.favorite;

        await assetApi.toggleFavorite(pluginUrl, newFavoriteStatus);

        plugin.favorite = newFavoriteStatus;
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    };

    const refreshPlugin = async (pluginUrl: string) => {
      try {
        const plugin = plugins.value.find((p) => p.url === pluginUrl);
        if (!plugin) return;

        const updatedPlugin = await assetApi.refreshPlugin(pluginUrl);
        
        const index = plugins.value.findIndex((p) => p.url === pluginUrl);
        if (index !== -1) {
          plugins.value[index] = { ...updatedPlugin, favorite: plugin.favorite };
        }
      } catch (error) {
        console.error("Error refreshing plugin:", error);
      }
    };

    const localizeSupportLevel = (level: string) => {
      switch (level.toLowerCase()) {
        case 'testing': return t('testing');
        case 'community': return t('community');
        case 'featured': return t('featured');
        default: return level;
      }
    };

    const localizeCategory = (category: string) => {
      if (category === 'Any') return t('any');
      return category;
    };

    return {
      t,
      plugins,
      sortKey,
      filterGodotVersion,
      filterCategory,
      filterLicense,
      filterSupportLevel,
      searchQuery,
      showOnlyFavorites,
      filteredAndSortedPlugins,
      categories,
      versions,
      licenses,
      supportLevels,
      currentPage,
      paginatedPlugins,
      isFavorite,
      toggleFavorite,
      refreshPlugin,
      localizeSupportLevel,
      localizeCategory,
    };
  },
});
</script>

<style scoped>
.container {
  display: flex;
  width: 80vw;
  margin: 0 auto;
  height: calc(100vh - 170px);
  overflow: hidden;
  align-items: flex-start;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  height: 100%;
  margin-top: -15px;
  padding-right: 15px;
}

.pagination-container {
  position: fixed;
  bottom: 20px;
  left: calc(10vw + 242px + 20px);
  width: 1200px;
  max-width: calc(63vw - 38px);
  z-index: 100;
  padding: 15px;
}

body {
  font-family: "Roboto", sans-serif;
}
</style>
