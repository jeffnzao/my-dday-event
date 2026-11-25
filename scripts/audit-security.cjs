const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const migration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "202611170001_initial_schema.sql"),
  "utf8",
).toLowerCase();
const quoteRoute = fs.readFileSync(path.join(root, "app", "api", "quotes", "route.ts"), "utf8");
const serviceClient = fs.readFileSync(path.join(root, "lib", "supabase", "service.ts"), "utf8");
const cmsMigration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "202611250004_cms_owner_media.sql"),
  "utf8",
).toLowerCase();
const visualEditor = fs.readFileSync(
  path.join(root, "components", "admin", "VisualPageEditor.tsx"),
  "utf8",
);
const pageApi = fs.readFileSync(
  path.join(root, "app", "api", "admin", "pages", "route.ts"),
  "utf8",
);

for (const table of ["owner_users", "products", "requests", "request_items", "catalog_settings", "site_content", "quote_rate_limits"]) {
  assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`), `${table} must enable RLS`);
}

for (const status of ["new", "reviewing", "quote_sent", "confirmed", "declined", "cancelled"]) {
  assert.ok(migration.includes(`'${status}'`), `Request status ${status} must be present in the database constraint.`);
}

assert.match(migration, /revoke all on function public\.submit_quote\(jsonb\) from public/);
assert.match(migration, /grant execute on function public\.submit_quote\(jsonb\) to service_role/);
assert.match(migration, /revoke all on function public\.consume_quote_rate_limit\(text, text\) from public/);
assert.match(migration, /grant execute on function public\.consume_quote_rate_limit\(text, text\) to service_role/);
assert.match(migration, /case when s\.display_prices_publicly and p\.pricing_status = 'confirmed' then p\.price else null end/);
assert.match(migration, /case when s\.display_prices_publicly and p\.pricing_status = 'confirmed' then variants\.value->'price' else 'null'::jsonb end/);
assert.match(migration, /revoke all on public\.owner_users, public\.requests, public\.request_items, public\.catalog_settings, public\.site_content, public\.quote_rate_limits from anon, authenticated/);
assert.match(migration, /revoke all on public\.products from anon, authenticated/);
assert.match(migration, /grant select \([\s\S]*?\) on public\.products to anon, authenticated/);
assert.doesNotMatch(migration, /grant select, insert, update, delete on public\.products to authenticated/);
assert.doesNotMatch(migration, /grant (?:select|insert|update|delete)(?:, (?:select|insert|update|delete))* on public\.(?:requests|request_items|site_content|catalog_settings) to (?:anon|authenticated)/);
assert.doesNotMatch(migration, /grant insert on public\.requests, public\.request_items to anon/);
assert.match(migration, /using \(\(select public\.is_owner\(\)\)\)/);
assert.match(migration, /on delete set null/);
assert.match(migration, /on delete cascade/);
assert.match(serviceClient, /process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
assert.doesNotMatch(serviceClient, /NEXT_PUBLIC_SUPABASE_SERVICE/);
assert.match(fs.readFileSync(path.join(root, "lib", "supabase", "owner.ts"), "utf8"), /ownerIsAuthorized \? createSupabaseServiceClient\(\) : null/);
assert.match(fs.readFileSync(path.join(root, "lib", "supabase", "owner.ts"), "utf8"), /auth session missing/i);
assert.match(fs.readFileSync(path.join(root, "lib", "supabase", "owner.ts"), "utf8"), /hasOwnerRole/);
assert.match(quoteRoute, /requestOrigin !== trustedOrigin/);
assert.match(quoteRoute, /consume_quote_rate_limit/);
assert.match(quoteRoute, /submit_quote/);
assert.match(quoteRoute, /isText\(form\.first_name/);
assert.match(quoteRoute, /privacy_consent !== true/);
assert.match(quoteRoute, /quantity > 1000/);
assert.match(quoteRoute, /rawLimit = product\.pack_limit \?\? product\.max_quantity/);
assert.match(quoteRoute, /total > limit/);
assert.match(cmsMigration, /create table if not exists public\.media_assets/);
assert.match(cmsMigration, /create table if not exists public\.site_pages/);
assert.match(cmsMigration, /create table if not exists public\.galleries/);
assert.match(cmsMigration, /alter table public\.media_assets enable row level security/);
assert.match(cmsMigration, /allowed_mime_types/);
assert.match(visualEditor, /Bannière principale/);
assert.doesNotMatch(visualEditor, /Contenu JSON structuré/);
assert.match(pageApi, /allowedBlockTypes/);
assert.match(pageApi, /validPageContent/);

console.log("Contrôles statiques de sécurité réussis : RLS, privilèges RPC, secret serveur, validation serveur et limite de soumission.");
