
import api from "../../infrastructure/axios"; // Adjust path as needed
import { type PublicPackageData, BILLING_UNIT } from "../plans/models";


export const MAP_UNIT_TO_TITLE: Record<PublicPackageData["billingUnit"], string> = {
  [BILLING_UNIT.HALF_DAY]: "Plan Medio Día",
  [BILLING_UNIT.FULL_DAY]: "Plan Día Completo",
  [BILLING_UNIT.HOUR]: "Reserva por Hora", // Match user requirement
};

export const fetchPublicPlans = async (): Promise<PublicPackageData[]> => {
  const { data } = await api.get<PublicPackageData[]>("admin/settings/packages");
  // We want only: Medio Día, Día Completo, Tarifa Fija
  const publicUnits: string[] = [BILLING_UNIT.HALF_DAY, BILLING_UNIT.FULL_DAY, BILLING_UNIT.HOUR];
  
  return data.filter(pkg => publicUnits.includes(pkg.billingUnit));
};