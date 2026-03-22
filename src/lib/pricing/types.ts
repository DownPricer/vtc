export interface DistanceResult {
  km: number;
  duree: number;
}

export interface Distances {
  aller: {
    approche: Partial<DistanceResult>;
    trajet: Partial<DistanceResult>;
    retourBase: Partial<DistanceResult>;
  };
  retour: {
    approche: Partial<DistanceResult>;
    trajet: Partial<DistanceResult>;
    retourBase: Partial<DistanceResult>;
  };
}
