<template>
  <div class="sidebar">
    <div class="filter-controls">
      <input
        id="search"
        type="text"
        :value="searchQuery"
        @input="handleSearchInput"
        class="form-control"
        :placeholder="t('search_placeholder')"
      />
      <label for="sort">{{ t('sort_by') }}</label>
      <select id="sort" :value="sortKey" @change="handleSortChange">
        <option value="lastUpdated">{{ t('last_updated') }}</option>
        <option value="stars">{{ t('stars') }}</option>
        <option value="lastCommit">{{ t('last_commit') }}</option>
      </select>
      <label>{{ t('godot_version') }}</label>
      <select :value="filterGodotVersion" @change="handleGodotVersionChange">
        <option v-for="version in versions" :key="version" :value="version">{{ version }}</option>
      </select>
      <label>{{ t('category') }}</label>
      <select :value="filterCategory" @change="handleCategoryChange">
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
      <label>{{ t('license') }}</label>
      <select :value="filterLicense" @change="handleLicenseChange">
        <option v-for="license in licenses" :key="license" :value="license">{{ license }}</option>
      </select>
      <label>{{ t('support_level') }}</label>
      <select :value="filterSupportLevel" @change="handleSupportLevelChange">
        <option v-for="level in supportLevels" :key="level" :value="level">{{ level }}</option>
      </select>

      <div class="favorite-filter">
        <label>
          <input type="checkbox" :checked="showOnlyFavorites" @change="handleFavoriteChange" />
          {{ t('show_only_favorites') }}
        </label>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { useI18n } from "../utils/i18n";

export default defineComponent({
  name: "FilterSidebar",
  props: {
    searchQuery: { type: String, required: true },
    sortKey: { type: String as PropType<"lastUpdated" | "stars" | "lastCommit">, required: true },
    filterGodotVersion: { type: String, required: true },
    filterCategory: { type: String, required: true },
    filterLicense: { type: String, required: true },
    filterSupportLevel: { type: String, required: true },
    showOnlyFavorites: { type: Boolean, required: true },
    categories: { type: Array as PropType<string[]>, required: true },
    versions: { type: Array as PropType<string[]>, required: true },
    licenses: { type: Array as PropType<string[]>, required: true },
    supportLevels: { type: Array as PropType<string[]>, required: true },
  },
  emits: [
    "update:searchQuery",
    "update:sortKey",
    "update:filterGodotVersion",
    "update:filterCategory",
    "update:filterLicense",
    "update:filterSupportLevel",
    "update:showOnlyFavorites",
  ],
  setup(_, { emit }) {
    const { t } = useI18n();
    const handleSearchInput = (event: Event) => {
      const target = event.target as HTMLInputElement;
      emit("update:searchQuery", target.value);
    };

    const handleSortChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      emit("update:sortKey", target.value);
    };

    const handleGodotVersionChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      emit("update:filterGodotVersion", target.value);
    };

    const handleCategoryChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      emit("update:filterCategory", target.value);
    };

    const handleLicenseChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      emit("update:filterLicense", target.value);
    };

    const handleSupportLevelChange = (event: Event) => {
      const target = event.target as HTMLSelectElement;
      emit("update:filterSupportLevel", target.value);
    };

    const handleFavoriteChange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      emit("update:showOnlyFavorites", target.checked);
    };

    return {
      t,
      handleSearchInput,
      handleSortChange,
      handleGodotVersionChange,
      handleCategoryChange,
      handleLicenseChange,
      handleSupportLevelChange,
      handleFavoriteChange,
    };
  },
});
</script>

<style scoped>
.sidebar {
  width: 200px;
  margin-top: 2px;
  margin-right: 20px;
  position: sticky;
  top: 0;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.filter-controls label {
  display: block;
  margin-top: 10px;
  font-weight: bold;
}

.filter-controls select,
.filter-controls input {
  width: 100%;
  margin-bottom: 10px;
}

.form-control,
select {
  box-sizing: border-box;
  display: block;
  width: 100%;
  height: 34px;
  padding: 6px 12px;
  font-size: 14px;
  line-height: 1.42857143;
  color: #555;
  background-color: #fff;
  background-image: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  -webkit-transition: border-color ease-in-out 0.15s, -webkit-box-shadow ease-in-out 0.15s;
  -o-transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
}

.favorite-filter {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.favorite-filter label {
  display: flex;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
}

.favorite-filter input[type="checkbox"] {
  margin-right: 8px;
  width: auto;
  margin-bottom: 3px;
  vertical-align: middle;
}
</style>
