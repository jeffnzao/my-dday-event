update public.products
set is_active = false,
    updated_at = now()
where lower(name) like '%rideau lumineux bleu roi%'
   or id = 'rideaux-lumineux-bleu-roi-3m';

update public.products set description = 'Uniquement l’arche.', updated_at = now()
where id in (
  'arche-ronde-doree', 'arche-ronde-blanche', 'arche-carree-blanche',
  'arche-carree-doree', 'arche-romantique-doree', 'arche-coeur',
  'arche-nuptiale-260', 'arche-cathedrale-200', 'arche-cathedrale-240',
  'arche-elegante', 'arche-hexagone-bois'
);

update public.products set price = 80, updated_at = now()
where id = 'tapis-ceremonie-rouge-30m';

update public.products set price = 6, updated_at = now()
where id in ('chemin-mousseline-rose-peche', 'chemin-mousseline-rose-clair');

update public.products set price = 190, variants = '[{"id":"avec-lumiere","name":"Avec lumière","price":190,"displayPrice":null},{"id":"sans-lumiere","name":"Sans lumière","price":190,"displayPrice":null}]'::jsonb,
description = 'Uniquement les panneaux.', pack_limit = 1, updated_at = now()
where id = 'trio-panneaux-luxe-blanc';

update public.products set price = 39, variants = jsonb_build_array(
  jsonb_build_object('id','dore','name','Colonnes dorées','price',39,'displayPrice',null),
  jsonb_build_object('id','transparent','name','Colonnes transparentes','price',39,'displayPrice',null)
), updated_at = now()
where id in ('colonnes-boules-fleurs-rouges-blanches-35', 'colonnes-boules-gypsophile-35');

update public.products set price = 30, pack_contents = '["2 chandeliers dorés de 1,20 m"]'::jsonb,
pack_limit = 1, updated_at = now()
where id = 'deux-chandeliers-dores-120';

update public.products set price = 150, updated_at = now()
where id = 'canape-beige';

update public.products set price = 9, description = 'Double face doré et miroir.', updated_at = now()
where id = 'miroir-centre-table-plexiglas-50';
update public.products set price = 3.9, updated_at = now()
where id = 'lampe-doree';
update public.products set price = 0.3, updated_at = now()
where id = 'rond-serviette-dore';
update public.products set price = 4.5, pack_contents = '["3 bougeoirs transparents"]'::jsonb,
description = 'Lot de 3 bougeoirs transparents. Plusieurs tailles.', updated_at = now()
where id = 'bougeoir-transparent-tailles';
update public.products set price = 3.6, pack_contents = '["3 bougeoirs dorés"]'::jsonb,
description = 'Lot de 3 bougeoirs dorés. Plusieurs tailles.', updated_at = now()
where id = 'bougeoir-dore-tailles';
update public.products set price = 6, pack_contents = '["3 vases cylindriques en verre"]'::jsonb,
description = 'Lot de 3 vases cylindriques en verre. Plusieurs tailles.', updated_at = now()
where id = 'vase-cylindrique-verre-tailles';
update public.products set price = 1.1, updated_at = now()
where id = 'vase-boheme-elance';

update public.products set image = '{"src":"/images/products/illustration-nappe-rectangulaire.svg","alt":"Illustration générée d’une nappe de table rectangulaire blanche","isPlaceholder":true}'::jsonb, updated_at = now()
where id = 'nappe-rectangulaire-400';
update public.products set image = '{"src":"/images/products/illustration-chemin-gaze-coton.svg","alt":"Illustration générée d’un chemin de table en gaze de coton","isPlaceholder":true}'::jsonb, updated_at = now()
where id = 'chemin-gaze-coton';
update public.products set image = '{"src":"/images/products/illustration-serviette-blanche.svg","alt":"Illustration générée d’une serviette en tissu blanche","isPlaceholder":true}'::jsonb, updated_at = now()
where id = 'serviette-tissu-blanche';
update public.products set image = '{"src":"/images/products/illustration-serviette-vert-sauge.svg","alt":"Illustration générée d’une serviette en tissu vert sauge","isPlaceholder":true}'::jsonb, updated_at = now()
where id = 'serviette-tissu-vert-sauge';
update public.products set image = '{"src":"/images/products/illustration-soliflore.svg","alt":"Illustration générée d’un soliflore","isPlaceholder":true}'::jsonb, updated_at = now()
where id = 'soliflore';
update public.products set image = '{"src":"/images/products/illustration-soliflore-fleurs.svg","alt":"Illustration générée d’un soliflore avec fleurs artificielles","isPlaceholder":true}'::jsonb, updated_at = now()
where id = 'soliflore-fleurs-artificielles';
update public.products set image = '{"src":"/images/products/illustration-moquette-blanche.svg","alt":"Illustration générée d’une moquette blanche de 3 mètres","isPlaceholder":true}'::jsonb, updated_at = now()
where id = 'moquette-blanche-3m';
update public.products set image = '{"src":"/images/products/illustration-bougie-conique.svg","alt":"Illustration générée d’une bougie conique blanche","isPlaceholder":true}'::jsonb, updated_at = now()
where id = 'bougie-conique-blanche';

