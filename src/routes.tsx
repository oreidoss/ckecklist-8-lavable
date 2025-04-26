import { RouteObject } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Auditorias from "@/pages/auditor/Auditorias";
import Relatorio from "@/pages/auditor/Relatorio";
import ChecklistPage from "@/pages/auditor/ChecklistPage";

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
