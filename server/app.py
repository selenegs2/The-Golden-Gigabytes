from flask import Flask,
request,jsonify

app = Flask(__name__)

# Courses Routes

@app.route('/courses', methods = ['GET'])
def get_courses():
  return  jsonify({¨"message":Get all courses"})

@app.route ('/courses', methods = ['POST'])
def create_course():
  return   jsonify({¨"message":Course created"})

@app.route ('/courses/<int:id>', methods=['PUT'])
def update_course(id):
  return  jsonify({¨"message":f"Course {id} updated"})

@app.route ('/courses/<int:id>', methods=['DELETE'])
def delete_course(id):
  return jsonify({¨"message":f"Course {id} deleted"})

# Assigments Routes 
@app.route('/assignments', methods=['GET'])
def get_assignments():
  return jsonify({"message": "Get all assignments"})

@app.route('/assignments', methods=['POST'])
def create_assignment():
  return   jsonify({"message": "Assignment created"})

@app.route('/assignments/<int:id>', methods=['PUT'])
def update_assignment(id):
  return jsonify({"message": f"Assignment {id} updated"})

@app.route('/assignments/<int:id>', methods=['DELETE'])
def delete_assignment(id):
  return jsonify({"message": f"Assignment {id} deleted"})

if__name__== '__main__':
    app.run(debug=True)                 
