CREATE TABLE headers (
    block_number INT NOT NULL PRIMARY KEY,
    block_hash CHAR(64) NOT NULL,
    extra_data VARCHAR(64) NOT NULL,
    block_time timestamp NOT NULL,
    block_duration int NOT NULL,
    transaction_count INT NOT NULL,
    txs_per_sec FLOAT NOT NULL
);

CREATE UNIQUE INDEX ON headers (block_time);
