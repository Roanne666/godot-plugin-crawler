import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { t } from "./utils/i18n";

document.title = t('page_title');

createApp(App).mount("#app");
