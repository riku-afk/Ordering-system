CREATE TABLE products (
    id          BIGSERIAL PRIMARY KEY,
    category_id BIGINT        NOT NULL REFERENCES categories (id),
    name        VARCHAR(150)  NOT NULL,
    description VARCHAR(2000),
    price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    image_url   VARCHAR(500),
    available   BOOLEAN       NOT NULL DEFAULT true,
    created_at  TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category_id ON products (category_id);
