-- ============================================================
-- Éclat Institute — Production Clean Slate (Zero Test Records)
-- Run in Supabase SQL Editor if you want to wipe test rows:
-- https://supabase.com/dashboard/project/mxfuivzgcnxwyslrmzqa/sql
-- ============================================================

DELETE FROM public.fee_payments;
DELETE FROM public.fee_invoices;
DELETE FROM public.unit_registrations;
DELETE FROM public.report_cards;
DELETE FROM public.discipline_records;
DELETE FROM public.biometric_clearance_passes;
DELETE FROM public.secretary_inquiries;
DELETE FROM public.drm_security_events;
DELETE FROM public.profiles WHERE role = 'student' OR admission_number ILIKE 'TEST%' OR admission_number ILIKE 'DEMO%';
