BEGIN;

CREATE TABLE IF NOT EXISTS public.stake_delegators
(
    pool_address bytea NOT NULL,
    delegator bytea NOT NULL,
    total_delegated numeric(36, 18) NOT NULL,
    PRIMARY KEY (pool_address, delegator)
);

ALTER TABLE IF EXISTS public.stake_delegators
    ADD CONSTRAINT fk_delegate_pool FOREIGN KEY (pool_address)
    REFERENCES public.node (pool_address) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

ALTER TABLE IF EXISTS public.stake_delegators
    ADD CONSTRAINT fk_delegate_staker FOREIGN KEY (delegator)
    REFERENCES public.delegate_staker (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;
