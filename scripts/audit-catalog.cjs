const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  module._compile(result.outputText, filename);
};

const root = path.join(__dirname, "..");
const { catalogCategories } = require(path.join(root, "lib", "catalog", "categories.ts"));
const { catalogProducts, catalogSettings } = require(path.join(root, "lib", "catalog", "products.ts"));
const { productFromDatabaseRow, productToDatabaseRow } = require(path.join(root, "lib", "catalog", "database.ts"));
const reconciliationMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "202611170002_catalog_reconciliation.sql"),
  "utf8",
).toLocaleLowerCase("fr");

const expectedCounts = new Map([
  ["entree-accueil", 7],
  ["salle-ceremonie", 21],
  ["allee-centrale", 6],
  ["tables", 35],
  ["chaises-assises", 7],
  ["coin-photo", 26],
  ["fleurs", 9],
  ["accessoires", 6],
  ["autres-decoration", 8],
  ["buffet", 4],
  ["coin-mariee", 8],
]);
const removedProducts = [
  "rideau lumineux bleu roi",
  "urne de mariage",
  "colonne cannelée",
  "lanterne de sol",
  "composition d'allée ancienne",
  "nappe satinée",
  "vase boule",
  "présentoir à gâteau",
  "chaise médaillon",
  "chaise transparente",
  "bouquet de fleurs",
  "panier à pétales",
  "support de signalisation",
  "rideau de perle",
  "néon just married",
  "banquette ivoire",
  "fauteuil bouclé",
  "tapis rond",
  "lettrage love",
];

assert.equal(catalogCategories.length, 11, "Les 11 catégories demandées doivent être présentes.");
assert.equal(
  catalogCategories.find((category) => category.id === "accessoires")?.name,
  "Les accessoires et les finitions",
  "Le libellé actualisé de la catégorie doit être présent.",
);
assert.equal(catalogProducts.length, 137, "Toutes les références du catalogue L.odt doivent être intégrées.");
assert.equal(new Set(catalogCategories.map((category) => category.id)).size, catalogCategories.length);
assert.equal(new Set(catalogProducts.map((product) => product.id)).size, catalogProducts.length);
assert.deepEqual(
  new Set(catalogProducts.map((product) => product.category)),
  new Set(expectedCounts.keys()),
  "Chaque produit doit être rangé dans une catégorie connue.",
);

for (const [categoryId, expectedCount] of expectedCounts) {
  const products = catalogProducts.filter((product) => product.category === categoryId);
  assert.equal(products.length, expectedCount, `Nombre de références inattendu pour ${categoryId}.`);
}

for (const product of catalogProducts) {
  assert.ok(product.slug && product.name && product.description, `Informations manquantes : ${product.id}`);
  assert.ok(product.isActive, `Un produit de la source ne doit pas être inactif : ${product.id}`);
  assert.equal(product.image.isPlaceholder, true, `Le statut visuel doit rester explicite : ${product.id}`);
  assert.ok(product.image.src && product.image.alt);
  if (product.image.src.includes("illustration-")) {
    assert.match(product.image.alt, /Illustration générée/);
  }
  assert.equal(product.displayPrice, null, `Un prix ne doit pas être affiché avant confirmation : ${product.id}`);
  assert.equal(product.pricingStatus, "to_confirm", `Le statut tarifaire doit rester à confirmer : ${product.id}`);
  assert.ok(product.price === null || (Number.isFinite(product.price) && product.price >= 0));
  assert.ok(product.priceUnit.includes("confirmer"));
  assert.ok(product.pricingNotes.includes("L.odt"));
  if (product.packLimit !== null) assert.ok(product.packLimit > 0);
  if (product.maxQuantity !== null) assert.ok(product.maxQuantity > 0);
  if (product.category === "coin-photo" && product.packContents.length > 0) {
    assert.equal(product.packLimit, 1, `Le pack photo doit être limité à un exemplaire : ${product.id}`);
  }
}

for (const product of catalogProducts) {
  const text = `${product.name} ${product.description}`.toLocaleLowerCase("fr");
  for (const removed of removedProducts) {
    assert.ok(!text.includes(removed), `Produit explicitement supprimé encore présent : ${removed}`);
  }
}

