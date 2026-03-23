-- +goose Up
ALTER TABLE products ADD COLUMN stock INT NOT NULL DEFAULT 0;

-- +goose Down
ALTER TABLE products DROP COLUMN stock;
