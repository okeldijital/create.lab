CREATE TABLE calendars (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT calendars_status_check CHECK (status IN ('ACTIVE', 'ARCHIVED')),
  CONSTRAINT calendars_org_name_unique UNIQUE (organization_id, name)
);

CREATE INDEX calendars_organization_idx ON calendars(organization_id);
CREATE INDEX calendars_status_idx ON calendars(status);

CREATE TABLE schedules (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  timezone TEXT NOT NULL,
  status TEXT NOT NULL,
  calendar_id UUID NOT NULL REFERENCES calendars(id),
  purpose TEXT,
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT schedules_status_check CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  CONSTRAINT schedules_effective_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE INDEX schedules_organization_idx ON schedules(organization_id);
CREATE INDEX schedules_calendar_idx ON schedules(calendar_id);
CREATE INDEX schedules_status_idx ON schedules(status);

CREATE TABLE time_blocks (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  schedule_id UUID NOT NULL REFERENCES schedules(id),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  block_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT time_blocks_type_check CHECK (block_type IN ('BOOKABLE', 'BLOCKED', 'MAINTENANCE', 'BREAK')),
  CONSTRAINT time_blocks_status_check CHECK (status IN ('OPEN', 'COMPLETED', 'REMOVED')),
  CONSTRAINT time_blocks_range_check CHECK (end_at > start_at)
);

CREATE INDEX time_blocks_organization_idx ON time_blocks(organization_id);
CREATE INDEX time_blocks_schedule_idx ON time_blocks(schedule_id);
CREATE INDEX time_blocks_status_idx ON time_blocks(status);
CREATE INDEX time_blocks_range_idx ON time_blocks(start_at, end_at);

CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  schedule_id UUID NOT NULL REFERENCES schedules(id),
  time_block_id UUID NOT NULL REFERENCES time_blocks(id),
  title TEXT NOT NULL,
  booking_type TEXT,
  resource_reference TEXT,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT bookings_status_check CHECK (status IN ('PLANNED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))
);

CREATE INDEX bookings_organization_idx ON bookings(organization_id);
CREATE INDEX bookings_schedule_idx ON bookings(schedule_id);
CREATE INDEX bookings_time_block_idx ON bookings(time_block_id);
CREATE INDEX bookings_status_idx ON bookings(status);

CREATE TABLE shifts (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  working_pattern_id UUID NOT NULL,
  shift_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT shifts_type_check CHECK (shift_type IN ('MORNING', 'AFTERNOON', 'NIGHT', 'CUSTOM'))
);

CREATE INDEX shifts_organization_idx ON shifts(organization_id);
CREATE INDEX shifts_working_pattern_idx ON shifts(working_pattern_id);
