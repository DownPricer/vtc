"use client";

import { CalculatorForm } from "./CalculatorForm";

type DevisFormProps = {
  vtcBaseAddress: string;
};

export function DevisForm({ vtcBaseAddress }: DevisFormProps) {
  return <CalculatorForm mode="devis" vtcBaseAddress={vtcBaseAddress} />;
}
