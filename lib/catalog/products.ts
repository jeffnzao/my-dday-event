import { catalogCategories } from "./categories";
import type { CatalogProduct, CatalogVariant } from "./types";

type VariantInput = Omit<CatalogVariant, "displayPrice"> & { displayPrice?: string | null };

type ProductInput = {
  id: string;
  name: string;
  price: number | null;
  description?: string;
  dimensions?: string[];
  colors?: string[];
  variants?: VariantInput[];
  packContents?: string[];
  packLimit?: number;
  maxQuantity?: number;
  featured?: boolean;
  pricingStatus?: CatalogProduct["pricingStatus"];
  priceUnit?: string;
  displayPrice?: string | null;
};

type ProductGroup = {
  category: string;
  items: ProductInput[];
};

const productGroup = (category: string, items: ProductInput[]): ProductGroup => ({
  category,
  items,
});

const groups: ProductGroup[] = [
  productGroup("entree-accueil", [
    { id: "panneau-bienvenue-plexiglas-fleurs", name: "Panneau de bienvenue plexiglas personnalisé avec composition florale", price: 60, featured: true },
    { id: "panneau-bienvenue-blanc-fleurs", name: "Panneau de bienvenue blanc avec composition florale", price: 70 },
    { id: "miroir-accueil-fleurs", name: "Miroir d’accueil personnalisé avec composition florale", price: 100, featured: true },
    { id: "chevalet-dore", name: "Chevalet doré", price: 12 },
    { id: "plan-table-blanc-fleurs", name: "Plan de table blanc avec composition florale", price: 180 },
    { id: "plan-table-plexiglas-fleurs", name: "Plan de table plexiglas avec composition florale", price: 120 },
    {
      id: "potelets-dore-corde",
      name: "Potelets dorés — pack de 2",
      price: 12,
      description: "Deux potelets dorés avec corde au choix.",
      colors: ["Corde blanche", "Corde rouge"],
      variants: [
        { id: "corde-blanche", name: "Corde blanche", price: 12 },
        { id: "corde-rouge", name: "Corde rouge", price: 12 },
      ],
      packContents: ["2 potelets dorés", "1 corde au choix"],
    },
  ]),
  productGroup("salle-ceremonie", [
    { id: "arche-ronde-doree", name: "Arche ronde dorée", price: 20, description: "Uniquement l’arche." },
    { id: "arche-ronde-blanche", name: "Arche ronde blanche", price: 20, description: "Uniquement l’arche." },
    { id: "arche-carree-blanche", name: "Arche carrée blanche", price: 20, description: "Uniquement l’arche." },
    { id: "arche-carree-doree", name: "Arche carrée dorée", price: 20, description: "Uniquement l’arche." },
    { id: "rideau-blanc-3m", name: "Rideau blanc — 3 m", price: 15, dimensions: ["Longueur : 3 m"], description: "Tissu lycra. Uniquement le rideau." },
    { id: "rideaux-lumineux-blancs-3m", name: "Rideaux lumineux blancs — 3 m", price: 25, dimensions: ["Longueur : 3 m"], description: "Uniquement le rideau lumineux." },
    { id: "rideau-bleu-roi-3m", name: "Rideau bleu roi — 3 m", price: 15, dimensions: ["Longueur : 3 m"], colors: ["Bleu roi"] },
    { id: "rideaux-croises-blancs", name: "Rideaux croisés blancs", price: 30, colors: ["Blanc"] },
    { id: "rideaux-croises-beige", name: "Rideaux croisés beiges", price: 40, colors: ["Beige"] },
    { id: "structure-rideau", name: "Structure de rideau", price: 20 },
    { id: "structure-rideaux-croises", name: "Structure pour rideaux croisés", price: 28 },
    { id: "arche-romantique-doree", name: "Arche romantique dorée — 2 m", price: 18, dimensions: ["Hauteur : 2 m"] },
    { id: "arche-coeur", name: "Arche cœur", price: 18 },
    { id: "arche-nuptiale-260", name: "Arche nuptiale — 2,60 m", price: 22, dimensions: ["Hauteur : 2,60 m"] },
    { id: "arche-cathedrale-200", name: "Arche cathédrale — 2 m", price: 22, dimensions: ["Hauteur : 2 m"] },
    { id: "arche-cathedrale-240", name: "Arche cathédrale — 2,40 m", price: 30, dimensions: ["Hauteur : 2,40 m"] },
    { id: "arche-ronde-beauty-ouverte", name: "Arche ronde Beauty ouverte", price: 40 },
    { id: "arche-elegante", name: "Arche élégante", price: 50 },
    { id: "arche-ovale-blanche-2m", name: "Arche ovale blanche — 2 m", price: 10, dimensions: ["Hauteur : 2 m"], colors: ["Blanc"] },
    { id: "arche-hexagone-bois", name: "Arche hexagonale en bois", price: 40, description: "Uniquement l’arche." },
    { id: "socle-transparent", name: "Socle transparent", price: 14, colors: ["Transparent"] },
  ]),
  productGroup("allee-centrale", [
    { id: "tapis-ceremonie-blanc-30m", name: "Tapis de cérémonie blanc — 30 m", price: 90, dimensions: ["Longueur : 30 m"], colors: ["Blanc"] },
    { id: "tapis-ceremonie-rouge-30m", name: "Tapis de cérémonie rouge — 30 m", price: 80, dimensions: ["Longueur : 30 m"], colors: ["Rouge"] },
    { id: "arche-fleurie-entree-260", name: "Arche fleurie d’entrée — 2,60 m", price: 200, dimensions: ["Hauteur : 2,60 m"], featured: true },
    { id: "boule-fleurs-colonne-doree", name: "Boule de fleurs pour allée et colonne dorée", price: 15, colors: ["Doré"] },
    { id: "boule-fleurs-colonne-transparente", name: "Boule de fleurs pour allée et colonne transparente", price: 18, colors: ["Transparent"] },
    {
      id: "pack-allee",
      name: "Pack allée",
      price: 110,
      description: "Pack comprenant une arche dorée, 6 potelets et 6 boules de fleurs.",
      packContents: ["1 arche dorée", "6 potelets", "6 boules de fleurs"],
    },
  ]),
  productGroup("tables", [
    { id: "nappe-ronde-blanche-280", name: "Nappe ronde blanche — 280 cm", price: 9, dimensions: ["Diamètre : 280 cm"], colors: ["Blanc"] },
    { id: "nappe-rectangulaire-400", name: "Nappe de table rectangulaire blanche — 400 cm", price: 9, dimensions: ["Longueur : 400 cm"], colors: ["Blanc"] },
    { id: "nappe-ronde-elegante-marie", name: "Nappe de table ronde élégante pour table marié", price: 15, colors: ["Blanc"] },
    { id: "nappe-rectangulaire-elegante-marie", name: "Nappe de table rectangulaire élégante pour table marié", price: 18, colors: ["Blanc"] },
    { id: "chemin-mousseline-rose-peche", name: "Chemin de table en mousseline — rose pêche", price: 6, colors: ["Rose pêche"] },
    { id: "chemin-mousseline-vert-sauge", name: "Chemin de table en mousseline — vert sauge", price: 6, colors: ["Vert sauge"] },
    { id: "chemin-mousseline-bleu-roi", name: "Chemin de table en mousseline — bleu roi", price: 6, colors: ["Bleu roi"] },
    { id: "chemin-satin-dore", name: "Chemin de table en satin doré", price: 3, colors: ["Doré"] },
    { id: "chemin-satin-rouge", name: "Chemin de table en satin rouge", price: 3, colors: ["Rouge"] },
    { id: "chemin-gaze-coton", name: "Chemin de table en gaze de coton", price: 4, description: "Couleur au choix.", colors: ["Couleur au choix"] },
    { id: "serviette-tissu-blanche", name: "Serviette en tissu blanche", price: 0.5, colors: ["Blanc"] },
    { id: "serviette-tissu-vert-sauge", name: "Serviette en tissu vert sauge", price: 0.5, colors: ["Vert sauge"] },
    { id: "rond-serviette-dore", name: "Rond de serviette doré", price: 0.3, colors: ["Doré"] },
    { id: "centre-table-bas-dore", name: "Centre de table bas doré", price: 4, colors: ["Doré"] },
    { id: "centre-table-bas-blanc", name: "Centre de table bas blanc", price: 4, colors: ["Blanc"] },
    { id: "centre-table-haut-transparent-60", name: "Centre de table haut transparent — 60 cm", price: 10, dimensions: ["Hauteur : 60 cm"], colors: ["Transparent"] },
    { id: "centre-table-haut-dore-80", name: "Centre de table haut doré — 80 cm", price: 10, dimensions: ["Hauteur : 80 cm"], colors: ["Doré"] },
    { id: "vase-trompette-50", name: "Vase trompette — 50 cm", price: 8, dimensions: ["Hauteur : 50 cm"] },
    { id: "chandelier-transparent-86", name: "Chandelier transparent — 86 cm", price: 15, dimensions: ["Hauteur : 86 cm"], colors: ["Transparent"] },
    { id: "chandelier-dore-50", name: "Chandelier doré — 50 cm", price: 10, dimensions: ["Hauteur : 50 cm"], colors: ["Doré"] },
    { id: "bougeoir-transparent-tailles", name: "3 bougeoirs transparents — plusieurs tailles", price: 4.5, description: "Lot de 3 bougeoirs transparents. Plusieurs tailles.", colors: ["Transparent"], packContents: ["3 bougeoirs transparents"] },
    { id: "bougeoir-dore-tailles", name: "3 bougeoirs dorés — plusieurs tailles", price: 3.6, description: "Lot de 3 bougeoirs dorés. Plusieurs tailles.", colors: ["Doré"], packContents: ["3 bougeoirs dorés"] },
    { id: "vase-cylindrique-verre-tailles", name: "3 vases cylindriques en verre — plusieurs tailles", price: 6, description: "Lot de 3 vases cylindriques en verre. Plusieurs tailles.", colors: ["Verre transparent"], packContents: ["3 vases cylindriques en verre"] },
    { id: "soliflore", name: "Soliflore", price: 0.95 },
    { id: "soliflore-fleurs-artificielles", name: "Soliflore avec fleurs artificielles", price: 6 },
    { id: "vase-boheme-elance", name: "Vase bohème élancé", price: 1.1 },
    { id: "photophore-verre", name: "Photophore en verre", price: 0.8, colors: ["Verre transparent"] },
    { id: "porte-bougie-suspendre", name: "Porte-bougie en verre à suspendre", price: 1.1, colors: ["Verre transparent"] },
    {
      id: "composition-centre-table-ete",
      name: "Composition florale de centre de table — été",
      price: null,
      description: "Fleurs de couleur vive.",
      variants: [
        { id: "40cm", name: "40 cm", dimensions: "40 cm", price: 15 },
        { id: "50cm", name: "50 cm", dimensions: "50 cm", price: 28 },
      ],
    },
    {
      id: "composition-centre-table-hiver",
      name: "Composition florale de centre de table — hiver",
      price: null,
      description: "Fleurs de couleur neutre.",
      variants: [
        { id: "40cm", name: "40 cm", dimensions: "40 cm", price: 15 },
        { id: "50cm", name: "50 cm", dimensions: "50 cm", price: 28 },
      ],
    },
    {
      id: "composition-centre-table-printemps",
      name: "Composition florale de centre de table — printemps",
      price: null,
      description: "Fleurs blanches et feuillage.",
      variants: [
        { id: "40cm", name: "40 cm", dimensions: "40 cm", price: 15 },
        { id: "50cm", name: "50 cm", dimensions: "50 cm", price: 28 },
      ],
    },
    {
      id: "composition-centre-table-automne",
      name: "Composition florale de centre de table — automne",
      price: null,
      description: "Fleurs de pampas, gypsophile et autres fleurs.",
      variants: [
        { id: "40cm", name: "40 cm", dimensions: "40 cm", price: 15 },
        { id: "50cm", name: "50 cm", dimensions: "50 cm", price: 28 },
      ],
    },
    { id: "numero-table-moderne", name: "Numéro de table moderne", price: 3 },
    { id: "miroir-centre-table-plexiglas-50", name: "Miroir de centre de table en plexiglas — 50 cm", price: 9, dimensions: ["Diamètre : 50 cm"], colors: ["Transparent"], description: "Double face doré et miroir." },
    { id: "lampe-doree", name: "Lampe dorée", price: 3.9, colors: ["Doré"] },
  ]),
  productGroup("chaises-assises", [
    { id: "housse-chaise", name: "Housse de chaise", price: 1 },
    { id: "noeud-voilage", name: "Nœud en voilage", price: 0.6 },
    { id: "decor-floral-chaise", name: "Décor floral de chaise", price: 2.9 },
    { id: "banquette-beige", name: "Banquette beige", price: 40, colors: ["Beige"] },
    { id: "canape-coquillage", name: "Canapé coquillage", price: 90 },
    { id: "canape-beige", name: "Canapé beige", price: 150, colors: ["Beige"] },
    { id: "pouf", name: "Pouf", price: 10 },
  ]),
  productGroup("coin-photo", [
    { id: "fond-arque", name: "Fond arqué", price: 49, featured: true },
    { id: "trio-arches-cathedrale", name: "Trio d’arches cathédrales", price: 55, description: "Tarif indiqué pour les arches uniquement.", packContents: ["3 arches cathédrales"], packLimit: 1 },
    {
      id: "trio-panneaux-luxe-blanc",
      name: "Trio de panneaux Luxe blancs double face (avec et sans lumière)",
      price: 190,
      description: "Uniquement les panneaux.",
      variants: [
        { id: "avec-lumiere", name: "Avec lumière", price: 190 },
        { id: "sans-lumiere", name: "Sans lumière", price: 190 },
      ],
      packContents: ["3 panneaux blancs Luxe double face"],
      packLimit: 1,
    },
    { id: "panneau-blanc-ouvert", name: "Panneau blanc ouvert", price: 40, description: "Uniquement le panneau.", packLimit: 1 },
    { id: "duo-panneaux-blancs-ouverts", name: "Duo de panneaux blancs ouverts", price: 90, description: "Panneaux uniquement.", packContents: ["2 panneaux blancs ouverts"], packLimit: 1 },
    { id: "trio-arches-nuptiales-blanches", name: "Trio d’arches nuptiales blanches", price: 45, description: "Arches uniquement.", packContents: ["3 arches nuptiales blanches"], packLimit: 1 },
    { id: "mur-fleurs", name: "Mur de fleurs", price: 290, colors: ["Blanc", "Rose blush"], variants: [{ id: "blanc", name: "Blanc", price: 290 }, { id: "rose-blush", name: "Rose blush", price: 290 }], featured: true },
    {
      id: "supports-vases-grandes-compositions",
      name: "2 supports et 2 vases avec grandes compositions florales blanches — 75 cm",
      price: 119,
      dimensions: ["Composition : 75 cm"],
      packContents: ["2 supports", "2 vases", "2 grandes compositions florales blanches"],
      packLimit: 1,
    },
    {
      id: "colonnes-grandes-compositions-blanches",
      name: "2 colonnes avec grandes compositions florales blanches — 75 cm",
      price: 89,
      dimensions: ["Composition : 75 cm"],
      colors: ["Doré", "Transparent"],
      variants: [{ id: "dore", name: "Colonnes dorées", price: 89 }, { id: "transparent", name: "Colonnes transparentes", price: 89 }],
      packContents: ["2 colonnes au choix", "2 grandes compositions florales blanches"],
      packLimit: 1,
    },
    {
      id: "colonnes-boules-fleurs-vives-55",
      name: "2 colonnes avec boules de fleurs vives — 55 cm",
      price: 69,
      dimensions: ["Boules : 55 cm"],
      colors: ["Colonnes dorées ou transparentes", "Fleurs orange et fuchsia"],
      variants: [{ id: "dore", name: "Colonnes dorées", price: 69 }, { id: "transparent", name: "Colonnes transparentes", price: 69 }],
      packContents: ["2 colonnes au choix", "2 boules de fleurs orange et fuchsia"],
      packLimit: 1,
    },
    {
      id: "colonnes-boules-fleurs-rouges-blanches-35",
      name: "2 colonnes avec boules de fleurs rouges et blanches — 35 cm",
      price: 39,
      dimensions: ["Boules : 35 cm"],
      colors: ["Colonnes dorées ou transparentes", "Fleurs rouges et blanches"],
      variants: [{ id: "dore", name: "Colonnes dorées", price: 39 }, { id: "transparent", name: "Colonnes transparentes", price: 39 }],
      packContents: ["2 colonnes au choix", "2 boules de fleurs rouges et blanches"],
      packLimit: 1,
    },
    {
      id: "colonnes-boules-gypsophile-35",
      name: "2 colonnes avec boules de gypsophile — 35 cm",
      price: 39,
      dimensions: ["Boules : 35 cm"],
      colors: ["Colonnes dorées ou transparentes", "Gypsophile"],
      variants: [{ id: "dore", name: "Colonnes dorées", price: 39 }, { id: "transparent", name: "Colonnes transparentes", price: 39 }],
      packContents: ["2 colonnes au choix", "2 boules de gypsophile"],
      packLimit: 1,
    },
    {
      id: "colonnes-boules-rose-champagne-45",
      name: "2 colonnes avec boules de fleurs roses et champagne — 45 cm",
      price: 39,
      dimensions: ["Boules : 45 cm"],
      colors: ["Colonnes dorées ou transparentes", "Fleurs roses et champagne"],
      variants: [{ id: "dore", name: "Colonnes dorées", price: 39 }, { id: "transparent", name: "Colonnes transparentes", price: 39 }],
      packContents: ["2 colonnes au choix", "2 boules de fleurs roses et champagne"],
      packLimit: 1,
    },
    {
      id: "supports-chandeliers-cristal-100",
      name: "2 supports avec chandeliers en cristal — 100 cm",
      price: 109,
      dimensions: ["Hauteur : 100 cm"],
      packContents: ["2 supports", "2 chandeliers en cristal"],
      packLimit: 1,
    },
    { id: "arche-fleurie-alba", name: "Arche fleurie Alba", price: 175, description: "Fleurs incluses.", featured: true },
    { id: "lustre", name: "Lustre", price: 50 },
    { id: "chandelier-cristal-dore-structure", name: "Chandelier en cristal doré avec structure", price: 45, colors: ["Doré"] },
    { id: "deux-chandeliers-cristal-dore-structure", name: "2 chandeliers en cristal doré avec structure", price: 80, colors: ["Doré"], packContents: ["2 chandeliers en cristal doré avec structure"], packLimit: 1 },
    { id: "grand-chandelier-oriental", name: "Grand chandelier oriental", price: 40 },
    { id: "deux-grands-chandeliers-orientaux", name: "2 grands chandeliers orientaux", price: 75, packContents: ["2 grands chandeliers orientaux"], packLimit: 1 },
    { id: "chandelier-dore-120", name: "Chandelier doré — 1,20 m", price: 18, dimensions: ["Hauteur : 1,20 m"], colors: ["Doré"] },
    { id: "deux-chandeliers-dores-120", name: "2 chandeliers dorés — 1,20 m", price: 30, dimensions: ["Hauteur : 1,20 m"], colors: ["Doré"], packContents: ["2 chandeliers dorés de 1,20 m"], packLimit: 1 },
    { id: "neon-better-together", name: "Néon Better Together", price: 22 },
    { id: "podium-lumineux-fleuri", name: "Podium lumineux fleuri — 60 × 60 cm", price: 25, dimensions: ["60 × 60 cm"], maxQuantity: 8 },
    { id: "moquette-blanche-3m", name: "Moquette blanche — 3 m", price: 18, dimensions: ["Longueur : 3 m"], colors: ["Blanc"] },
    { id: "tables-basses-gigognes", name: "Tables basses gigognes", price: 30 },
  ]),
  productGroup("fleurs", [
    { id: "chemin-floral-blanc-2m", name: "Chemin floral blanc — 2 m × 40 cm", price: 45, dimensions: ["2 m × 40 cm"], colors: ["Blanc"] },
    { id: "chemin-floral-rouge-2m", name: "Chemin floral rouge — 2 m × 40 cm", price: 45, dimensions: ["2 m × 40 cm"], colors: ["Rouge"] },
    { id: "chemin-floral-rose-2m", name: "Chemin floral rose — 2 m × 40 cm", price: 45, dimensions: ["2 m × 40 cm"], colors: ["Rose"] },
    { id: "chemin-floral-nature-2m", name: "Chemin floral nature — vert et blanc — 2 m × 40 cm", price: 45, dimensions: ["2 m × 40 cm"], colors: ["Vert", "Blanc"] },
    { id: "chemin-floral-blanc-1m", name: "Chemin floral blanc — 1 m × 40 cm", price: 25, dimensions: ["1 m × 40 cm"], colors: ["Blanc"] },
    { id: "chemin-floral-rouge-1m", name: "Chemin floral rouge — 1 m × 40 cm", price: 25, dimensions: ["1 m × 40 cm"], colors: ["Rouge"] },
    { id: "chemin-floral-rose-1m", name: "Chemin floral rose — 1 m × 40 cm", price: 25, dimensions: ["1 m × 40 cm"], colors: ["Rose"] },
    { id: "chemin-floral-nature-1m", name: "Chemin floral nature — 1 m × 40 cm", price: 25, dimensions: ["1 m × 40 cm"], colors: ["Vert", "Blanc"] },
    { id: "chemin-floral-1m-25", name: "Chemin floral — 1 m × 25 cm", price: 12, dimensions: ["1 m × 25 cm"] },
  ]),
  productGroup("accessoires", [
    { id: "bougie-conique-blanche", name: "Bougie conique blanche", price: 0.4, colors: ["Blanc"] },
    { id: "bougie-led-blanche", name: "Bougie LED blanche", price: 1.9, colors: ["Blanc"] },
    { id: "lettre-doree-25", name: "Lettre dorée — 25 cm", price: 1.2, priceUnit: "Par unité — type et durée à confirmer", dimensions: ["Hauteur : 25 cm"], colors: ["Doré"], description: "Montant indiqué à l’unité dans le document source." },
    { id: "papillon-lumineux", name: "Papillon lumineux", price: 28 },
    {
      id: "grand-noeud-decoration-rose-blanc",
      name: "Grand nœud de décoration — 80 cm × 4 m",
      price: 10,
      dimensions: ["80 cm × 4 m"],
      colors: ["Rose", "Blanc"],
      description: "Couleur au choix.",
      variants: [
        { id: "rose", name: "Rose", price: 10 },
        { id: "blanc", name: "Blanc", price: 10 },
      ],
    },
    { id: "grand-noeud-rouge", name: "Grand nœud rouge — 50 cm × 3 m", price: 8, dimensions: ["50 cm × 3 m"], colors: ["Rouge"] },
  ]),
  productGroup("autres-decoration", [
    { id: "voilage-arche-ovale-2m", name: "Voilage de fond pour arche ovale — 2 m", price: 8, dimensions: ["Pour arche de 2 m"], colors: ["Blanc", "Beige", "Rose", "Noir", "Rouge", "Bleu"], description: "Couleur au choix.", variants: ["blanc", "beige", "rose", "noir", "rouge", "bleu"].map((color) => ({ id: color, name: color[0].toUpperCase() + color.slice(1), price: 8 })) },
    { id: "voilage-arche-ronde-blanc", name: "Voilage de fond blanc pour arche ronde", price: 12, colors: ["Blanc"] },
    { id: "panneaux-dores-pack-4", name: "Panneaux dorés — lot de 4", price: 3, colors: ["Doré"], packContents: ["4 panneaux dorés"] },
    { id: "presentoirs-cylindriques-blancs-pack-5", name: "5 présentoirs cylindriques blancs", price: 69, dimensions: ["Hauteurs : 90, 75, 60, 55 et 50 cm"], colors: ["Blanc"], packContents: ["5 présentoirs cylindriques blancs"] },
    { id: "presentoirs-cylindriques-blancs-triple", name: "Triple présentoir cylindrique blanc", price: 49, dimensions: ["Hauteurs : 90, 75 et 55 cm"], colors: ["Blanc"], packContents: ["3 présentoirs cylindriques blancs"] },
    { id: "presentoirs-cylindriques-blancs-double", name: "Double présentoir cylindrique blanc", price: 29, dimensions: ["Hauteurs : 75 et 60 cm"], colors: ["Blanc"], packContents: ["2 présentoirs cylindriques blancs"] },
    { id: "presentoir-cylindrique-blanc-75", name: "Présentoir cylindrique blanc — 75 cm", price: 18, dimensions: ["Hauteur : 75 cm"], colors: ["Blanc"] },
    { id: "neon-happy-birthday", name: "Néon Happy Birthday", price: 12 },
  ]),
  productGroup("buffet", [
    { id: "cubes-blancs-grands-pack-5", name: "5 grands cubes blancs — plusieurs tailles", price: 50, description: "Dimensions individuelles à préciser.", colors: ["Blanc"], packContents: ["5 grands cubes blancs de tailles diverses"] },
    { id: "cubes-blancs-grands-pack-10", name: "10 grands cubes blancs — plusieurs tailles", price: 100, description: "Dimensions individuelles à préciser.", colors: ["Blanc"], packContents: ["10 grands cubes blancs de tailles diverses"] },
    { id: "distributeur-boisson-2l", name: "Distributeur de boisson — 2 L", price: 10, dimensions: ["Contenance : 2 L"] },
    { id: "fontaine-jus-lumineuse", name: "Fontaine à jus lumineuse", price: 18 },
  ]),
  productGroup("coin-mariee", [
    { id: "coin-elena", name: "Coin Elena", price: 190, colors: ["Rouge"], description: "Une déclinaison rouge est indiquée dans le document source." },
    { id: "coin-miranda", name: "Coin Miranda", price: 190 },
    { id: "coin-elise", name: "Coin Elise", price: 310, description: "Disponible avec fleurs blanches." },
    { id: "coin-beaute", name: "Coin Beauty Heart", price: 320, description: "Disponible aussi en blanc." },
    { id: "coin-lilas", name: "Coin Lilas", price: 360 },
    { id: "coin-tiffany", name: "Coin Tiffany", price: 410 },
    { id: "coin-oriental", name: "Coin Oriental", price: 490 },
    { id: "coin-milana", name: "Coin Milana", price: 490 },
  ]),
];

