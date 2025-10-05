// @ts-ignore
import type { Route } from "./+types/home";
import HomePage from "../pages/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Flights App" },
    { name: "description", content: "Welcome to the Flights App!" },
  ];
}

export default function Home() {
  return <HomePage />;
}
