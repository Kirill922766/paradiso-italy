INSERT OR REPLACE INTO admin (id, password_hash) VALUES (1, '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');

INSERT OR REPLACE INTO settings (key, value) VALUES
('shopName', 'PARADISO'),
('tagline', 'Made & ITALY'),
('phone', '+380639472122'),
('phoneName', 'Елена'),
('telegram', 'https://t.me/paradiso1315italy'),
('viber', 'https://invite.viber.com/?g2=AQAaFlZKJwain0jOo%2B6nfN8kelZZqSA0ycoe%2BQpfwQRMB5tmuHSVQerrd1BGEIQ4&utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAb21jcAUpu7lleHRuA2FlbQIxMQBwZG9mAnNydGMGYXBwX2lkDzU2NzA2NzM0MzM1MjQyNwABp_L_ZPb5Q8zkA1nYILeeQh4yWsitw63aXsKdTNwzI2bA1N_zrfPEmXDSsMKN_aem_bqlVKhhtgvYl_oqlfEfmKw&lang=uk'),
('phone2', '+380631030364'),
('phone2Name', 'Светлана'),
('address', '7 км, Розовая 1315–1316'),
('deliveryNote', 'Доставка Новой Почтой по Украине.'),
('pickupNote', 'Самовывоз: 7 км, Розовая 1315–1316.');

INSERT OR REPLACE INTO products (id, article, name, category, price, sizes_json, description, image, active) VALUES
(1, '1083640', 'Костюм 1083640', 'Костюмы', 0, '["42","44","46","48","50"]', 'Стильный женский костюм из мягкого трикотажа. Комплект состоит из кофты с высоким воротником и брюк. Цвет — чёрный.', 'images/product-1.png', 1),
(2, '1084438', 'Костюм 1084438', 'Костюмы', 0, '["42","44","46","48","50"]', 'Уютный трикотажный костюм в тёплом оттенке. Свободный крой, мягкая фактура и удобная посадка.', 'images/product-2.png', 1),
(3, '1079433', 'Платье 1079433', 'Платья', 0, '["42","44","46","48"]', 'Трикотажное платье с высоким воротником. В наличии несколько цветовых вариантов. Уточняйте актуальные размеры.', 'images/product-3.png', 1);

INSERT OR REPLACE INTO settings (key, value) VALUES ('categories', '["Костюмы","Платья","Джинсы","Блузки","Брюки","Куртки","Юбки","Футболки","Свитера","Аксессуары"]');
