DO $$
    BEGIN
        ALTER TABLE public.headers ADD COLUMN import_complete boolean;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column import_complete already exists in public.headers, skipping';
    END
$$;
