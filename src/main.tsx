
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  const rootElement = document.getElementById("root");

  if (rootElement) {
    rootElement.setAttribute("translate", "no");
    rootElement.classList.add("notranslate");
  }

  document.documentElement.lang = "fr";
  document.documentElement.setAttribute("translate", "no");
  document.documentElement.classList.add("notranslate");

  createRoot(rootElement!).render(
    <>
      <App />
    </>
  );

  requestAnimationFrame(() => {
    document.body.classList.add('ready');
  });

// register service worker for PWA installability
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    }).catch(console.error);
  });
}
  