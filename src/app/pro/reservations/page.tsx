import { redirect } from "next/navigation";

export default function ProReservationsPage() {
  redirect("/pro/demandes?kind=reservation");
}
