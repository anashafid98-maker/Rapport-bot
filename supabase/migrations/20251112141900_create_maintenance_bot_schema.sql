/*
  # Maintenance Bot - Schema Database

  ## Description
  Création du schéma de base de données pour l'application Maintenance Bot.
  Cette migration crée les tables nécessaires sans Row Level Security (RLS) 
  pour permettre à l'admin de gérer tous les utilisateurs et rapports.

  ## Tables Créées

  ### 1. profiles
  - `id` (uuid, primary key) - Lié à auth.users
  - `email` (text) - Email de l'utilisateur
  - `full_name` (text) - Nom complet
  - `zone` (text) - Zone assignée (OSBL-SAP, DAP, ou PAP)
  - `created_at` (timestamptz) - Date de création

  ### 2. reports
  - `id` (uuid, primary key) - Identifiant unique du rapport
  - `user_id` (uuid) - Référence vers l'utilisateur créateur
  - `zone` (text) - Zone du rapport (OSBL-SAP, DAP, PAP)
  - `report_data` (jsonb) - Données complètes du rapport
  - `status` (text) - Statut (draft, completed)
  - `created_at` (timestamptz) - Date de création
  - `updated_at` (timestamptz) - Date de dernière modification

  ## Sécurité
  - **PAS DE RLS** - L'admin doit pouvoir accéder à toutes les données
  - Les tables sont publiquement accessibles aux utilisateurs authentifiés
*/

-- Création de la table profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  zone text CHECK (zone IN ('OSBL-SAP', 'DAP', 'PAP')),
  created_at timestamptz DEFAULT now()
);

-- Création de la table reports
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  zone text NOT NULL CHECK (zone IN ('OSBL-SAP', 'DAP', 'PAP')),
  report_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_zone ON reports(zone);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at sur reports
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profile lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer un profile automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();