const sourcePricingNote =
  "Montant repris du document client L.odt. Les informations commerciales sont à confirmer avant confirmation définitive du devis.";

const generatedIllustrations: Record<string, { src: string; alt: string }> = {
  "nappe-rectangulaire-400": {
    src: "/images/products/illustration-nappe-rectangulaire.svg",
    alt: "Illustration générée d’une nappe de table rectangulaire blanche",
  },
  "chemin-gaze-coton": {
    src: "/images/products/illustration-chemin-gaze-coton.svg",
    alt: "Illustration générée d’un chemin de table en gaze de coton",
  },
  "serviette-tissu-blanche": {
    src: "/images/products/illustration-serviette-blanche.svg",
    alt: "Illustration générée d’une serviette en tissu blanche",
  },
  "serviette-tissu-vert-sauge": {
    src: "/images/products/illustration-serviette-vert-sauge.svg",
    alt: "Illustration générée d’une serviette en tissu vert sauge",
  },
  soliflore: {
    src: "/images/products/illustration-soliflore.svg",
    alt: "Illustration générée d’un soliflore",
  },
  "soliflore-fleurs-artificielles": {
    src: "/images/products/illustration-soliflore-fleurs.svg",
    alt: "Illustration générée d’un soliflore avec fleurs artificielles",
  },
  "moquette-blanche-3m": {
    src: "/images/products/illustration-moquette-blanche.svg",
    alt: "Illustration générée d’une moquette blanche de 3 mètres",
  },
  "bougie-conique-blanche": {
    src: "/images/products/illustration-bougie-conique.svg",
    alt: "Illustration générée d’une bougie conique blanche",
  },
};

