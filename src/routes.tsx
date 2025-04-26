
import { RouteObject } from "react-router-dom";
import { default as Home } from "./pages/auditor/Home";
import { default as Login } from "./pages/Login";
import { default as Register } from "./pages/Login"; // We'll use Login page for now since Register doesn't exist
import { default as Auditorias } from "./pages/auditor/Home"; // Redirect to Home for now
import { default as Relatorio } from "./pages/auditor/Relatorio";
import { default as ChecklistPage } from "./pages/auditor/ChecklistPage";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/auditorias",
    element: <Auditorias />,
  },
  {
    path: "/relatorio/:auditoriaId",
    element: <Relatorio />,
  },
  {
    path: "/checklist/:auditoriaId",
    element: <ChecklistPage />,
  },
];

export default routes;
