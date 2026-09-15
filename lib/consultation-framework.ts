export type ConsultationType = "couple" | "individual";

export type FrameworkPart = {
  text: string;
  strong?: boolean;
};

export type FrameworkSection = {
  title: string;
  parts: FrameworkPart[];
};

export type FrameworkDefinition = {
  version: string;
  sections: FrameworkSection[];
};

export const consultationFrameworks: Record<ConsultationType, FrameworkDefinition> = {
  couple: {
    version: "2026-09-15-couple-v1",
    sections: [
      {
        title: "Première séance et progression",
        parts: [
          { text: "La première séance constitue déjà " },
          { text: "une étape de travail importante", strong: true },
          { text: ". Elle permet d’obtenir " },
          { text: "une image générale et structurée du couple", strong: true },
          { text: ", de comprendre ce qui entretient les difficultés, " },
          { text: "d’identifier les priorités", strong: true },
          { text: " et de déterminer sur quoi travailler par la suite. Le couple repart ainsi avec " },
          { text: "une lecture plus claire de sa situation et une direction adaptée", strong: true },
          { text: ". La suite de l’accompagnement est ensuite définie avec le couple, en fonction de sa situation, de ses besoins et de ses objectifs." },
        ],
      },
      {
        title: "Pendant les séances",
        parts: [
          { text: "Chacun parle à son tour sans être interrompu.", strong: true },
          { text: " " },
          { text: "Aucune insulte, menace, humiliation ni forme de violence verbale ou physique n’est acceptée", strong: true },
          { text: ". Les téléphones restent silencieux et les enfants ne participent pas. La séance peut être interrompue si le cadre n’est plus respecté." },
        ],
      },
      {
        title: "Entre les séances",
        parts: [
          { text: "Les paroles exprimées en consultation " },
          { text: "ne doivent pas être utilisées comme une arme ou un reproche", strong: true },
          { text: ". Il est recommandé " },
          { text: "d’éviter de multiplier les conseils extérieurs", strong: true },
          { text: ", souvent partiels ou contradictoires, et d’en parler en séance avant de les appliquer." },
        ],
      },
      {
        title: "Cohérence du suivi",
        parts: [
          { text: "Pour préserver une direction claire, il est demandé de " },
          { text: "ne pas entreprendre simultanément un second suivi conjugal sans en parler préalablement", strong: true },
          { text: ". Cela ne concerne pas les accompagnements médicaux, psychologiques, rabbiniques, juridiques ou tout autre suivi spécialisé." },
        ],
      },
      {
        title: "Visioconférence et confidentialité",
        parts: [
          { text: "Chaque participant s’installe dans " },
          { text: "un endroit calme et privé", strong: true },
          { text: ". " },
          { text: "Aucun participant n’est autorisé à filmer, photographier, enregistrer, retransmettre ou effectuer une capture d’écran de tout ou partie d’une séance, par quelque moyen que ce soit.", strong: true },
          { text: " Les échanges sont traités avec discrétion, dans les limites prévues par la loi et la sécurité des personnes." },
        ],
      },
    ],
  },
  individual: {
    version: "2026-09-15-individual-v1",
    sections: [
      {
        title: "Première séance et progression",
        parts: [
          { text: "La première séance constitue déjà " },
          { text: "une étape de travail importante", strong: true },
          { text: ". Elle permet d’obtenir " },
          { text: "une image générale et structurée de votre situation", strong: true },
          { text: ", de comprendre ce qui entretient les difficultés, " },
          { text: "d’identifier les priorités", strong: true },
          { text: " et de déterminer sur quoi travailler par la suite. Vous repartez ainsi avec " },
          { text: "une lecture plus claire de votre situation et une direction adaptée", strong: true },
          { text: ". La suite de l’accompagnement est ensuite définie avec vous, en fonction de votre situation, de vos besoins et de vos objectifs." },
        ],
      },
      {
        title: "Pendant les séances",
        parts: [
          { text: "Les échanges doivent rester respectueux.", strong: true },
          { text: " " },
          { text: "Aucune insulte, menace, humiliation ni forme de violence verbale ou physique n’est acceptée", strong: true },
          { text: ". Le téléphone reste silencieux et les enfants ne participent pas. La séance peut être interrompue si le cadre n’est plus respecté." },
        ],
      },
      {
        title: "Entre les séances",
        parts: [
          { text: "Les éléments abordés en consultation " },
          { text: "ne doivent pas être utilisés pour alimenter un conflit, exercer une pression ou formuler un reproche envers une autre personne", strong: true },
          { text: ". Il est recommandé " },
          { text: "d’éviter de multiplier les conseils extérieurs", strong: true },
          { text: ", souvent partiels ou contradictoires, et d’en parler en séance avant de les appliquer." },
        ],
      },
      {
        title: "Cohérence du suivi",
        parts: [
          { text: "Pour préserver une direction claire, il est demandé " },
          { text: "d’informer le conseiller de tout autre suivi conjugal mené simultanément", strong: true },
          { text: ". Cela ne concerne pas les accompagnements médicaux, psychologiques, rabbiniques, juridiques ou tout autre suivi spécialisé." },
        ],
      },
      {
        title: "Visioconférence et confidentialité",
        parts: [
          { text: "Vous vous installez dans " },
          { text: "un endroit calme et privé", strong: true },
          { text: ". " },
          { text: "Vous n’êtes pas autorisé à filmer, photographier, enregistrer, retransmettre ou effectuer une capture d’écran de tout ou partie d’une séance, par quelque moyen que ce soit.", strong: true },
          { text: " Les échanges sont traités avec discrétion, dans les limites prévues par la loi et la sécurité des personnes." },
        ],
      },
    ],
  },
};

export const generalAcceptanceStatement =
  "J’ai personnellement lu et j’accepte l’ensemble du cadre et le fonctionnement proposé de l’accompagnement.";

export const keyRulesAcceptanceStatement =
  "Je confirme avoir compris qu’il est interdit de photographier, filmer, enregistrer, retransmettre ou effectuer une capture d’écran de tout ou partie d’une séance, et que la séance peut être interrompue en cas de non-respect du cadre, notamment en cas d’insulte, de menace, d’humiliation ou de violence verbale ou physique.";

export function privacyAcceptanceStatement(type: ConsultationType) {
  return `${type === "individual" ? "J’ai" : "Nous avons"} pris connaissance de l’utilisation de ces informations pour préparer et assurer le suivi de l’accompagnement, ainsi que de la politique de confidentialité.`;
}

export function frameworkSnapshot(type: ConsultationType) {
  return consultationFrameworks[type].sections
    .map((section) => `${section.title}\n${section.parts.map((part) => part.text).join("")}`)
    .join("\n\n");
}

export function acceptedTextSnapshot(type: ConsultationType) {
  return [
    `Cadre de l’accompagnement\n${frameworkSnapshot(type)}`,
    `Validation générale${type === "couple" ? " — à confirmer personnellement par chaque conjoint" : ""}\n${generalAcceptanceStatement}`,
    `Règles essentielles${type === "couple" ? " — à confirmer personnellement par chaque conjoint" : ""}\n${keyRulesAcceptanceStatement}`,
    `Utilisation des informations et confidentialité\n${privacyAcceptanceStatement(type)}`,
  ].join("\n\n");
}
