DO $$
    BEGIN
        ALTER TABLE public.pending_validator_state_event ADD COLUMN keygen_round integer;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column keygen_round already exists in public.pending_validator_state_event, skipping';
    END
$$;
