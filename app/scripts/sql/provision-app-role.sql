-- Idempotently creates (or updates the password/attributes of) the
-- restricted application role, then grants it the same permissions on
-- every existing table/sequence/function in the public schema, and sets
-- default privileges so future migrations don't silently leave new objects
-- ungranted until someone remembers to re-run this script.
--
-- Invoked via psql -v role_name=... -v role_password=... — never edit this
-- file to hardcode a real password.
-- psql variable interpolation (:'var') doesn't happen inside dollar-quoted
-- (DO $$ ... $$) blocks, so the create-or-alter branch is built and run via
-- \gexec instead of PL/pgSQL — substitution works normally here since
-- nothing below is dollar-quoted.
select format('alter role %I with login password %L nosuperuser nocreatedb nocreaterole noinherit', :'role_name', :'role_password')
where exists (select 1 from pg_roles where rolname = :'role_name')
union all
select format('create role %I login password %L nosuperuser nocreatedb nocreaterole noinherit', :'role_name', :'role_password')
where not exists (select 1 from pg_roles where rolname = :'role_name')
\gexec

grant usage on schema public to :"role_name";
grant select, insert, update, delete on all tables in schema public to :"role_name";
grant usage, select on all sequences in schema public to :"role_name";
grant execute on all functions in schema public to :"role_name";

alter default privileges in schema public grant select, insert, update, delete on tables to :"role_name";
alter default privileges in schema public grant usage, select on sequences to :"role_name";
alter default privileges in schema public grant execute on functions to :"role_name";
