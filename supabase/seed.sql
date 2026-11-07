-- Para insertar directamente en la base de datos sin problemas de RLS (Row Level Security)

INSERT INTO lugares (nombre, tipo, barrio, direccion, fotos, rango_precios, wifi_score, tiene_enchufes, nivel_ruido, horarios, productos_destacados)
VALUES 
('Café Palermo', 'cafetería', 'Palermo', 'Honduras 4800', 
 ARRAY['https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1200&q=70'], 
 '$$', 5, true, 'Silencioso', '[{"day":"Lunes a Viernes","time":"08:00 – 20:00"},{"day":"Sábado","time":"09:00 – 21:00"},{"day":"Domingo","time":"10:00 – 19:00"}]', '[{"item":"Espresso","price":2200},{"item":"Café con leche","price":3200},{"item":"Flat white","price":3800},{"item":"Medialunas (x2)","price":2400},{"item":"Tostado de jamón y queso","price":6500},{"item":"Limonada con menta","price":4200}]'),

('The Coffee Store Recoleta', 'cafetería', 'Recoleta', 'Av. Callao 1500', 
 ARRAY['https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=70'], 
 '$$$', 3, true, 'Moderado', '[{"day":"Lunes a Viernes","time":"07:30 – 21:00"},{"day":"Sábado","time":"09:00 – 21:00"},{"day":"Domingo","time":"10:00 – 19:00"}]', '[{"item":"Espresso","price":2860},{"item":"Café con leche","price":4160},{"item":"Flat white","price":4940},{"item":"Medialunas (x2)","price":3120},{"item":"Tostado de jamón y queso","price":8450},{"item":"Limonada con menta","price":5460}]'),

('Lattente', 'cafetería', 'Villa Crespo', 'Thames 1891', 
 ARRAY['https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=70'], 
 '$$', 6, true, 'Silencioso', '[{"day":"Lunes a Viernes","time":"08:00 – 20:00"},{"day":"Sábado","time":"09:00 – 21:00"},{"day":"Domingo","time":"10:00 – 19:00"}]', '[{"item":"Espresso","price":2310},{"item":"Café con leche","price":3360},{"item":"Flat white","price":3990},{"item":"Medialunas (x2)","price":2520},{"item":"Tostado de jamón y queso","price":6825},{"item":"Limonada con menta","price":4410}]'),

('Birkin Coffee', 'cafetería', 'Belgrano', 'Av. Cabildo 2100', 
 ARRAY['https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1497515114629-f71d768fd07c?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=70'], 
 '$', 3, false, 'Animado', '[{"day":"Lunes a Viernes","time":"09:00 – 19:00"},{"day":"Sábado","time":"09:00 – 21:00"},{"day":"Domingo","time":"10:00 – 19:00"}]', '[{"item":"Espresso","price":1760},{"item":"Café con leche","price":2560},{"item":"Flat white","price":3040},{"item":"Medialunas (x2)","price":1920},{"item":"Tostado de jamón y queso","price":5200},{"item":"Limonada con menta","price":3360}]'),

('Cuervo Café', 'cafetería', 'Colegiales', 'Federico Lacroze 2650', 
 ARRAY['https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=70','https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=70'], 
 '$$', 5, true, 'Silencioso', '[{"day":"Lunes a Viernes","time":"08:00 – 20:00"},{"day":"Sábado","time":"09:00 – 21:00"},{"day":"Domingo","time":"10:00 – 19:00"}]', '[{"item":"Espresso","price":2200},{"item":"Café con leche","price":3200},{"item":"Flat white","price":3800},{"item":"Medialunas (x2)","price":2400},{"item":"Tostado de jamón y queso","price":6500},{"item":"Limonada con menta","price":4200}]');
