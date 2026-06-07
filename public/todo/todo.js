let num_tasks = 1
let display_page = 1
let total_pages_before_delete = 1
let filter_active = false
let filter = ""
//TODO
//DELETE GOES TO LAST PAGE FOR SOME REASONS
// 

async function disable_login_inputs(){
    const response = await fetch(`/todo/get-user`,{
        headers:{
            "authorization": sessionStorage.getItem("token")
        }
    })
    const data = await response.json()
    
    document.getElementById("username_to_display").innerHTML = `Welcome, <strong>${data.username}</strong>`;

    // 2. Hide Login Controls, Show Logout
    document.getElementById("auth-controls").style.display = "none";
    document.getElementById("logout").style.display = "block";
    
    // 3. Clear inputs
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    document.getElementById("auth-controls").style.display = "none";
    document.getElementById("user-profile").style.display = "flex";

}


async function get_todo(){
    
    const token  = sessionStorage.getItem('token')
    if (!token){
        document.querySelector(".container").innerHTML = "Log in required!"
        return
    }
    disable_login_inputs()

    num_tasks = 1
   
    let url = `/todo/get-todo?page=${display_page}`

    if(filter_active){
        url += `&filter=${filter}`
    }
    
    const response = await fetch(url,{
    headers:{
        "authorization": token
    }})
    
    if (response.ok){
        const data = await response.json()

        
        
        
        renderTable(data)
        renderPagination(data)
        renderFilter(data)

    }
    else{
        console.error(response.error)
        document.querySelector("#content").innerHTML = response.error
    }
}
async function renderFilter(items){
    const distinctTypes = items.distinct_types
    const nav = document.querySelector("#filter-pagination-container");
    nav.innerHTML = ""; // Clear old buttons
    distinctTypes.forEach((type)=>{
            const btn = document.createElement("button");
            btn.textContent = type;
            btn.classList.add("filter")

            if (filter == type){
            btn.classList.add("active")
            }
            nav.appendChild(btn);
    })
}

function renderTable(items){
    
    const tbody = document.querySelector("#todo-table-body")
        tbody.innerHTML = ""
        num_tasks = (items.current_page - 1) * items.limit + 1
       
        items.todo_items.forEach((todo)=>{
            let row = document.createElement("tr")

            if (todo.done) {
                row.classList.add("task-done");
            }

            let row_task_num = document.createElement("td")
            row_task_num.textContent = num_tasks
            num_tasks += 1
            row.appendChild(row_task_num)

            let row_task = document.createElement("td")  //task desc
            row_task.textContent = todo.task
            row.appendChild(row_task)

            let task_type = document.createElement("td")
            task_type.textContent = todo.type
            row.appendChild(task_type)
            
            let row_action = document.createElement("td");
            let delete_btn = document.createElement("button");
            delete_btn.textContent = "Delete";
            delete_btn.id = todo._id
            delete_btn.className = "delete-btn";

            let edit_btn = document.createElement("button")
            edit_btn.textContent = "Edit"
            edit_btn.id = todo._id
            edit_btn.className = "edit-btn"
            
            let checkbox = document.createElement("input")
            checkbox.type = "checkbox"
            checkbox.id = todo._id
            if (todo.done){
                checkbox.checked = true
            }
            else{
                checkbox.checked = false
            }

            row_action.appendChild(delete_btn);
            row_action.appendChild(edit_btn);
            row_action.appendChild(checkbox)
            row.appendChild(row_action)
            

            tbody.appendChild(row)
        })
}

function renderPagination(items){
    const totalPages = items.total_pages
    const currentPage = items.current_page

    const nav = document.querySelector("#pagination-container");
    nav.innerHTML = ""; // Clear old buttons
    if (totalPages == 0) return; // No pages to display

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.classList.add("page")

        if (btn.textContent == display_page){
            btn.classList.add("active")
        }
        nav.appendChild(btn);
    }
}

async function deleteTodo(id,delete_all = false){
    const token = sessionStorage.getItem('token');
    const payload = {id:id}

    if (delete_all){
        payload.deleteall = true
    }
    let response = await fetch("/todo",{
    method:"DELETE",
    headers:{
        "authorization": token,
        "Content-Type":"application/json"},
    body:JSON.stringify(payload)
})
    if (response.ok){
        
        let url = `/todo/get-todo?page=${display_page}`;
        if (filter_active) {
            url += `&filter=${filter}`;
        }

        let delresponse = await fetch(url,{
        method: 'GET',
        headers:{
            "authorization": token
        }})

        const data = await delresponse.json() 
        
        //if not on last page, when delete, don't go to last page, unless total pages changes
        if (display_page > data.total_pages){
                display_page = data.total_pages
                if (display_page < 1){
                    display_page = 1
                }
            }
            get_todo()
            return       
    }

        get_todo()
    }


const addBtn = document.querySelector("#addTodo")

addBtn.addEventListener('click',()=>{
    addtoDo()
})

