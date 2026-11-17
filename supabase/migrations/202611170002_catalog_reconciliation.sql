update public.products
set is_active = false,
    updated_at = now()
where lower(name) in (
  'urne de mariage',
  'colonne cannelée',
  'lanterne de sol',
  'composition d''allée ancienne',
  'nappe satinée',
  'vase boule',
  'présentoir à gâteau',
  'chaise médaillon',
  'chaise transparente',
  'bouquet de fleurs',
  'panier à pétales',
  'support de signalisation',
  'rideau de perle',
  'rideau de perles',
  'néon just married',
  'banquette ivoire',
  'fauteuil bouclé',
  'tapis rond',
  'lettrage love'
);

update public.products
set name = 'Trio de panneaux Luxe blancs double face (avec et sans lumière)',
    description = 'Panneaux uniquement.',
    category = 'coin-photo',
    price = 200,
    price_unit = 'Prix du pack — type et durée à confirmer',
    pricing_status = 'to_confirm',
    display_price = null,
    pricing_notes = 'Montant repris de ENTREE.odt. Le document ne précise pas s’il s’agit d’un tarif de location ou d’achat, ni sa durée ou son unité ; confirmation requise avant affichage public ou calcul de devis.',
    variants = '[
      {"id":"avec-lumiere","name":"Avec lumière","price":200,"displayPrice":null},
      {"id":"sans-lumiere","name":"Sans lumière","price":200,"displayPrice":null}
    ]'::jsonb,
    pack_contents = '["3 panneaux blancs Luxe double face"]'::jsonb,
    pack_limit = 1,
    is_active = true,
    updated_at = now()
where id = 'trio-panneaux-luxe-blanc';
