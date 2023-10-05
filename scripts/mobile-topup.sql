-- Table: public.topup_charging

DROP TABLE IF EXISTS public.topup_charging;

CREATE TABLE IF NOT EXISTS public.topup_charging
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    transaction_status character varying(10) NOT NULL,
    telco character varying(20) NOT NULL,
    telco_service_type character varying(20) NOT NULL,
    partner_ref_id character varying(180) NOT NULL,
    amount integer DEFAULT 0,
    phone_number VARCHAR(15) NOT NULL,
    response jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT topup_charging_pkey PRIMARY KEY (id)
)

-- Table: public.topup_histories

DROP TABLE IF EXISTS public.topup_histories;

CREATE TABLE IF NOT EXISTS public.topup_histories
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    transaction_status character varying(10) NOT NULL,
    telco character varying(20) NOT NULL,
    telco_service_type character varying(20) NOT NULL,
    partner_ref_id character varying(180) NOT NULL,
    amount integer DEFAULT 0,
    phone_number VARCHAR(15) NOT NULL,
    response jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT topup_histories_pkey PRIMARY KEY (id)
)

-- Table: public.topup_charging

DROP TABLE IF EXISTS public.topup_transaction;

CREATE TABLE IF NOT EXISTS public.topup_transaction
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    transaction_status character varying(10) NOT NULL,
    partner_ref_id character varying(180) NOT NULL,
    response jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT topup_transaction_pkey PRIMARY KEY (id)
)

