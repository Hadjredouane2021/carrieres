ALTER TABLE `careers` ADD COLUMN `category` VARCHAR(40) NOT NULL DEFAULT '';

-- Familles de départ, modifiables ensuite depuis le back-office.
UPDATE `careers` SET `category` = 'Tech & data' WHERE `titleFr` LIKE '%insurtech%' OR `titleFr` LIKE '%veloppeu%' OR `titleFr` LIKE 'Data%' OR `titleFr` LIKE '%cybers%';
UPDATE `careers` SET `category` = 'Risques' WHERE `titleFr` LIKE 'Risk%' OR `titleFr` LIKE 'Actuaire%' OR `titleFr` LIKE '%vention des risques%';
UPDATE `careers` SET `category` = 'Produit' WHERE `titleFr` LIKE '%produit%' OR `titleFr` LIKE 'Souscript%' OR `titleFr` LIKE 'Gestionnaire de contrats%';
UPDATE `careers` SET `category` = 'Sinistres' WHERE `titleFr` LIKE '%sinistres%' OR `titleFr` LIKE '%indemnisation%';
UPDATE `careers` SET `category` = 'Commercial' WHERE `titleFr` LIKE 'Commercial%' OR `titleFr` LIKE 'Conseill%' OR `titleFr` LIKE '%relation client%';
UPDATE `careers` SET `category` = 'Juridique' WHERE `titleFr` LIKE '%conformit%' OR `titleFr` LIKE 'Juriste%';
UPDATE `careers` SET `category` = 'RH & com' WHERE `titleFr` LIKE '%ressources humaines%' OR `titleFr` LIKE '%communication%' OR `titleFr` LIKE 'Community%' OR `titleFr` LIKE '%RSE%';
