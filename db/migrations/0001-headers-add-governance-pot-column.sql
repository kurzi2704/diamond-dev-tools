DO $$
    BEGIN
        ALTER TABLE public.headers ADD COLUMN governance_pot numeric;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column governance_pot already exists in public.headers, skipping';
    END
$$;
