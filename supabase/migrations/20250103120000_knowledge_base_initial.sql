/*
  BizGenius Knowledge Base Migration
  This migration adds comprehensive knowledge base tables for data-driven business analysis.
*/

-- Enable vector extension for semantic search (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. GLOBAL COMPETITOR DATABASE
CREATE TABLE IF NOT EXISTS competitor_profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  domain VARCHAR(255),
  description TEXT,
  industry_tags TEXT[],
  business_type VARCHAR(50),

  -- Financials
  founded_year INT,
  estimated_revenue DECIMAL,
  funding_raised DECIMAL,
  valuation DECIMAL,
  employee_count INT,

  -- Product info
  products_services JSONB,
  pricing_models TEXT[],
  pricing_tiers JSONB,

  -- Market position
  target_market TEXT,
  geographic_markets TEXT[],
  market_share_estimate DECIMAL,

  -- Strengths/weaknesses
  strengths TEXT[],
  weaknesses TEXT[],

  -- Research data (via Perplexity/OpenRouter API)
  research_data JSONB,
  research_sources TEXT[],
  last_researched TIMESTAMPTZ,
  research_quality_score DECIMAL CHECK (research_quality_score >= 0 AND research_quality_score <= 1),

  -- Sources
  sources JSONB,

  -- Semantic search
  embedding VECTOR(1536),

  -- Metadata
  data_quality_score DECIMAL CHECK (data_quality_score >= 0 AND data_quality_score <= 1),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(domain)
);

CREATE INDEX IF NOT EXISTS idx_competitor_domain ON competitor_profiles(domain);
CREATE INDEX IF NOT EXISTS idx_competitor_industry_tags ON competitor_profiles USING GIN(industry_tags);
CREATE INDEX IF NOT EXISTS idx_competitor_embedding ON competitor_profiles USING ivfflat(embedding vector_cosine_ops);

-- 2. GEOGRAPHIC DATA (US + UK + Canada + Australia + Germany)
CREATE TABLE IF NOT EXISTS geographic_data (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255),
  state_province VARCHAR(255),
  country CHAR(3), -- ISO 3166-1 alpha-3
  region VARCHAR(100), -- North America, Europe, Asia, etc.

  -- Population
  population INT,
  metro_population INT,
  urban_density DECIMAL, -- people per sq km

  -- Economics
  median_income DECIMAL,
  gdp_per_capita DECIMAL,
  unemployment_rate DECIMAL,

  -- Demographics
  median_age DECIMAL,
  age_distribution JSONB, -- {'0-18': 0.20, '18-64': 0.65, '65+': 0.15}
  education_levels JSONB, -- {'primary': 0.30, 'secondary': 0.40, 'tertiary': 0.30}

  -- Business environment
  business_density INT, -- businesses per 1000 people
  major_industries TEXT[],

  -- Sources
  sources JSONB,
  last_updated TIMESTAMPTZ,

  UNIQUE(city, state_province, country)
);

CREATE INDEX IF NOT EXISTS idx_geographic_country ON geographic_data(country);
CREATE INDEX IF NOT EXISTS idx_geographic_state ON geographic_data(state_province);
CREATE INDEX IF NOT EXISTS idx_geographic_city ON geographic_data(city);

