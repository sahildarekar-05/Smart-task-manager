from flask import Blueprint, jsonify, request
import pandas as pd
import numpy as np
from models.task import Task

analytics = Blueprint('analytics', __name__)

@analytics.route('/analytics', methods=['GET'])
def task_analytics():

    user_id = int(request.args.get('user_id'))

    tasks = Task.query.filter_by(
        user_id=user_id
    ).all()

    # EMPTY TASK CASE
    if not tasks:
        return jsonify({
            "total_tasks": 0,
            "completed_tasks": 0,
            "pending_tasks": 0,
            "completion_percentage": 0
        })

    data = []
    for task in tasks:
        data.append({"status": task.status })

    df = pd.DataFrame(data)

    total_tasks = len(df)
    completed_tasks = len(
        df[df['status'] == 'Completed']
    )

    pending_tasks = len(
        df[df['status'] == 'Pending']
    )

    completion_percentage = np.round(
        (completed_tasks / total_tasks) * 100,
        2
    )

    return jsonify({
        "total_tasks": int(total_tasks),
        "completed_tasks": int(completed_tasks),
        "pending_tasks": int(pending_tasks),
        "completion_percentage": float(completion_percentage)
    })