import { ref, watch, onMounted } from "vue";

export const useTheme = () => {
  const isDark = ref(false);

  // Check system preference
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  // Initialize theme based on localStorage or system preference
  const initializeTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      isDark.value = savedTheme === "dark";
    } else {
      isDark.value = systemPrefersDark.matches;
    }
  };

  // Handle system theme changes
  const handleSystemThemeChange = (e: { matches: boolean }) => {
    if (!localStorage.getItem("theme")) {
      isDark.value = e.matches;
    }
  };

  onMounted(() => {
    initializeTheme();
    systemPrefersDark.addEventListener("change", handleSystemThemeChange);
  });

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
  };

  watch(
    isDark,
    (newValue) => {
      document.documentElement.setAttribute(
        "data-theme",
        newValue ? "dark" : "light"
      );
    },
    { immediate: true }
  );

  return {
    isDark,
    toggleTheme,
  };
};
