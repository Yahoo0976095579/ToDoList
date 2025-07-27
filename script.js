document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://localhost:7003/api/todoitems';
    const newTodoInput = document.getElementById('new-todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const incompleteTodoList = document.getElementById('incomplete-todo-list');
    const completedTodoList = document.getElementById('completed-todo-list');

    // --- API Functions ---

    // GET: 取得所有待辦事項
    async function fetchTodos() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const todos = await response.json();
            renderTodos(todos);
        } catch (error) {
            console.error("無法讀取待辦事項:", error);
            alert("無法載入待辦事項，請檢查後端服務是否已啟動，或API路徑是否正確。");
        }
    }

    // POST: 新增一個待辦事項
    async function addTodo() {
        const todoText = newTodoInput.value.trim();
        if (todoText === '') {
            alert("請輸入待辦事項!");
            return;
        }

        const newTodo = {
            name: todoText, // 根據您的後端調整，這裡假設欄位是 "name"
            isComplete: false
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTodo)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            newTodoInput.value = ''; // 清空輸入框
            fetchTodos(); // 重新整理列表
        } catch (error) {
            console.error("無法新增待辦事項:", error);
            alert("新增失敗，請稍後再試。");
        }
    }

    // PUT: 更新待辦事項 (例如：標示為完成)
    async function updateTodoStatus(todo) {
        try {
            const updatedTodo = { ...todo, isComplete: !todo.isComplete }; // 複製物件並反轉 isComplete 狀態
            const response = await fetch(`${apiUrl}/${todo.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedTodo) // 發送完整的更新後物件
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchTodos(); // 重新整理列表
        } catch (error) {
            console.error(`無法更新ID為 ${todo.id} 的待辦事項:`, error);
        }
    }

    // DELETE: 刪除一個待辦事項
    async function deleteTodo(id) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchTodos(); // 重新整理列表
        } catch (error) {
            console.error(`無法刪除ID為 ${id} 的待辦事項:`, error);
        }
    }

    // --- UI Functions ---

    // 在畫面上渲染待辦事項
    function renderTodos(todos) {
        incompleteTodoList.innerHTML = ''; // 清空現有列表
        completedTodoList.innerHTML = ''; // 清空現有列表
        if (!Array.isArray(todos)) return;

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.dataset.id = todo.id; // 假設您的todo物件有id屬性
            if (todo.isComplete) {
                li.classList.add('completed');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.isComplete;
            checkbox.addEventListener('change', () => {
                updateTodoStatus(todo);
            });

            const todoTextSpan = document.createElement('span');
            todoTextSpan.className = 'todo-text';
            todoTextSpan.textContent = todo.name; // 假設您的todo物件有name屬性
            // 點擊文字來切換完成狀態 (保留原功能，但現在有checkbox更直觀)
            todoTextSpan.addEventListener('click', () => {
                updateTodoStatus(todo);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '刪除';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止觸發li的點擊事件
                if (confirm(`確定要刪除「${todo.name}」嗎?`)) {
                    deleteTodo(todo.id);
                }
            });

            li.appendChild(checkbox); // 新增 checkbox
            li.appendChild(todoTextSpan);
            li.appendChild(deleteBtn);

            if (todo.isComplete) {
                completedTodoList.appendChild(li);
            } else {
                incompleteTodoList.appendChild(li);
            }
        });
    }

    // --- Event Listeners ---

    // 新增按鈕的點擊事件
    addTodoBtn.addEventListener('click', addTodo);

    // 在輸入框按 Enter 鍵也能新增
    newTodoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTodo();
        }
    });

    // --- Initial Load ---

    // 頁面載入時，取得所有待辦事項
    fetchTodos();
});
