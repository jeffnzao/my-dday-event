export type EditorialImage = {
  src: string;
  alt: string;
  position?: string;
};

export type Inspiration = {
  style: string;
  mood: string;
  description: string;
  image: EditorialImage;
};

const photo = (id: string, alt: string, position?: string): EditorialImage => ({
  src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1500&q=85`,
  alt,
  position,
});

export const navigation = [
  { label: "La collection", href: "/collection" },
  { label: "Nos mariages", href: "/mariages" },
  { label: "Comment louer", href: "/comment-louer" },
];

export const homeContent = {
  eyebrow: "Location de décoration de mariage",
  title: "Des étoiles dans les yeux.",
  titleAccent: "Et vous deux au milieu.",
  intro:
    "Les premiers invités arrivent, les regards s’illuminent, et vous découvrez enfin le décor que vous aviez imaginé.",
  description:
    "Arches fleuries, jolies tables, voilages et coins photo : MY DDAY EVENT vous propose les pièces à louer pour donner vie à une fête qui vous ressemble.",
  introductionTitle: "Vous avez les envies.",
  introductionAccent: "Voici de quoi leur donner vie.",
  introduction: [
    "Une réception tout en blanc, une ambiance romantique à la lumière des bougies ou quelques détails délicats… Commencez par ce qui vous fait sourire.",
    "Explorez la collection à votre rythme et imaginez chaque espace, de l’arrivée de vos invités aux dernières photos de la soirée.",
    "Le plaisir d’un beau décor, sans tout acheter ni le stocker après la fête.",
  ],
};

export const inspirations: Inspiration[] = [
  {
    style: "Romantique",
    mood: "Douceur poudrée",
    description: "Des roses pastel, des bougies et des matières délicates pour une atmosphère enveloppante.",
    image: photo("photo-1519167758481-83f550bb49b3", "Table romantique aux fleurs pastel"),
  },
  {
    style: "Bohème",
    mood: "Nature libre",
    description: "Des textures naturelles, des fleurs légères et une réception pensée au grand air.",
    image: photo("photo-1507504031003-b417219a0fde", "Réception champêtre aux matières naturelles"),
  },
  {
    style: "Chic",
    mood: "Élégance contemporaine",
    description: "Des lignes épurées, une lumière douce et quelques détails choisis avec soin.",
    image: photo("photo-1511795409834-ef04bbd61622", "Réception élégante décorée de lumières"),
  },
  {
    style: "Champêtre",
    mood: "Fête au jardin",
    description: "Une grande tablée, des fleurs des champs et l’esprit joyeux d’une journée dehors.",
    image: photo("photo-1464366400600-7168b8af9bc3", "Grande tablée fleurie en extérieur"),
  },
  {
    style: "Oriental",
    mood: "Lumières précieuses",
    description: "Des lanternes, des étoffes et une palette chaleureuse pour rassembler les proches.",
    image: photo("photo-1519741497674-611481863552", "Réception de mariage aux tons chauds"),
  },
  {
    style: "Intimiste",
    mood: "Maison de famille",
    description: "Quelques belles tables, des fleurs choisies et tous ceux qui comptent.",
    image: photo("photo-1511285560929-80b456fea0bc", "Réception intimiste à la lumière du soir"),
  },
];

export const rentalSteps = [
  {
    number: "01",
    title: "Choisissez vos décorations",
    text: "Parcourez les catégories, ajoutez vos pièces préférées et ajustez les quantités. Votre sélection reste modifiable.",
  },
  {
    number: "02",
    title: "Racontez-nous votre journée",
    text: "Précisez la date, le lieu, le nombre d’invités et vos coordonnées. Indiquez si vous souhaitez une installation.",
  },
  {
    number: "03",
    title: "Vérifiez votre chiffrage",
    text: "Retrouvez les articles, les quantités, les prix et les options retenues dans un récapitulatif détaillé avant l’envoi.",
  },
  {
    number: "04",
    title: "Préparons le grand jour",
    text: "Nous vérifions les disponibilités et convenons ensemble des modalités de location et de l’installation si vous l’avez choisie.",
  },
];
