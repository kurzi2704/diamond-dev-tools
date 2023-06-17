

CREATE UNIQUE INDEX ix_headers_block_time ON headers(block_time) INCLUDE (block_number);
CREATE UNIQUE INDEX ix_headers_block_number_with_time ON headers(block_number) INCLUDE (block_time);
CREATE UNIQUE INDEX ix_headers_posdao_epoch ON headers(block_number) INCLUDE (block_time);
