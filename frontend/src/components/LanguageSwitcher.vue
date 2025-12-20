<template>
  <div class="language-switcher">
    <select v-model="localeModel" @change="handleLanguageChange" class="language-select">
      <option value="en">English</option>
      <option value="zh-cn">简体中文</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "../utils/i18n";

const { currentLocale, setLocale } = useI18n();

// Create a local ref to bind v-model
const localeModel = ref(currentLocale.value);

// Watch for currentLocale changes, sync to localeModel
watch(currentLocale, (newLocale) => {
  localeModel.value = newLocale;
});

const handleLanguageChange = () => {
  setLocale(localeModel.value);
};
</script>

<style scoped>
.language-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.language-select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
}

.language-select:hover {
  border-color: #007bff;
}
</style>