import { createBrowserRouter } from "react-router";
import { Root } from "./components/root";
import { EcuePage } from "./components/ecue-page";
import { UePage } from "./components/ue-page";
import { SemestrePage } from "./components/semestre-page";
import { HistoriquePage } from "./components/historique-page";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: EcuePage },
      { path: "ue", Component: UePage },
      { path: "semestre", Component: SemestrePage },
      { path: "historique", Component: HistoriquePage },
    ],
  },
], { basename: import.meta.env.BASE_URL });
