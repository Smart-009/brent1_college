-- ============================================================
-- Éclat Institute — Production Clean Slate (Zero Test Records)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fee_payments') THEN
    DELETE FROM public.fee_payments;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fee_invoices') THEN
    DELETE FROM public.fee_invoices;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'unit_registrations') THEN
    DELETE FROM public.unit_registrations;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'report_cards') THEN
    DELETE FROM public.report_cards;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'discipline_records') THEN
    DELETE FROM public.discipline_records;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'biometric_clearance_passes') THEN
    DELETE FROM public.biometric_clearance_passes;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'secretary_inquiries') THEN
    DELETE FROM public.secretary_inquiries;
  END IF;
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'drm_security_events') THEN
    DELETE FROM public.drm_security_events;
  END IF;
END $$;

