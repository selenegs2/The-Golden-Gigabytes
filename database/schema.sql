/* note:i capitalized everything to make it easier to read + distinguish, capitilzation doesn't matter */
/* user table below */
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* course table below */
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE, 
    /* DELETE CASCADE -> when a user is deleted, their courses will be too */
    course_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(20)
);

/* assignments table below */
CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    priority_score INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE
);
