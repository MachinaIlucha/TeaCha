import { qs } from "./dom.js";

export const initTopbarHeightVar = ({
  selector = ".topbar",
  cssVar = "--topbar-h",
} = {}) => {
  const topbar = qs(selector);
  if (!topbar) return;

  const set = () => {
    document.documentElement.style.setProperty(
      cssVar,
      `${topbar.offsetHeight}px`
    );
  };

  set();
  window.addEventListener("resize", set);
};
