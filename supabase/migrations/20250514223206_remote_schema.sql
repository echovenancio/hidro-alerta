

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."municipios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."municipios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notificacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "estado" character varying DEFAULT 'em_confirmacao'::character varying NOT NULL,
    "n_confirmados" integer DEFAULT 0 NOT NULL,
    "confirmacoes_necessarias" integer NOT NULL,
    "primeiro_relato" "uuid" NOT NULL
);


ALTER TABLE "public"."notificacoes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."relatos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "municipio_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."relatos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."situacao_municipios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "municipio_id" "uuid" NOT NULL,
    "situacao" smallint DEFAULT '0'::smallint NOT NULL
);


ALTER TABLE "public"."situacao_municipios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_municipios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "municipio_id" "uuid" NOT NULL,
    "e_moradia" boolean NOT NULL
);


ALTER TABLE "public"."user_municipios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_notificacao" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notificacao_id" "uuid" NOT NULL,
    "foi_confirmado" boolean DEFAULT false NOT NULL,
    "foi_resolvido" boolean
);


ALTER TABLE "public"."user_notificacao" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "nome" character varying NOT NULL,
    "owner_id" "uuid" NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."municipios"
    ADD CONSTRAINT "municipios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notificacoes"
    ADD CONSTRAINT "notificacao_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."relatos"
    ADD CONSTRAINT "relatos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."situacao_municipios"
    ADD CONSTRAINT "situacao_municipios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_municipios"
    ADD CONSTRAINT "user_municipios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_notificacao"
    ADD CONSTRAINT "user_notificacao_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notificacoes"
    ADD CONSTRAINT "notificacao_primeiro_relato_fkey" FOREIGN KEY ("primeiro_relato") REFERENCES "public"."relatos"("id");



ALTER TABLE ONLY "public"."relatos"
    ADD CONSTRAINT "relatos_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipios"("id");



ALTER TABLE ONLY "public"."relatos"
    ADD CONSTRAINT "relatos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."situacao_municipios"
    ADD CONSTRAINT "situacao_municipios_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipios"("id");



ALTER TABLE ONLY "public"."user_municipios"
    ADD CONSTRAINT "user_municipios_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipios"("id");



ALTER TABLE ONLY "public"."user_municipios"
    ADD CONSTRAINT "user_municipios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_notificacao"
    ADD CONSTRAINT "user_notificacao_notificacao_id_fkey" FOREIGN KEY ("notificacao_id") REFERENCES "public"."notificacoes"("id");



ALTER TABLE ONLY "public"."user_notificacao"
    ADD CONSTRAINT "user_notificacao_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Enable delete for users based on user_id" ON "public"."user_municipios" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_municipios" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for service role only" ON "public"."municipios" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable insert for service role only" ON "public"."notificacoes" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable insert for service role only" ON "public"."relatos" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable insert for service role only" ON "public"."situacao_municipios" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable insert for service role only" ON "public"."user_notificacao" FOR INSERT TO "service_role" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."municipios" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."situacao_municipios" FOR SELECT USING (true);



CREATE POLICY "Enable read access for service role" ON "public"."relatos" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Enable read access for service role" ON "public"."user_municipios" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Enable read access for service role" ON "public"."users" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Enable read access for service role users" ON "public"."notificacoes" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Enable update for service role only" ON "public"."municipios" FOR UPDATE TO "service_role" USING (true);



CREATE POLICY "Enable update for service role only" ON "public"."notificacoes" FOR UPDATE TO "service_role" USING (true);



CREATE POLICY "Enable update for service role only" ON "public"."situacao_municipios" FOR UPDATE TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Enable update for service role only" ON "public"."user_notificacao" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable update for users based on id" ON "public"."user_municipios" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."relatos" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."user_municipios" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."user_notificacao" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."users" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "owner_id"));



ALTER TABLE "public"."municipios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notificacoes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."relatos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."situacao_municipios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_municipios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_notificacao" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."situacao_municipios";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON TABLE "public"."municipios" TO "anon";
GRANT ALL ON TABLE "public"."municipios" TO "authenticated";
GRANT ALL ON TABLE "public"."municipios" TO "service_role";



GRANT ALL ON TABLE "public"."notificacoes" TO "anon";
GRANT ALL ON TABLE "public"."notificacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."notificacoes" TO "service_role";



GRANT ALL ON TABLE "public"."relatos" TO "anon";
GRANT ALL ON TABLE "public"."relatos" TO "authenticated";
GRANT ALL ON TABLE "public"."relatos" TO "service_role";



GRANT ALL ON TABLE "public"."situacao_municipios" TO "anon";
GRANT ALL ON TABLE "public"."situacao_municipios" TO "authenticated";
GRANT ALL ON TABLE "public"."situacao_municipios" TO "service_role";



GRANT ALL ON TABLE "public"."user_municipios" TO "anon";
GRANT ALL ON TABLE "public"."user_municipios" TO "authenticated";
GRANT ALL ON TABLE "public"."user_municipios" TO "service_role";



GRANT ALL ON TABLE "public"."user_notificacao" TO "anon";
GRANT ALL ON TABLE "public"."user_notificacao" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notificacao" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
