-- Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the polls table
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the poll_options table
CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(255) NOT NULL
);

-- Create the votes table
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    poll_option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, poll_option_id) -- A user can only vote for an option once
);

-- Add indexes for performance
CREATE INDEX idx_polls_user_id ON polls(user_id);
CREATE INDEX idx_poll_options_poll_id ON poll_options(poll_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_poll_option_id ON votes(poll_option_id);
