-- Phase 3 schema upgrade for warehouses and locations
-- Designed to be idempotent on MariaDB/MySQL supporting IF NOT EXISTS.

ALTER TABLE warehouses
  ADD COLUMN IF NOT EXISTS warehouse_name VARCHAR(255) DEFAULT NULL AFTER company_id,
  ADD COLUMN IF NOT EXISTS warehouse_type VARCHAR(100) DEFAULT NULL AFTER warehouse_name,
  ADD COLUMN IF NOT EXISTS address TEXT DEFAULT NULL AFTER warehouse_type,
  ADD COLUMN IF NOT EXISTS manager_id INT(11) DEFAULT NULL AFTER address,
  ADD COLUMN IF NOT EXISTS capacity DECIMAL(15,3) DEFAULT 0.000 AFTER manager_id;

UPDATE warehouses
SET
  warehouse_name = COALESCE(NULLIF(warehouse_name, ''), warehouse),
  warehouse_type = COALESCE(NULLIF(warehouse_type, ''), short_code),
  address = COALESCE(address, description),
  capacity = COALESCE(capacity, 0.000)
WHERE company_id IS NOT NULL;

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS warehouse_id INT(11) DEFAULT NULL AFTER company_id,
  ADD COLUMN IF NOT EXISTS location_code VARCHAR(100) DEFAULT NULL AFTER warehouse_id,
  ADD COLUMN IF NOT EXISTS location_name VARCHAR(255) DEFAULT NULL AFTER location_code,
  ADD COLUMN IF NOT EXISTS `row` VARCHAR(50) DEFAULT NULL AFTER location_name,
  ADD COLUMN IF NOT EXISTS `column` VARCHAR(50) DEFAULT NULL AFTER `row`,
  ADD COLUMN IF NOT EXISTS shelf VARCHAR(50) DEFAULT NULL AFTER `column`,
  ADD COLUMN IF NOT EXISTS zone VARCHAR(50) DEFAULT NULL AFTER shelf,
  ADD COLUMN IF NOT EXISTS capacity DECIMAL(15,3) DEFAULT 0.000 AFTER zone;

UPDATE locations
SET
  location_name = COALESCE(NULLIF(location_name, ''), location),
  location_code = COALESCE(NULLIF(location_code, ''), CONCAT('LOC-', id)),
  capacity = COALESCE(capacity, 0.000)
WHERE company_id IS NOT NULL;

ALTER TABLE warehouses
  ADD INDEX IF NOT EXISTS idx_wh_company_active (company_id, is_active),
  ADD INDEX IF NOT EXISTS idx_wh_manager (manager_id),
  ADD UNIQUE KEY IF NOT EXISTS uk_wh_company_name_active (company_id, warehouse_name, is_active);

ALTER TABLE locations
  ADD INDEX IF NOT EXISTS idx_loc_company_active (company_id, is_active),
  ADD INDEX IF NOT EXISTS idx_loc_wh_active (warehouse_id, is_active),
  ADD UNIQUE KEY IF NOT EXISTS uk_loc_wh_code_active (warehouse_id, location_code, is_active);
