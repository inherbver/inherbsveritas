-- Solution recommandée par Supabase Support pour PGRST202
-- Redémarre la connection PostgREST pour rafraîchir le cache schema

SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE application_name = 'postgrest';