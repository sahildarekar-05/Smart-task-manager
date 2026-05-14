let taskChart
let editingTaskId = null
// CHECK USER AUTHENTICATION
if (
    window.location.pathname === '/dashboard'
) {
    const user = localStorage.getItem('user_id')
    if (!user) {
        window.location.href = '/login-page'
    }
}


let currentUserId = localStorage.getItem('user_id')

console.log("SCRIPT WORKING")
const socket = io()

socket.on('new_task', function(data) {
    // alert(data.message)
    loadTasks()
    loadAnalytics()
})


// LOAD TASKS
async function loadTasks() {

    try {
        const currentUserId = localStorage.getItem('user_id')
        const response = await fetch(`/tasks?user_id=${currentUserId}`) 
        const tasks = await response.json()
        console.log(tasks)
        let tableData = ''
        const searchValue = document.getElementById('searchInput').value.toLowerCase()
        const filterValue =document.getElementById('filterSelect').value
       
        tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase()
                .includes(searchValue)

            let matchesFilter = true
            if (filterValue === 'Pending') {
                matchesFilter =
                    task.status === 'Pending'
            }
            else if (filterValue === 'Completed') {
                matchesFilter =
                    task.status === 'Completed'
            }

            else if (filterValue === 'High' ||
                filterValue === 'Medium' ||
                filterValue === 'Low'
            ) {
                matchesFilter =
                    task.priority === filterValue
            }
            return matchesSearch && matchesFilter
        })
        .forEach(task => {
            const today = new Date()
            const taskDate = new Date(task.due_date)

            let overdueText = ''
            if (
                task.status !== 'Completed'
                &&
                taskDate < today
            ) {
                overdueText =
                    '<span style="color:red;font-weight:bold;">Overdue</span>'
            }
            tableData += `
                <tr>
                    <td>${task.title}</td>
                    <td>${task.description}</td>
                    <td>
                        <span class="${task.priority.toLowerCase()}-priority"> ${task.priority} </span>
                    </td>
                    <td>${task.status}</td>
                    <td>${overdueText} <br> ${task.due_date}</td>
                    <td>
                        <button onclick="editTask(
                            ${task.id},
                            '${task.title}',
                            '${task.description}',
                            '${task.priority}',
                            '${task.status}',
                        )"> Edit </button>

                        <button onclick="completeTask(${task.id})"> Complete </button>
                        <button onclick="deleteTask(${task.id})"> Delete </button>
                    </td>
                </tr>
            `
        })

        document.getElementById('taskTableBody').innerHTML = tableData

    }
    catch(error) {
        console.log(error)
    }
}


// LOAD ANALYTICS
async function loadAnalytics() {

    try {
        const currentUserId = localStorage.getItem('user_id')
        if (!currentUserId) {
             window.location.href = '/login-page'
        }
        const response = await fetch(`/analytics?user_id=${currentUserId}`)
        const data = await response.json()

        // DESTROY OLD CHART

        if (taskChart) {
            taskChart.destroy()
        }

        // CREATE NEW CHART
        const ctx = document.getElementById('taskChart')
        taskChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Completed','Pending'],
                datasets: [{

                    data: [data.completed_tasks,data.pending_tasks],
                    backgroundColor: [ 'green','orange']             }]
            }
        })

        document.getElementById('totalTasks').innerText = data.total_tasks
        document.getElementById('completedTasks').innerText = data.completed_tasks

        document.getElementById('pendingTasks').innerText =data.pending_tasks

        document.getElementById('completionPercentage').innerText = data.completion_percentage + '%'
    }
    catch(error) {
        console.log(error)
    }
}

// ADD TASK
document.getElementById('taskForm')
.addEventListener('submit', async function(e) {

    e.preventDefault()

    const currentUserId =
        localStorage.getItem('user_id')

    const taskData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        priority: document.getElementById('priority').value,
        status: document.getElementById('status').value,
        due_date:document.getElementById('dueDate').value,
        user_id: currentUserId
    }

    console.log(editingTaskId)
    // UPDATE TASK
    if (editingTaskId) {
        await fetch(`/update-task/${editingTaskId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(taskData)
        })

        alert('Task Updated Successfully')
        editingTaskId = null
        document.querySelector('#taskForm button')
                .innerText = 'Add Task'
    }

    // ADD TASK
    else {
        await fetch('/add-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        })
        console.log(taskData)
        alert('Task Added Successfully')
    }

    loadTasks()
    loadAnalytics()
    this.reset()
})

// DELETE TASK 
async function deleteTask(taskId) {
    const response = await fetch(`/delete-task/${taskId}`, {
        method: 'DELETE'
    })

    const data = await response.json()
    alert(data.message)
    loadTasks()
    loadAnalytics()
}

// MARK TASK AS COMPLETED
async function completeTask(id) {
    try {
        const response = await fetch(
            `/complete-task/${id}`,
            {
                method: 'PUT'
            }
        )
        const data = await response.json()
        alert(data.message)
        loadTasks()
        loadAnalytics()
    }
    catch(error) {
        console.log(error)
    }
}

// USER LOGIN FUNCTION
async function loginUser() {
    console.log("LOGIN BUTTON CLICKED")
    const username = document.getElementById('loginUsername').value
    const password = document.getElementById('loginPassword').value

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    })
    const data = await response.json()

    if (response.ok) {
        localStorage.setItem('user_id', data.user_id)
        localStorage.setItem('username', data.username)
        alert(data.message)
        window.location.href = '/dashboard'
    } 
    else {
        alert(data.message)
    }
}

// USER REGISTRATION 
async function registerUser() {
    const username = document.getElementById('registerUsername').value
    const password = document.getElementById('registerPassword').value
    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username,
            password
        })
    })
    const data = await response.json()

    alert(data.message)
    if (response.ok) {
        window.location.href = '/login-page'
    }
}

// lOGOUT USER 
function logoutUser() {
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    window.location.href = '/login-page'
}

// EDIT TASK FUNCTION
function editTask(
    id,
    title,
    description,
    priority,
    status
) {

    editingTaskId = id
    document.getElementById('title').value = title
    document.getElementById('description').value =description
    document.getElementById('priority').value = priority
    document.getElementById('status').value = status
    document.querySelector('#taskForm button') .innerText = 'Update Task'
}

// INITIAL LOAD
loadTasks()
loadAnalytics()

document.getElementById('searchInput')
.addEventListener('input', loadTasks)

document.getElementById('filterSelect')
.addEventListener('change', loadTasks)

window.onload = function() {
    document.getElementById('taskForm').reset()
}