-- 3. INDUSTRY BENCHMARKS (industry-agnostic, flexible)
CREATE TABLE IF NOT EXISTS industry_benchmarks (
  id SERIAL PRIMARY KEY,
  industry_name VARCHAR(255),
  industry_aliases TEXT[], -- ['fintech', 'financial technology', 'finance']

  -- Financial benchmarks
  avg_cac DECIMAL,
  avg_ltv DECIMAL,
  ltv_cac_ratio DECIMAL,
  gross_margin_pct DECIMAL,
  net_margin_pct DECIMAL,
  churn_rate_pct DECIMAL,
  revenue_per_employee DECIMAL,

  -- Growth benchmarks
  avg_growth_rate_pct DECIMAL,
  time_to_profitability_months INT,

  -- Market characteristics
  typical_business_models TEXT[], -- ['SaaS', 'marketplace', 'service']
  typical_customer_segments TEXT[],
  average_deal_size DECIMAL,
  sales_cycle_days INT,

  -- Funding patterns
  typical_funding_stages TEXT[], -- ['pre-seed', 'seed', 'series_a', 'series_b']
  avg_seed_funding DECIMAL,
  avg_series_a_funding DECIMAL,

  -- Competitive landscape
  market_concentration VARCHAR(50), -- 'fragmented', 'moderate', 'consolidated'
  top_companies TEXT[],

  -- Sources
  sources JSONB,
  quality_score DECIMAL CHECK (quality_score >= 0 AND quality_score <= 1),
  last_updated TIMESTAMPTZ,

  UNIQUE(industry_name)
);

CREATE INDEX IF NOT EXISTS idx_industry_aliases ON industry_benchmarks USING GIN(industry_aliases);