function toProduct(input: ProductInput, category: string, displayOrder: number): CatalogProduct {
  const variants = (input.variants ?? []).map((variant) => ({
    ...variant,
    displayPrice: variant.displayPrice ?? null,
  }));
  const generatedIllustration = generatedIllustrations[input.id];
  return {
    id: input.id,
    slug: input.id,
    name: input.name,
    category,
    description: input.description ?? "Référence du catalogue — détails à confirmer.",
    price: input.price,
    priceUnit: input.priceUnit ?? (input.packContents?.length
      ? "Prix du pack — type et durée à confirmer"
      : "Unité, type et durée à confirmer"),
    pricingStatus: input.pricingStatus ?? (input.price === null && variants.length === 0 ? "unpriced" : "to_confirm"),
    displayPrice: input.displayPrice ?? null,
    pricingNotes: sourcePricingNote,
    dimensions: input.dimensions ?? [],
    colors: input.colors ?? [],
    variants,
    packContents: input.packContents ?? [],
    packLimit: input.packLimit ?? null,
    maxQuantity: input.maxQuantity ?? null,
    image: generatedIllustration
      ? { src: generatedIllustration.src, alt: generatedIllustration.alt, isPlaceholder: true }
      : {
          src: "/images/products/placeholder.svg",
          alt: `Emplacement photo à fournir : ${input.name}`,
          isPlaceholder: true,
        },
    gallery: [],
    availability: "to_confirm",
    isFeatured: input.featured ?? false,
    isActive: true,
    displayOrder,
  };
}

