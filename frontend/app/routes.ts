import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { ROUTES } from "./constants/routes";

export default ([
  index("pages/home.tsx"),
  route(ROUTES.COMPLETE_SIGNUP, "pages/signup.tsx"),
  route(ROUTES.ADMIN_PANEL, "pages/adminPanel.tsx"),
  route(ROUTES.ADMIN_USERS, "pages/admin/users.tsx"),
  route(ROUTES.ADMIN_RESERVATIONS, "pages/admin/reservations.tsx"),
  route(ROUTES.ADMIN_FLIGHTS, "pages/admin/flights.tsx"),
  route(ROUTES.FLIGHT, "pages/flightPage.tsx"),
  route(ROUTES.RESERVATIONS, "pages/reservationsPage.tsx"),
  route(ROUTES.RESERVATION_DETAILS, "pages/reservationDetailsPage.tsx"),
  route(ROUTES.PAYMENT, "pages/payment.tsx"),
  route(ROUTES.BOARDING, "pages/boarding.tsx"),
  route(ROUTES.PASSENGERS, "pages/passengers.tsx"),
] as RouteConfig);