-- 4. REGULATORY DATABASE (by country/industry)
CREATE TABLE IF NOT EXISTS regulatory_requirements (
  id SERIAL PRIMARY KEY,
  country CHAR(3),
  industry VARCHAR(255),

  -- Business structure
  required_business_entities TEXT[], -- ['LLC', 'Corporation', 'Sole Proprietorship']

  -- Licensing
  required_licenses JSONB, -- [{name, jurisdiction, cost, timeline}]

  -- Compliance
  compliance_requirements TEXT[],
  reporting_requirements TEXT[],

  -- Data protection
  data_protection_laws TEXT[], -- ['GDPR', 'CCPA', 'PIPL']

  -- Industry-specific
  industry_regulations JSONB,
  regulatory_bodies TEXT[],

  -- Sources
  sources JSONB,
  last_updated TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_regulatory_country ON regulatory_requirements(country);
CREATE INDEX IF NOT EXISTS idx_regulatory_industry ON regulatory_requirements(industry);

-- 5. MARKET SIZE DATA (by industry/region)
CREATE TABLE IF NOT EXISTS market_sizes (
  id SERIAL PRIMARY KEY,
  industry VARCHAR(255),
  country CHAR(3),
  region VARCHAR(100),

  -- TAM/SAM/SOM
  tam_value DECIMAL,
  tam_calculation TEXT,
  sam_value DECIMAL,
  sam_criteria TEXT,
  som_value DECIMAL,
  som_criteria TEXT,

  -- Growth
  cagr_pct DECIMAL,
  growth_drivers TEXT[],

  -- Year
  year INT,

  -- Sources
  sources JSONB,
  quality_score DECIMAL CHECK (quality_score >= 0 AND quality_score <= 1),
  last_updated TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_market_industry ON market_sizes(industry);
CREATE INDEX IF NOT EXISTS idx_market_country ON market_sizes(country);

-- 6. BUSINESS TEMPLATES (by type, not industry)
CREATE TABLE IF NOT EXISTS business_templates (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(255),
  business_type VARCHAR(100), -- 'SaaS', 'service', 'retail', 'marketplace'
  target_stage VARCHAR(50), -- 'idea', 'mvp', 'growth', 'scaling'

  -- Template content
  key_metrics JSONB, -- metrics to track for this business type
  typical_revenue_streams JSONB,
  typical_cost_structure JSONB,
  common_pricing_models TEXT[],

  -- Launch guidance
  launch_checklist JSONB,
  first_90_days JSONB,

  -- Regulatory
  common_licenses TEXT[],
  compliance_requirements TEXT[],

  -- Sources
  sources JSONB,
  quality_score DECIMAL CHECK (quality_score >= 0 AND quality_score <= 1),
  last_updated TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_template_type ON business_templates(business_type);
CREATE INDEX IF NOT EXISTS idx_template_stage ON business_templates(target_stage);

-- 7. BUSINESS DATA CACHE (store extracted structured data)
CREATE TABLE IF NOT EXISTS business_data_cache (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64),
  idea_hash VARCHAR(64) NOT NULL,

  -- Core identification
  business_name TEXT,
  business_type VARCHAR(100),
  industry_category TEXT,
  geographic_scope TEXT,

  -- Problem & Solution
  problem_statement TEXT,
  target_pain_points TEXT[],
  solution_description TEXT,
  unique_value_proposition TEXT,

  -- Market Size
  total_addressable_market JSONB,
  serviceable_addressable_market JSONB,
  serviceable_obtainable_market JSONB,
  market_growth_rate DECIMAL,
  market_maturity VARCHAR(50),
  market_trends JSONB,

  -- Target Customers
  ideal_customer_profile JSONB,
  primary_customer_segments JSONB,
  customer_acquisition_channels JSONB,

  -- Competition (stored as JSONB)
  direct_competitors JSONB,
  indirect_competitors JSONB,
  competitive_gaps TEXT[],
  competitive_advantages TEXT[],

  -- Financial Model
  pricing_model VARCHAR(50),
  pricing_tiers JSONB,
  average_revenue_per_user DECIMAL,
  customer_acquisition_cost JSONB,
  lifetime_value JSONB,
  ltv_cac_ratio DECIMAL,
  churn_rate DECIMAL,
  gross_margin DECIMAL,
  operating_margin DECIMAL,
  break_even_timeline JSONB,

  -- 5-Year Projections
  year_1 JSONB,
  year_2 JSONB,
  year_3 JSONB,
  year_4 JSONB,
  year_5 JSONB,

  -- Business Model
  revenue_streams JSONB,
  cost_structure JSONB,
  key_partners TEXT[],
  key_resources TEXT[],

  -- Go-to-Market
  launch_strategy TEXT,
  marketing_channels JSONB,
  partnerships JSONB,
  sales_process VARCHAR(50),

  -- Team & Operations
  founding_team_requirements JSONB,
  hiring_roadmap JSONB,
  organizational_structure VARCHAR(50),

  -- Risks
  market_risks JSONB,
  operational_risks JSONB,
  financial_risks JSONB,
  regulatory_risks JSONB,

  -- Legal & Compliance
  business_entity_type VARCHAR(50),
  required_licenses JSONB,
  regulatory_requirements TEXT[],

  -- Geographic Data
  target_locations JSONB,
  local_market_analysis JSONB,

  -- Funding
  funding_requirements JSONB,
  funding_sources TEXT[],
  valuation_range JSONB,

  -- Milestones
  day_90_milestones JSONB,
  month_12_milestones JSONB,
  year_3_milestones JSONB,

  -- Technology
  tech_stack JSONB,
  development_roadmap JSONB,

  -- Brand
  brand_positioning VARCHAR(50),
  brand_personality TEXT[],
  brand_messaging TEXT[],

  -- Meta
  data_sources TEXT[],
  confidence_scores JSONB,
  data_timestamp TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),

  UNIQUE(idea_hash)
);

CREATE INDEX IF NOT EXISTS idx_business_cache_session ON business_data_cache(session_id);
CREATE INDEX IF NOT EXISTS idx_business_cache_hash ON business_data_cache(idea_hash);
CREATE INDEX IF NOT EXISTS idx_business_cache_expires ON business_data_cache(expires_at);

-- 8. GENERATION RATINGS (quality feedback)
CREATE TABLE IF NOT EXISTS generation_ratings (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64),
  section VARCHAR(50),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratings_session ON generation_ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_ratings_section ON generation_ratings(section);

-- 9. WEB RESEARCH CACHE (avoid duplicate API calls)
CREATE TABLE IF NOT EXISTS web_research_cache (
  id SERIAL PRIMARY KEY,
  query_hash VARCHAR(64) NOT NULL,
  query TEXT NOT NULL,
  results JSONB,
  sources TEXT[],
  research_timestamp TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),

  UNIQUE(query_hash)
);

CREATE INDEX IF NOT EXISTS idx_web_research_hash ON web_research_cache(query_hash);
CREATE INDEX IF NOT EXISTS idx_web_research_expires ON web_research_cache(expires_at);