export const catalogProducts: CatalogProduct[] = groups.flatMap((group) =>
  group.items.map((item, index) => toProduct(item, group.category, index + 1)),
);

export const catalogSettings = {
  displayPricesPublicly: false,
  sourceDocument: "L.odt",
  pricingNotice: "Tarifs et unités à valider avant confirmation de votre devis.",
};

export const activeCatalogProducts = catalogProducts.filter((product) => product.isActive);
export const featuredProducts = activeCatalogProducts.filter((product) => product.isFeatured);

export function getCatalogProduct(productId: string): CatalogProduct | undefined {
  return catalogProducts.find((product) => product.id === productId);
}

export function getDisplayPrice(product: CatalogProduct, variantId?: string | null): string | null {
  if (product.pricingStatus !== "confirmed") {
    return null;
  }
  const variant = variantId ? product.variants.find((item) => item.id === variantId) : undefined;
  if (variantId && !variant) return null;
  if (variant?.displayPrice) return variant.displayPrice;
  if (variantId && variant?.price === null) return null;
  if (product.displayPrice) return product.displayPrice;
  const price = variantId ? variant?.price : product.price;
  return price === null || price === undefined
    ? null
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(price);
}

export function categoryProductCounts(): Map<string, number> {
  return new Map(
    catalogCategories.map((category) => [
      category.id,
      activeCatalogProducts.filter((product) => product.category === category.id).length,
    ]),
  );
}
