export type ProSettingsMailMeta = {
  mailTo: string | null;
  mailToCopy: string | null;
  mailReplyTo: string | null;
  /** Valeur brute de la variable d’environnement (vide = non définie). */
  customerConfirmationEnv: string;
  /** Valeur effective après lecture de l’env et repli sur la config site. */
  customerConfirmationEffective: boolean;
};
