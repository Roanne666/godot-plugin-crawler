<template>
  <li class="asset-item" :class="{ 'is-inactive': plugin.repoContent === 'error' }">
    <button @click.stop="toggleFavorite" class="favorite-btn" :class="{ 'is-favorite': isFavorite }">
      <span class="star-icon">{{ isFavorite ? "★" : "☆" }}</span>
    </button>
    <div v-if="isToday(plugin.createdAt)" class="new-badge">NEW</div>
    <a :href="plugin.repoUrl" target="_blank" class="asset-header">
      <img :src="plugin.iconUrl" :alt="plugin.title + '\'s icon'" class="media-object" width="80" height="80" />
      <div class="asset-title">
        <h4>{{ plugin.title }}</h4>
        <div class="asset-tags-container">
          <div class="asset-tags">
            <span class="label label-primary">{{ plugin.category }}</span>
            <span class="label label-info">{{ plugin.godotVersion }}</span>
            <span :class="getSupportLevelClass(plugin.supportLevel)">{{ plugin.supportLevel }}</span>
            <span class="label label-default">{{ plugin.license }}</span>
          </div>
        </div>
      </div>
    </a>
    <div class="asset-body">
      <p class="asset-summary" :title="formattedSummary">{{ plugin.summary }}</p>
    </div>
    <div class="asset-footer">
      <a :href="plugin.authorUrl" target="_blank">{{ plugin.author }}</a>
      <span>
        <button @click.stop="refreshPlugin" class="refresh-btn" :title="t('refresh_plugin')">
          <span class="refresh-icon">↻</span>
        </button>
        <b>v{{ plugin.version }}</b> |
        <span v-if="sortKey === 'lastUpdated'">U : {{ formatDate(plugin.lastUpdated) }}</span>
        <span v-else-if="sortKey === 'lastCommit'">C : {{ formatDate(plugin.lastCommit) }}</span>
        <span v-else>{{ formatDate(plugin.lastUpdated) }}</span>
        | ⭐ {{ plugin.stars }}
      </span>
    </div>
  </li>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { useI18n } from "../utils/i18n";
import type { Asset } from "../services/api";

export default defineComponent({
  name: "PluginCard",
  props: {
    plugin: { type: Object as PropType<Asset>, required: true },
    sortKey: { type: String as PropType<"lastUpdated" | "stars" | "lastCommit">, required: true },
    isFavorite: { type: Boolean, required: true },
  },
  emits: ["toggle-favorite", "refresh-plugin"],
  setup() {
    const { t } = useI18n();
    return { t };
  },
  computed: {
    formattedSummary() {
      if (!this.plugin.summary) return "";
      return this.plugin.summary.replace(/(.{30})/g, "$1\n");
    },
  },
  methods: {
    formatDate(dateString: string) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-CA");
    },
    isToday(dateString?: string) {
      if (!dateString) return false;
      const createdDate = new Date(dateString);
      const today = new Date();
      return createdDate.toDateString() === today.toDateString();
    },
    getSupportLevelClass(supportLevel: string) {
      switch (supportLevel) {
        case "Testing":
          return "label label-default";
        case "Featured":
          return "label label-danger";
        case "Community":
          return "label label-success";
        default:
          return "label label-default";
      }
    },
    toggleFavorite() {
      this.$emit("toggle-favorite", this.plugin.url);
    },
    refreshPlugin() {
      this.$emit("refresh-plugin", this.plugin.url);
    },
  },
});
</script>

<style scoped>
.asset-item {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: 200px;
  overflow: hidden;
  position: relative;
}

.asset-header {
  display: flex;
  padding: 10px;
  text-decoration: none;
  color: inherit;
}

.asset-body {
  padding: 0 10px 10px;
  flex-grow: 1;
}

.asset-summary {
  font-size: 0.85em;
  color: #666;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.media-object {
  width: 60px;
  height: 60px;
  margin-right: 10px;
  border-radius: 4px;
}

.asset-title {
  flex: 1;
  min-width: 0;
}

.asset-title h4 {
  margin: 0 0 5px 0;
  font-size: 1em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asset-tags {
  margin-top: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.label {
  display: inline-block;
  padding: 0.2em 0.5em 0.2em;
  font-size: 70%;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25em;
  margin-right: 5px;
}

.label-primary {
  background-color: #337ab7;
}

.label-info {
  background-color: #5bc0de;
}

.label-success {
  background-color: #5cb85c;
}

.label-danger {
  background-color: #d9534f;
}

.label-default {
  background-color: #777;
}

.asset-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
  font-size: 0.85em;
}

.asset-footer a {
  color: #337ab7;
  text-decoration: none;
}

.favorite-btn {
  position: absolute;
  top: 0px;
  right: 2px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  font-size: 16px;
  z-index: 10;
  transition: all 0.2s ease;
  outline: none;
}

.favorite-btn:focus {
  outline: none;
  box-shadow: none;
}

.favorite-btn:hover {
  transform: scale(1.2);
}

.star-icon {
  display: block;
  font-size: 24px;
  color: #ccc;
}

.favorite-btn.is-favorite .star-icon {
  color: #f39c12;
}

.asset-item.is-inactive {
  background: #f5f5f5;
  opacity: 0.6;
  border-color: #ccc;
}

.asset-item.is-inactive .asset-title h4,
.asset-item.is-inactive .asset-summary,
.asset-item.is-inactive .asset-footer {
  color: #999;
}

.refresh-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  margin-right: 5px;
  border-radius: 3px;
  transition: all 0.2s ease;
  outline: none;
}

.refresh-btn:focus {
  outline: none;
  box-shadow: none;
}

.refresh-btn:hover {
  background-color: #e6e6e6;
  transform: rotate(90deg);
}

.refresh-icon {
  display: inline-block;
  font-size: 14px;
  color: #666;
  transition: transform 0.2s ease;
}

.new-badge {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #ff4757;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 0 0 4px 0;
  z-index: 5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
