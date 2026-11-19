USE batloung_farm;
INSERT INTO suppliers (business_name,contact_person,phone,province,address) VALUES
('Highveld Orchards','Pieter van Wyk','+27 11 555 0101','Gauteng','12 Farm Rd, Johannesburg'),
('Free State Fresh','Thabo Molefe','+27 51 555 0102','Free State','4 Market St, Bloemfontein'),
('Natal Tropical Fruit','Zanele Dlamini','+27 31 555 0103','KwaZulu-Natal','88 Coast Rd, Durban'),
('Cape Grape Co-op','Anele Jacobs','+27 21 555 0104','Western Cape','7 Vineyard Ln, Paarl'),
('Limpopo Mango Estate','Rudzani Mukwevho','+27 15 555 0105','Limpopo','Plot 5, Tzaneen');
INSERT INTO fruits (fruit_name,description) VALUES
('Apples','Crisp red apples'),('Bananas','Sweet ripe bananas'),('Oranges','Juicy navel oranges'),
('Mangoes','Soft tropical mangoes'),('Grapes','Seedless table grapes');
INSERT INTO vendors (vendor_name,phone_number,location,registration_date) VALUES
('Mpho Sekonyela','+266 5812 0001','Maseru Bus Stop','2025-02-10'),
('Palesa Mokoena','+266 5812 0002','Maseru Pitso Ground','2025-03-18'),
('Lerato Tau','+266 5812 0003','Maseru Moshoeshoe Rd','2025-05-02'),
('Teboho Ramotsoari','+266 5812 0004','Maseru Thetsane','2025-07-21'),
('Nthabiseng Lebona','+266 5812 0005','Maseru Qoaling','2025-09-05');
-- Stock: 5 fruits x 3 sizes. Prices are in Maloti (M) per box.
INSERT INTO stock (fruit_id,packaging_size,available_quantity,selling_price,low_stock_threshold) VALUES
(1,'SMALL',40,80,10),(1,'MEDIUM',30,140,10),(1,'LARGE',6,220,10),
(2,'SMALL',50,60,10),(2,'MEDIUM',35,100,10),(2,'LARGE',20,160,10),
(3,'SMALL',45,70,10),(3,'MEDIUM',25,120,10),(3,'LARGE',8,190,10),
(4,'SMALL',30,110,10),(4,'MEDIUM',22,180,10),(4,'LARGE',15,260,10),
(5,'SMALL',28,120,10),(5,'MEDIUM',18,200,10),(5,'LARGE',12,300,10);
INSERT INTO purchases (supplier_id,purchase_date,total_amount) VALUES (1,'2026-10-01',4800),(3,'2026-10-05',5400);
INSERT INTO purchase_details (purchase_id,fruit_id,quantity,unit_cost,packaging_size) VALUES
(1,1,20,100,'MEDIUM'),(1,1,10,160,'LARGE'),(1,3,20,60,'SMALL'),
(2,2,30,70,'MEDIUM'),(2,4,20,130,'LARGE'),(2,2,10,40,'SMALL');
INSERT INTO sales (vendor_id,sale_date,payment_status,total_amount,amount_paid) VALUES
(1,'2026-11-02','PAID',720,720),(2,'2026-11-05','PARTIALLY_PAID',1040,400),(3,'2026-11-10','UNPAID',650,0);
INSERT INTO sales_details (sale_id,fruit_id,packaging_size,quantity,unit_price) VALUES
(1,1,'MEDIUM',3,140),(1,2,'SMALL',5,60),
(2,4,'LARGE',2,260),(2,5,'MEDIUM',2,200),
(3,3,'LARGE',2,190),(3,2,'MEDIUM',3,90);
INSERT INTO payments (sale_id,amount,method) VALUES (1,720,'CASH'),(2,400,'MOBILE_MONEY');
