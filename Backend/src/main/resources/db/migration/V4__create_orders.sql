CREATE TABLE orders (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT        NOT NULL REFERENCES users (id),
    status       VARCHAR(20)   NOT NULL CHECK (status IN
                   ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at   TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP     NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders (user_id);
