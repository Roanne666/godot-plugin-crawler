<template>
  <div class="pagination-container">
    <div class="pagination-controls">
      <div class="pagination-buttons">
        <button 
          @click="goToPage(1)" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          {{ t('first_page') }}
        </button>
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          {{ t('previous_page') }}
        </button>
        
        <span class="page-info">
          {{ t('page_info', { current: currentPage, total: totalPages, items: totalItems }) }}
        </span>
        
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          {{ t('next_page') }}
        </button>
        <button 
          @click="goToPage(totalPages)" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          {{ t('last_page') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from "vue";
import { useI18n } from "../utils/i18n";

export default defineComponent({
  name: "Pagination",
  props: {
    totalItems: { type: Number, required: true },
    modelValue: { type: Number, default: 1 },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const PAGE_SIZE = 30;
    const currentPage = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value),
    });

    const totalPages = computed(() => {
      return Math.ceil(props.totalItems / PAGE_SIZE);
    });

    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    watch(totalPages, (newTotalPages) => {
      if (currentPage.value > newTotalPages && newTotalPages > 0) {
        currentPage.value = 1;
      }
    });

    return {
      t,
      currentPage,
      totalPages,
      goToPage,
    };
  },
});
</script>

<style scoped>
.pagination-container {
  margin: 0;
  padding: 0;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #007bff;
}

.pagination-btn:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  border-color: #e9ecef;
}

.page-info {
  padding: 0 15px;
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-buttons {
    justify-content: center;
  }

  .page-info {
    text-align: center;
    padding: 10px 0;
  }
}
</style>