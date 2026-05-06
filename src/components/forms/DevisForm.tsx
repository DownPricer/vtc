"use client";

import { CalculatorForm } from "./CalculatorForm";

type DevisFormProps = {
  vtcBaseAddress: string;
  paymentOnlineEnabled?: boolean;
};

export function DevisForm({ vtcBaseAddress, paymentOnlineEnabled }: DevisFormProps) {
  return (
    <CalculatorForm mode="devis" vtcBaseAddress={vtcBaseAddress} paymentOnlineEnabled={paymentOnlineEnabled ?? false} />
  );
}
