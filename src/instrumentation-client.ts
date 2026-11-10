import { observePlatformNavigationStart } from "./components/platform-navigation-lifecycle";

// 仅观察公开导航开始；不改写原生 Link/router，也不记录 URL 或凭据。
export function onRouterTransitionStart() {
  observePlatformNavigationStart();
}
