DO $$
    BEGIN
        ALTER TABLE public.headers ADD COLUMN imort_finished boolean;
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column imort_finished already exists in public.headers, skipping';
    END
$$;
