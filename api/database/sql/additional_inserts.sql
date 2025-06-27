-- Archivo de inserts adicionales para todas las tablas
USE cine;

-- ===============================
-- INSERTS PARA USUARIOS
-- ===============================

-- Empleados
INSERT INTO users (username, password, first_name, last_name, role, phone, is_active) VALUES
('empleado1', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Carlos', 'González', 'employee', '+1234567891', 1),
('empleado2', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'María', 'López', 'employee', '+1234567892', 1),
('empleado3', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Pedro', 'Martínez', 'employee', '+1234567893', 1),
('empleado4', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Ana', 'Rodríguez', 'employee', '+1234567894', 1);

-- Clientes
INSERT INTO users (username, password, first_name, last_name, role, phone, is_active) VALUES
('cliente1', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Juan', 'Pérez', 'customer', '+1234567895', 1),
('cliente2', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Laura', 'García', 'customer', '+1234567896', 1),
('cliente3', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Miguel', 'Hernández', 'customer', '+1234567897', 1),
('cliente4', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Sofia', 'Torres', 'customer', '+1234567898', 1),
('cliente5', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Roberto', 'Sánchez', 'customer', '+1234567899', 1),
('cliente6', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Carmen', 'Morales', 'customer', '+1234567800', 1),
('cliente7', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Diego', 'Vargas', 'customer', '+1234567801', 1),
('cliente8', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Isabella', 'Castro', 'customer', '+1234567802', 1),
('cliente9', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Andrés', 'Jiménez', 'customer', '+1234567803', 1),
('cliente10', '$2b$12$OLtFD1NLSSZETrkTPmQiZ.jOgsBhko6mCc0R3z3FjsWt3PYNvoouG', 'Valentina', 'Ruiz', 'customer', '+1234567804', 1);

-- ===============================
-- INSERTS PARA SALAS DE CINE
-- ===============================

INSERT INTO theaters (name, capacity, has_3d, has_dolby, is_imax) VALUES
('Sala 1', 120, TRUE, TRUE, FALSE),
('Sala 2', 100, TRUE, FALSE, FALSE),
('Sala 3', 80, FALSE, TRUE, FALSE),
('Sala 4', 150, TRUE, TRUE, TRUE),
('Sala 5', 90, FALSE, FALSE, FALSE),
('Sala 6', 110, TRUE, TRUE, FALSE),
('Sala 7', 200, TRUE, TRUE, TRUE),
('Sala 8', 75, FALSE, TRUE, FALSE),
('Sala VIP', 50, TRUE, TRUE, FALSE),
('Sala Premium', 60, TRUE, TRUE, TRUE);

-- ===============================
-- INSERTS PARA MEMBRESÍAS DE CLIENTES
-- ===============================

-- Asignar membresías a algunos clientes (user_id del 6 al 15 son clientes)
INSERT INTO customer_memberships (user_id, membership_id, start_date, end_date, is_active) VALUES
(6, 1, '2025-01-01', '2025-12-31', TRUE),   -- cliente1 - Bronce
(7, 2, '2025-02-01', '2026-01-31', TRUE),   -- cliente2 - Plata
(8, 3, '2025-01-15', '2026-01-14', TRUE),   -- cliente3 - Oro
(9, 4, '2025-03-01', '2026-02-28', TRUE),   -- cliente4 - Platino
(10, 5, '2025-01-10', '2026-01-09', TRUE),  -- cliente5 - Diamante
(11, 1, '2025-04-01', '2026-03-31', TRUE),  -- cliente6 - Bronce
(12, 2, '2025-02-15', '2026-02-14', TRUE),  -- cliente7 - Plata
(13, 3, '2025-05-01', '2026-04-30', TRUE),  -- cliente8 - Oro
(14, 1, '2025-03-15', '2026-03-14', TRUE),  -- cliente9 - Bronce
(15, 2, '2025-06-01', '2026-05-31', TRUE);  -- cliente10 - Plata

-- ===============================
-- INSERTS PARA HORARIOS DE PROYECCIÓN
-- ===============================

-- Horarios para las próximas semanas (asumiendo que las películas con ID 1-25 ya están insertadas)
INSERT INTO showtimes (movie_id, theater_id, datetime, base_price, available_seats, is_3d, is_imax, created_by_user_id) VALUES
-- Horarios para hoy y mañana
(1, 1, '2025-06-27 14:00:00', 120.00, 120, TRUE, FALSE, 1),
(1, 1, '2025-06-27 17:00:00', 120.00, 120, TRUE, FALSE, 1),
(1, 1, '2025-06-27 20:00:00', 150.00, 120, TRUE, FALSE, 1),
(2, 2, '2025-06-27 15:30:00', 100.00, 100, TRUE, FALSE, 1),
(2, 2, '2025-06-27 18:30:00', 100.00, 100, TRUE, FALSE, 1),
(2, 2, '2025-06-27 21:30:00', 130.00, 100, TRUE, FALSE, 1),
(3, 4, '2025-06-27 16:00:00', 180.00, 150, TRUE, TRUE, 1),
(3, 4, '2025-06-27 19:00:00', 180.00, 150, TRUE, TRUE, 1),
(3, 7, '2025-06-27 22:00:00', 200.00, 200, TRUE, TRUE, 1),

-- Horarios para mañana
(4, 3, '2025-06-28 14:30:00', 110.00, 80, FALSE, FALSE, 1),
(4, 3, '2025-06-28 17:30:00', 110.00, 80, FALSE, FALSE, 1),
(4, 3, '2025-06-28 20:30:00', 140.00, 80, FALSE, FALSE, 1),
(5, 5, '2025-06-28 15:00:00', 95.00, 90, FALSE, FALSE, 1),
(5, 5, '2025-06-28 18:00:00', 95.00, 90, FALSE, FALSE, 1),
(5, 5, '2025-06-28 21:00:00', 125.00, 90, FALSE, FALSE, 1),
(6, 6, '2025-06-28 16:30:00', 115.00, 110, TRUE, FALSE, 1),
(6, 6, '2025-06-28 19:30:00', 115.00, 110, TRUE, FALSE, 1),
(6, 6, '2025-06-28 22:30:00', 145.00, 110, TRUE, FALSE, 1),

-- Horarios de fin de semana
(7, 9, '2025-06-29 13:00:00', 250.00, 50, TRUE, FALSE, 1),
(7, 9, '2025-06-29 16:00:00', 250.00, 50, TRUE, FALSE, 1),
(7, 9, '2025-06-29 19:00:00', 280.00, 50, TRUE, FALSE, 1),
(8, 10, '2025-06-29 14:00:00', 300.00, 60, TRUE, TRUE, 1),
(8, 10, '2025-06-29 17:00:00', 300.00, 60, TRUE, TRUE, 1),
(8, 10, '2025-06-29 20:00:00', 350.00, 60, TRUE, TRUE, 1),

-- Más horarios para diferentes películas
(9, 1, '2025-06-30 15:00:00', 120.00, 120, TRUE, FALSE, 2),
(9, 1, '2025-06-30 18:00:00', 120.00, 120, TRUE, FALSE, 2),
(10, 2, '2025-06-30 16:00:00', 100.00, 100, TRUE, FALSE, 2),
(10, 2, '2025-06-30 19:00:00', 100.00, 100, TRUE, FALSE, 2),
(11, 8, '2025-06-30 17:00:00', 85.00, 75, FALSE, FALSE, 2),
(11, 8, '2025-06-30 20:00:00', 110.00, 75, FALSE, FALSE, 2),
(12, 7, '2025-06-30 21:00:00', 200.00, 200, TRUE, TRUE, 2);

-- ===============================
-- INSERTS PARA VENTAS
-- ===============================

-- Ventas de ejemplo (algunas con descuentos de membresía)
INSERT INTO sales (showtime_id, customer_user_id, employee_user_id, ticket_quantity, subtotal, discount_amount, total, payment_method) VALUES
-- Ventas sin membresía
(1, NULL, 2, 2, 240.00, 0.00, 240.00, 'cash'),
(2, NULL, 3, 1, 120.00, 0.00, 120.00, 'credit_card'),
(3, NULL, 2, 3, 450.00, 0.00, 450.00, 'debit_card'),
(4, NULL, 4, 2, 200.00, 0.00, 200.00, 'credit_card'),

-- Ventas con clientes con membresía (aplicando descuentos)
(5, 6, 2, 2, 200.00, 10.00, 190.00, 'membership'),    -- Bronce 5%
(6, 7, 3, 1, 130.00, 13.00, 117.00, 'membership'),    -- Plata 10%
(7, 8, 2, 2, 360.00, 54.00, 306.00, 'membership'),    -- Oro 15%
(8, 9, 4, 1, 180.00, 36.00, 144.00, 'membership'),    -- Platino 20%
(9, 10, 2, 2, 400.00, 100.00, 300.00, 'membership'),  -- Diamante 25%

-- Más ventas variadas
(10, 11, 3, 3, 330.00, 16.50, 313.50, 'membership'),  -- Bronce 5%
(11, 12, 2, 1, 110.00, 11.00, 99.00, 'membership'),   -- Plata 10%
(12, NULL, 4, 4, 400.00, 0.00, 400.00, 'credit_card'),
(13, 13, 3, 2, 230.00, 34.50, 195.50, 'membership'),  -- Oro 15%
(14, NULL, 2, 1, 95.00, 0.00, 95.00, 'cash'),
(15, 14, 4, 2, 250.00, 12.50, 237.50, 'membership'),  -- Bronce 5%
(16, 15, 2, 1, 115.00, 11.50, 103.50, 'membership'),  -- Plata 10%

-- Ventas para funciones premium
(17, NULL, 3, 2, 500.00, 0.00, 500.00, 'credit_card'),
(18, 8, 2, 1, 250.00, 37.50, 212.50, 'membership'),   -- Oro 15%
(19, 9, 4, 2, 560.00, 112.00, 448.00, 'membership'),  -- Platino 20%
(20, 10, 3, 1, 300.00, 75.00, 225.00, 'membership');  -- Diamante 25%

-- ===============================
-- INSERTS PARA ASIENTOS RESERVADOS
-- ===============================

-- Asientos para las ventas anteriores (sale_id del 1 al 20)
INSERT INTO reserved_seats (sale_id, seat_number) VALUES
-- Sale 1 (2 boletos)
(1, 'A1'), (1, 'A2'),
-- Sale 2 (1 boleto)
(2, 'B5'),
-- Sale 3 (3 boletos)
(3, 'C1'), (3, 'C2'), (3, 'C3'),
-- Sale 4 (2 boletos)
(4, 'D10'), (4, 'D11'),
-- Sale 5 (2 boletos)
(5, 'E5'), (5, 'E6'),
-- Sale 6 (1 boleto)
(6, 'F8'),
-- Sale 7 (2 boletos)
(7, 'G15'), (7, 'G16'),
-- Sale 8 (1 boleto)
(8, 'H20'),
-- Sale 9 (2 boletos)
(9, 'I1'), (9, 'I2'),
-- Sale 10 (3 boletos)
(10, 'J5'), (10, 'J6'), (10, 'J7'),
-- Sale 11 (1 boleto)
(11, 'K12'),
-- Sale 12 (4 boletos)
(12, 'L1'), (12, 'L2'), (12, 'L3'), (12, 'L4'),
-- Sale 13 (2 boletos)
(13, 'M8'), (13, 'M9'),
-- Sale 14 (1 boleto)
(14, 'N15'),
-- Sale 15 (2 boletos)
(15, 'O10'), (15, 'O11'),
-- Sale 16 (1 boleto)
(16, 'P7'),
-- Sale 17 (2 boletos) - Sala VIP
(17, 'VIP1'), (17, 'VIP2'),
-- Sale 18 (1 boleto) - Sala VIP
(18, 'VIP10'),
-- Sale 19 (2 boletos) - Sala Premium
(19, 'PREM5'), (19, 'PREM6'),
-- Sale 20 (1 boleto) - Sala Premium
(20, 'PREM15');

-- ===============================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ===============================

-- Consultas para verificar los inserts
SELECT 'USUARIOS INSERTADOS:' as info;
SELECT COUNT(*) as total_usuarios FROM users;
SELECT role, COUNT(*) as cantidad FROM users GROUP BY role;

SELECT 'SALAS INSERTADAS:' as info;
SELECT COUNT(*) as total_salas FROM theaters;

SELECT 'MEMBRESÍAS DE CLIENTES:' as info;
SELECT COUNT(*) as total_customer_memberships FROM customer_memberships;

SELECT 'HORARIOS INSERTADOS:' as info;
SELECT COUNT(*) as total_showtimes FROM showtimes;

SELECT 'VENTAS INSERTADAS:' as info;
SELECT COUNT(*) as total_sales FROM sales;
SELECT payment_method, COUNT(*) as cantidad FROM sales GROUP BY payment_method;

SELECT 'ASIENTOS RESERVADOS:' as info;
SELECT COUNT(*) as total_reserved_seats FROM reserved_seats;

-- Mostrar resumen de ventas por tipo de cliente
SELECT 
    'RESUMEN DE VENTAS' as info,
    CASE 
        WHEN s.customer_user_id IS NULL THEN 'Sin membresía'
        ELSE CONCAT('Con membresía (', m.name, ')')
    END as tipo_cliente,
    COUNT(*) as total_ventas,
    SUM(s.total) as ingresos_totales,
    SUM(s.discount_amount) as descuentos_aplicados
FROM sales s
LEFT JOIN users u ON s.customer_user_id = u.user_id
LEFT JOIN customer_memberships cm ON u.user_id = cm.user_id AND cm.is_active = TRUE
LEFT JOIN memberships m ON cm.membership_id = m.membership_id
GROUP BY 
    CASE 
        WHEN s.customer_user_id IS NULL THEN 'Sin membresía'
        ELSE CONCAT('Con membresía (', m.name, ')')
    END;