async function addtoDo(){
    const token = sessionStorage.getItem('token')
    if (!token){
        alert("Log in required!")
        return
    }
  
    const todoDesc = document.querySelector("#todoDesc").value
    const todoType = document.querySelector("#todoType").value

    const response = await fetch("/todo",{
        method:"POST",
        headers:{
            "authorization":token,
            "Content-Type":"application/json"},
            
        body:JSON.stringify({
            task: todoDesc,
            type: todoType
            // user: token.id
        })
    })
    if (response.ok){
        document.querySelector("#todoDesc").value = "";
        
        // logic for btn switching via event
        if (filter_active){

            // if filter is currently active, if a todo item is added to another category, switch to that category
            if (document.querySelector("#todoType").value != filter){
                
                // get specific btn (category) pressed
                const FilterBtn = document.querySelectorAll(".filter")
                const MatchingFilterBtn = Array.from(FilterBtn).find((btn)=>{
                //  return btn.textContent == document.querySelector("#todoType").value
                    return btn.textContent == document.querySelector("#todoType").value
                })

                // pass btn into event so that the clr switching logic etc can be triggered
                const filterEvent = new CustomEvent("filterChanged", {
                    detail: { target: MatchingFilterBtn }
                });

                //btn logic here
                window.dispatchEvent(filterEvent);

                //display page is set to 1 from prev event (not important as only total pages is retrieved)
                let url = `/todo/get-todo?page=${display_page}&filter=${filter}`
               
                const response = await fetch(url,{
                headers:{
                        "authorization": token
                    }})

                const data = await response.json()
               
                // display page is set to last page of the selected category, so can view the newly added todo item
                display_page = data.total_pages  
                get_todo()
                return

        }
            else{
                // filter active, todo item added within same category
                let url = `/todo/get-todo?page=${display_page}&filter=${filter}`
                const response = await fetch(url,{
                headers:{
                        "authorization": token
                    }})
                const data = await response.json()
                display_page = data.total_pages 
                get_todo() 
            }
        }

        else{
            //filter not active, add as per normal
            let url = `/todo/get-todo?page=${display_page}`
            
            const response = await fetch(url,{
            headers:{
                    "authorization": token
                }})
            const data = await response.json()
            display_page = data.total_pages  
            get_todo()
        }
            
        
        document.querySelector("#todoType").value = "";
    }
    else{
        let errortext = await response.text()
        alert(errortext)
    }

}
async function markDone(id, is_done, parentRow){

    if (parentRow){
        if (is_done){
            parentRow.classList.add("task-done")
        }
        else{
            parentRow.classList.remove("task-done")
        }
    }


    const token = sessionStorage.getItem("token")
     const response = await fetch("/todo",{
        method:"PUT",
        headers:{"Content-Type":"application/json",
            "authorization":token
        },
        body:JSON.stringify({
            id : id,
            done: is_done
        })
    })


    

}

async function openEditTodo(id){
    const token = sessionStorage.getItem("token")
    const response = await fetch(`/todo/get-todo?id=${id}`,{
        headers:{
            "authorization": token
        }
    })
    if (response.ok){
        const data = await response.json()
        openEditModal(data)
    }
    else{
        console.error(response.error)
    }
    
}
let current_id = null
function openEditModal(item) {
    document.getElementById("editModal").style.display = "block";
    current_id = item._id
    document.getElementById("editTodoDesc").value = item.task;
    document.getElementById("editTodoType").value = item.type;
}

function closeModal(){
    document.getElementById("editModal").style.display = "none";
}

async function editTodo(){
    const token = sessionStorage.getItem("token")
    let id = current_id
    let new_task = document.getElementById("editTodoDesc").value
    let new_type = document.getElementById("editTodoType").value 

    const response = await fetch("/todo",{
        method:"PUT",
        headers:{"Content-Type":"application/json",
            "authorization":token
        },
        body:JSON.stringify({
            id : id,
            task: new_task,
            type: new_type
        })
    })
    if (response.ok){
        get_todo()
    }
    else{
        let errortext = await response.text()
        alert(errortext)
    }
}


const container = document
container.addEventListener('click',(event)=>{
    if (event.target.tagName === "BUTTON" || event.target.tagName === "INPUT"){

        if (event.target.textContent == "Delete"){
            deleteTodo(event.target.id)
        }
        else if (event.target.textContent == "Edit"){
            openEditTodo(event.target.id)
        }
        else if (event.target.classList.contains("page")){
            display_page = event.target.textContent
            get_todo()
        }
        else if(event.target.textContent == "Cancel"){
            closeModal()
        }
        else if (event.target.type == "checkbox"){
            const parentRow = event.target.closest("tr")
            markDone(event.target.id,event.target.checked,parentRow)
        }
        else if (event.target.classList.contains("filter")){
            
            //changing filter view, start from page 1
            const filterEvent = new CustomEvent("filterChanged", {
            detail: { target: event.target }
        });
            display_page = 1;
            window.dispatchEvent(filterEvent);
            get_todo()
            
        }
        else if (event.target.id == "delete-all"){
            console.log("delete all clicked")
            if (confirm("Are you sure you want to clear all completed tasks?")) {
                deleteTodo(event.target.id, true)
            }
        }

    }

})

const save = document.getElementById("saveBtn")
save.addEventListener('click',async ()=>{
    await editTodo()
    closeModal()
})


window.addEventListener("filterChanged", (event) => {
    const targetElement = event.detail.target;
    if (!targetElement) return;

    //if btn clicked is active (filter active), remove filter active as filter is toggled off
    if (targetElement.classList.contains("active")) {
        filter_active = false;
        filter = "";
        targetElement.classList.remove("active"); // Remove the styling
    } 
    else {
    // if not, turn filter active to true and set filter to text content of the btn clciked
        document.querySelectorAll(".filter").forEach((btn) => {
            btn.classList.remove("active");
        });
        filter = targetElement.textContent.trim(); // Added .trim() to catch extra spaces
        filter_active = true;
        targetElement.classList.add("active"); // Apply the styling
    }
    
});

get_todo()