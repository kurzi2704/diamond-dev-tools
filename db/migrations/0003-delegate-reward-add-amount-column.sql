DO $$
    BEGIN
        ALTER TABLE public.delegate_reward ADD COLUMN reward_amount numeric(36, 18);
    EXCEPTION
        WHEN duplicate_column THEN RAISE NOTICE 'column reward_amount already exists in public.delegate_reward, skipping';
    END
$$;
