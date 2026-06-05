-- Migration: Add tracking sessions and locations
-- Run: psql -d your_database -f add_tracking_sessions.sql

CREATE TYPE tracking_session_status_enum AS ENUM ('inactive', 'active', 'paused', 'completed');

CREATE TABLE tracking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  status tracking_session_status_enum DEFAULT 'inactive',
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tracking_session_provider ON tracking_sessions(provider_id);
CREATE INDEX idx_tracking_session_customer ON tracking_sessions(customer_id);
CREATE INDEX idx_tracking_session_status ON tracking_sessions(status);
CREATE INDEX idx_tracking_session_provider_status ON tracking_sessions(provider_id, status);
CREATE INDEX idx_tracking_session_customer_status ON tracking_sessions(customer_id, status);
CREATE INDEX idx_tracking_session_created ON tracking_sessions(created_at);

CREATE TABLE tracking_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_session_id UUID NOT NULL REFERENCES tracking_sessions(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(6, 2),
  heading INTEGER,
  recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tracking_location_session_time ON tracking_locations(tracking_session_id, recorded_at);
CREATE INDEX idx_tracking_location_session ON tracking_locations(tracking_session_id);
CREATE INDEX idx_tracking_location_recorded ON tracking_locations(recorded_at);

CREATE TABLE tracking_audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_session_id UUID NOT NULL REFERENCES tracking_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(30) NOT NULL,
  previous_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_tracking_session ON tracking_audit_events(tracking_session_id);
CREATE INDEX idx_audit_tracking_created ON tracking_audit_events(created_at);
