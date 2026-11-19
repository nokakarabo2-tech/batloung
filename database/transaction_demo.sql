USE batloung_farm;
-- Demo: a 2-item sale where item 2 asks for more than is available (only 6 LARGE apples).
START TRANSACTION;
UPDATE stock SET available_quantity = available_quantity - 2 WHERE fruit_id=2 AND packaging_size='SMALL';  -- ok
UPDATE stock SET available_quantity = available_quantity - 10 WHERE fruit_id=1 AND packaging_size='LARGE'; -- fails CHECK (>= 0)
-- Error 3819 is raised, so undo everything:
ROLLBACK;
SELECT fruit_id, packaging_size, available_quantity FROM stock WHERE fruit_id IN (1,2); -- unchanged
