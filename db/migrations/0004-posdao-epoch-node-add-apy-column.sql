DO $$
    BEGIN
        ALTER TABLE public.posdao_epoch_node ADD COLUMN epoch_apy numeric(36, 18);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column epoch_apy already exists in public.posdao_epoch_node, skipping';
    END
$$;
