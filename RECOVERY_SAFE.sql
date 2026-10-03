-- SAFE RECOVERY: does not delete products, orders or settings.
-- Adds the three original catalog products only when their articles are missing.
INSERT INTO products (id, article, name, category, price, sizes_json, description, image, active, colors_json, images_json, size_stock_json, old_price, is_new, is_hit)
SELECT COALESCE((SELECT MAX(id)+1 FROM products),1), '1083640', 'Костюм 1083640', 'Костюмы', 0, '["M","L","XL"]', 'Стильный женский костюм из мягкого трикотажа. Комплект состоит из кофты с высоким воротником и брюк. Цвет — чёрный.', 'images/product-1.png', 1, '[]', '["images/product-1.png"]', '{"M":true,"L":true,"XL":true}', 0, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE article='1083640');

INSERT INTO products (id, article, name, category, price, sizes_json, description, image, active, colors_json, images_json, size_stock_json, old_price, is_new, is_hit)
SELECT COALESCE((SELECT MAX(id)+1 FROM products),1), '1084438', 'Костюм 1084438', 'Костюмы', 0, '["M","L","XL"]', 'Уютный трикотажный костюм в тёплом оттенке. Свободный крой, мягкая фактура и удобная посадка.', 'images/product-2.png', 1, '[]', '["images/product-2.png"]', '{"M":true,"L":true,"XL":true}', 0, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE article='1084438');

INSERT INTO products (id, article, name, category, price, sizes_json, description, image, active, colors_json, images_json, size_stock_json, old_price, is_new, is_hit)
SELECT COALESCE((SELECT MAX(id)+1 FROM products),1), '1079433', 'Платье 1079433', 'Платья', 0, '["M","L","XL"]', 'Трикотажное платье с высоким воротником. В наличии несколько цветовых вариантов. Уточняйте актуальные размеры.', 'images/product-3.png', 1, '[]', '["images/product-3.png"]', '{"M":true,"L":true,"XL":true}', 0, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM products WHERE article='1079433');
