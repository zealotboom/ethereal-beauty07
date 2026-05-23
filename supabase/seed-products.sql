insert into public.products (name, description, price, sale_price, category, images, sizes, colors, stock, tags, is_active)
select
  'Ethereal Sample Piece ' || n,
  'A luxury editorial garment seeded for development, with dark-house styling and AI-search-friendly tags.',
  140 + (n * 7),
  case when n % 7 = 0 then 120 + (n * 6) else null end,
  (array['Dresses','Tailoring','Knitwear','Outerwear','Separates'])[1 + (n % 5)],
  array[
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80'
  ],
  array['XS','S','M','L','XL'],
  array['#080808','#C9A84C','#F0EDE6'],
  5 + n,
  array['luxury','evening','structured','warm tone'],
  true
from generate_series(1, 50) as n;
