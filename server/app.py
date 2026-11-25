from flask import Flask, request, jsonify
from database import get_connection
from ai_service import prioritize_assignments

app = Flask(__name__)

# Courses Routes
@app.route('/courses', methods=['GET'])
def get_courses():
    return jsonify({"message": "Get all courses"})

@app.route('/courses', methods=['POST'])
def create_course():
    return jsonify({"message": "Course created"})

@app.route('/courses/<int:id>', methods=['PUT'])
def update_course(id):
    return jsonify({"message": f"Course {id} updated"})

@app.route('/courses/<int:id>', methods=['DELETE'])
def delete_course(id):
    return jsonify({"message": f"Course {id} deleted"})

# Assignments Routes
@app.route('/assignments', methods=['GET'])
def get_assignments():
    return jsonify({"message": "Get all assignments"})

@app.route('/assignments', methods=['POST'])
def create_assignment():
    return jsonify({"message": "Assignment created"})

@app.route('/assignments/<int:id>', methods=['PUT'])
def update_assignment(id):
    return jsonify({"message": f"Assignment {id} updated"})

@app.route('/assignments/<int:id>', methods=['DELETE'])
def delete_assignment(id):
    return jsonify({"message": f"Assignment {id} deleted"})

# AI Routes
@app.route('/api/ai/prioritize', methods=['POST'])
def prioritize_tasks():
    data = request.get_json(silent=True) or {}
    user_id = data.get("user_id")

    if type(user_id) is not int or user_id <= 0:
        return jsonify({"error": "Valid user_id is required"}), 400

    conn = None

    try:
        conn = get_connection()

        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT id, course_name
                FROM courses
                WHERE user_id = %s
            """, (user_id,))

            courses = [
                {"course_id": row[0], "course": row[1]}
                for row in cursor.fetchall()
            ]

            cursor.execute("""
                SELECT a.id, a.title, c.course_name, a.due_date
                FROM assignments a
                JOIN courses c ON a.course_id = c.id
                WHERE c.user_id = %s
                AND a.is_completed = FALSE
            """, (user_id,))

            assignments = [
                {
                    "assignment_id": row[0],
                    "title": row[1],
                    "course": row[2],
                    "due_date": str(row[3])
                }
                for row in cursor.fetchall()
            ]

        if not assignments:
            return jsonify({"recommendations": []})

        result = prioritize_assignments({
            "courses": courses,
            "assignments": assignments
        })

        return jsonify(result)

    except Exception:
        app.logger.exception("AI prioritization failed")
        return jsonify({"error": "Unable to prioritize tasks"}), 503

    finally:
        if conn is not None:
            conn.close()


if __name__ == '__main__':
    app.run(debug=True)