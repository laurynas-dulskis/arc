import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { ROUTES } from "./constants/routes";

export default [
  index("pages/home.tsx"),
  route(ROUTES.COMPLETE_SIGNUP, "pages/signup.tsx"),
  route(ROUTES.ADMIN_PANEL, "pages/adminPanel.tsx")
] satisfies RouteConfig;