update public.products set price = 69, dimensions = '["Hauteurs : 90, 75, 60, 55 et 50 cm"]'::jsonb,
pack_contents = '["5 présentoirs cylindriques blancs"]'::jsonb, pack_limit = null, updated_at = now()
where id = 'presentoirs-cylindriques-blancs-pack-5';
update public.products set price = 49, dimensions = '["Hauteurs : 90, 75 et 55 cm"]'::jsonb,
pack_contents = '["3 présentoirs cylindriques blancs"]'::jsonb, pack_limit = null, updated_at = now()
where id = 'presentoirs-cylindriques-blancs-triple';
update public.products set price = 29, dimensions = '["Hauteurs : 75 et 60 cm"]'::jsonb,
pack_contents = '["2 présentoirs cylindriques blancs"]'::jsonb, pack_limit = null, updated_at = now()
where id = 'presentoirs-cylindriques-blancs-double';

update public.products set price = 40, description = 'Uniquement le panneau.', pack_limit = 1, updated_at = now()
where id = 'panneau-blanc-ouvert';

update public.products set price = 360, updated_at = now()
where id = 'coin-lilas';

update public.products
set name = 'Coin Beauty Heart',
    description = 'Disponible aussi en blanc.',
    updated_at = now()
where id = 'coin-beaute';

update public.products
set description = 'Disponible avec fleurs blanches.',
    updated_at = now()
where id = 'coin-elise';

insert into public.products (
  id, slug, name, category, description, price, price_unit, pricing_status,
  display_price, pricing_notes, dimensions, colors, variants, pack_contents,
  pack_limit, max_quantity, image, gallery, is_featured, is_active, display_order
) values
  ('arche-hexagone-bois','arche-hexagone-bois','Arche hexagonale en bois','salle-ceremonie','Uniquement l’arche.',40,'Unité, type et durée à confirmer','to_confirm',null,'Montant repris du document client L.odt.','[]','[]','[]','[]',null,null,'{"src":"/images/products/placeholder.svg","alt":"Emplacement photo à fournir : Arche hexagonale en bois","isPlaceholder":true}'::jsonb,'[]',false,true,22),
  ('nappe-ronde-elegante-marie','nappe-ronde-elegante-marie','Nappe de table ronde élégante pour table marié','tables','Référence du catalogue — détails à confirmer.',15,'Unité, type et durée à confirmer','to_confirm',null,'Montant repris du document client L.odt.','[]','["Blanc"]','[]','[]',null,null,'{"src":"/images/products/placeholder.svg","alt":"Emplacement photo à fournir : Nappe de table ronde élégante pour table marié","isPlaceholder":true}'::jsonb,'[]',false,true,34),
  ('nappe-rectangulaire-elegante-marie','nappe-rectangulaire-elegante-marie','Nappe de table rectangulaire élégante pour table marié','tables','Référence du catalogue — détails à confirmer.',18,'Unité, type et durée à confirmer','to_confirm',null,'Montant repris du document client L.odt.','[]','["Blanc"]','[]','[]',null,null,'{"src":"/images/products/placeholder.svg","alt":"Emplacement photo à fournir : Nappe de table rectangulaire élégante pour table marié","isPlaceholder":true}'::jsonb,'[]',false,true,35),
  ('chemin-satin-rouge','chemin-satin-rouge','Chemin de table en satin rouge','tables','Référence du catalogue — détails à confirmer.',3,'Unité, type et durée à confirmer','to_confirm',null,'Montant repris du document client L.odt.','[]','["Rouge"]','[]','[]',null,null,'{"src":"/images/products/placeholder.svg","alt":"Emplacement photo à fournir : Chemin de table en satin rouge","isPlaceholder":true}'::jsonb,'[]',false,true,36),
  ('vase-boheme-elance','vase-boheme-elance','Vase bohème élancé','tables','Référence du catalogue — détails à confirmer.',1.1,'Unité, type et durée à confirmer','to_confirm',null,'Montant repris du document client L.odt.','[]','[]','[]','[]',null,null,'{"src":"/images/products/placeholder.svg","alt":"Emplacement photo à fournir : Vase bohème élancé","isPlaceholder":true}'::jsonb,'[]',false,true,37),
  ('panneau-blanc-ouvert','panneau-blanc-ouvert','Panneau blanc ouvert','coin-photo','Uniquement le panneau.',40,'Prix du pack — type et durée à confirmer','to_confirm',null,'Montant repris du document client L.odt.','[]','["Blanc"]','[]','["1 panneau blanc ouvert"]',1,null,'{"src":"/images/products/placeholder.svg","alt":"Emplacement photo à fournir : Panneau blanc ouvert","isPlaceholder":true}'::jsonb,'[]',false,true,38),
  ('pouf','pouf','Pouf','chaises-assises','Référence du catalogue — détails à confirmer.',10,'Unité, type et durée à confirmer','to_confirm',null,'Montant repris du document client L.odt.','[]','[]','[]','[]',null,null,'{"src":"/images/products/placeholder.svg","alt":"Emplacement photo à fournir : Pouf","isPlaceholder":true}'::jsonb,'[]',false,true,7)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  category = excluded.category,
  description = excluded.description,
  price = excluded.price,
  price_unit = excluded.price_unit,
  pricing_status = excluded.pricing_status,
  display_price = excluded.display_price,
  pricing_notes = excluded.pricing_notes,
  dimensions = excluded.dimensions,
  colors = excluded.colors,
  variants = excluded.variants,
  pack_contents = excluded.pack_contents,
  pack_limit = excluded.pack_limit,
  max_quantity = excluded.max_quantity,
  image = excluded.image,
  gallery = excluded.gallery,
  is_featured = excluded.is_featured,
  is_active = true,
  display_order = excluded.display_order,
  updated_at = now();
