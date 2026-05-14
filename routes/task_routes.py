from flask import Blueprint, app, request, jsonify
from extensions import db , socketio
from models.task import Task

task = Blueprint('task', __name__)

# ADD TASK
@task.route('/add-task', methods=['POST'])
def add_task():

    data = request.get_json()

    new_task = Task(
        title=data['title'],
        description=data['description'],
        priority=data['priority'],
        status=data['status'],
        due_date=data['due_date'],
        user_id=data['user_id']
    )

    db.session.add(new_task)
    db.session.commit()

    socketio.emit('new_task', {
    'message': 'New task added successfully'
    })

    return jsonify({
        "message": "Task added successfully"
    })


# GET ALL TASKS
@task.route('/tasks', methods=['GET'])
def get_tasks():

    user_id = int(request.args.get('user_id'))
    tasks = Task.query.filter_by(
        user_id =user_id
    ).all()
    task_list = []

    for task in tasks:
        task_list.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "status": task.status,
            "due_date": str(task.due_date)
        })

    return jsonify(task_list)


# UPDATE TASK
@task.route('/update-task/<int:id>', methods=['PUT'])
def update_task(id):

    task = Task.query.get(id)

    if not task:
        return jsonify({
            "message": "Task not found"
        }), 404

    data = request.get_json()

    task.title = data['title']
    task.description = data['description']
    task.priority = data['priority']
    task.status = data['status']
    task.due_date = data['due_date'] 

    db.session.commit()

    return jsonify({
        "message": "Task updated successfully"
    })

# COMPLETE TASK
@task.route('/complete-task/<int:id>', methods=['PUT'])
def complete_task(id):
    task_item = Task.query.get(id)
    if not task_item:
        return jsonify({
            "message": "Task not found"
        }), 404
    
    task_item.status = "Completed"
    db.session.commit()

    return jsonify({
        "message": "Task marked as completed"
    })

# DELETE TASK
@task.route('/delete-task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):

    task = Task.query.get(task_id)

    if not task:
        return jsonify({
            "message": "Task not found"
        }), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({
        "message": "Task deleted successfully"
    })