const seasonalCompositions = catalogProducts.filter((product) =>
  product.id.startsWith("composition-centre-table-"),
);
assert.equal(seasonalCompositions.length, 4);
assert.equal(
  seasonalCompositions.reduce((total, product) => total + product.variants.length, 0),
  8,
  "Les quatre saisons doivent chacune proposer les deux dimensions tarifées.",
);
for (const product of seasonalCompositions) {
  assert.deepEqual(product.variants.map((variant) => [variant.dimensions, variant.price]), [
    ["40 cm", 15],
    ["50 cm", 28],
  ]);
}
const totalVariants = catalogProducts.reduce((total, product) => total + product.variants.length, 0);
assert.equal(totalVariants, 32, "Toutes les options de couleurs, finitions, éclairages et tailles restantes doivent être structurées.");
assert.equal(catalogProducts.filter((product) => product.price !== null).length, 133);
assert.equal(
  catalogProducts.reduce((total, product) => total + product.variants.filter((variant) => variant.price !== null).length, 0),
  32,
  "Les montants des variantes doivent être conservés dans le catalogue privé.",
);

const podium = catalogProducts.find((product) => product.id === "podium-lumineux-fleuri");
assert.equal(podium?.maxQuantity, 8, "La limite documentée des podiums fleuris doit être respectée.");
const panelTrio = catalogProducts.find((product) => product.id === "trio-panneaux-luxe-blanc");
assert.equal(panelTrio?.packLimit, 1, "Le trio de panneaux reste limité à un pack.");
assert.equal(
  panelTrio?.name,
  "Trio de panneaux Luxe blancs double face (avec et sans lumière)",
);
assert.deepEqual(
  panelTrio?.packContents,
  ["3 panneaux blancs Luxe double face"],
  "Le prix du trio concerne les panneaux uniquement.",
);
assert.deepEqual(
  panelTrio?.variants.map((variant) => [variant.id, variant.price]),
  [["avec-lumiere", 190], ["sans-lumiere", 190]],
  "Le trio doit conserver les choix avec et sans lumière au même tarif source.",
);
const aislePack = catalogProducts.find((product) => product.id === "pack-allee");
assert.deepEqual(aislePack?.packContents, ["1 arche dorée", "6 potelets", "6 boules de fleurs"]);
for (const product of catalogProducts) {
  if (product.packLimit !== null) {
    assert.equal(product.category, "coin-photo", `Une limite non indiquée dans la source a été ajoutée : ${product.id}`);
    assert.equal(product.packLimit, 1, `La limite des packs coin photo doit rester égale à un : ${product.id}`);
  }
}
const knownPrices = new Map([
  ["panneau-bienvenue-plexiglas-fleurs", 60],
  ["miroir-accueil-fleurs", 100],
  ["arche-nuptiale-260", 22],
  ["trio-panneaux-luxe-blanc", 190],
  ["pack-allee", 110],
  ["nappe-ronde-blanche-280", 9],
  ["bougie-led-blanche", 1.9],
  ["coin-milana", 490],
]);
for (const [productId, price] of knownPrices) {
  assert.equal(catalogProducts.find((product) => product.id === productId)?.price, price);
}
assert.equal(catalogSettings.displayPricesPublicly, false);
assert.match(reconciliationMigration, /where id = 'trio-panneaux-luxe-blanc'/);
assert.match(reconciliationMigration, /pricing_status = 'to_confirm'/);
assert.match(reconciliationMigration, /display_price = null/);
for (const removed of removedProducts) {
  const sqlName = removed.replaceAll("'", "''");
  assert.ok(reconciliationMigration.includes(`'${sqlName}'`), `La migration doit désactiver la référence retirée : ${removed}`);
}
for (const product of catalogProducts) {
  const databaseRow = productToDatabaseRow(product);
  const adminProduct = productFromDatabaseRow(databaseRow, true);
  const publicProduct = productFromDatabaseRow(databaseRow, false);
  assert.equal(adminProduct?.price, product.price, `L’administration doit conserver le tarif source : ${product.id}`);
  assert.deepEqual(adminProduct?.variants.map((variant) => variant.price), product.variants.map((variant) => variant.price));
  assert.equal(publicProduct?.price, null, `Un tarif non confirmé ne doit jamais être exposé publiquement : ${product.id}`);
  assert.ok(publicProduct?.variants.every((variant) => variant.price === null));
}

console.log(
  `Catalogue vérifié : ${catalogProducts.length} références, ${catalogCategories.length} catégories, ${totalVariants} variantes structurées, ${seasonalCompositions.reduce((total, product) => total + product.variants.length, 0)} variantes tarifées par saison et taille.`,
);
