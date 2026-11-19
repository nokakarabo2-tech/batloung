USE batloung_farm;
-- 1. Five most frequently sold fruits (by boxes)
SELECT f.fruit_name, SUM(sd.quantity) AS boxes_sold
FROM sales_details sd JOIN fruits f ON f.fruit_id = sd.fruit_id
GROUP BY f.fruit_id, f.fruit_name ORDER BY boxes_sold DESC LIMIT 5;

-- 2. Revenue in a date range
SELECT COALESCE(SUM(total_amount),0) AS revenue FROM sales
WHERE sale_date BETWEEN '2026-11-01' AND '2026-11-30';

-- 3. Vendor who bought the most boxes
SELECT v.vendor_name, SUM(sd.quantity) AS boxes_bought
FROM sales s JOIN vendors v ON v.vendor_id = s.vendor_id
JOIN sales_details sd ON sd.sale_id = s.sale_id
GROUP BY v.vendor_id, v.vendor_name ORDER BY boxes_bought DESC LIMIT 1;

-- 4. Current stock per fruit and size
SELECT f.fruit_name, st.packaging_size, st.available_quantity
FROM stock st JOIN fruits f ON f.fruit_id = st.fruit_id
ORDER BY f.fruit_name, FIELD(st.packaging_size,'SMALL','MEDIUM','LARGE');
