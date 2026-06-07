async function registerUser(){
    console.log('register button clicked!')
    const user_username = document.getElementById("username").value
    const user_password = document.getElementById("password").value

    const response = await fetch("/auth/register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            username: user_username,
            password: user_password
        })
    })
    if (response.ok){
        document.getElementById("username").value = ""
        document.getElementById("password").value = ""
        alert("User registered successfully!")
    }
    else{
        // 1. Capture the text sent by res.status(400).send("...")
        const errorMessage = await response.text(); 
        
        // 2. Display that specific message
        alert("Something went wrong: " + errorMessage);
    }

}

async function loginUser(){
    const user_username = document.getElementById("username").value
    const user_password = document.getElementById("password").value

     const response = await fetch("/auth/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            username: user_username,
            password: user_password
        })
    })
    if (response.ok){
        const data = await response.json()
        sessionStorage.setItem('token', data.token);
        
        window.location.reload();

    }
    else{
        // 1. Capture the text sent by res.status(400).send("...")
        const errorMessage = await response.text(); 
        
        // 2. Display that specific message
        alert("Something went wrong: " + errorMessage);
    }


}

function logOut(){
    sessionStorage.removeItem("token")
    window.location.reload();
}

const container = document
container.addEventListener('click',(event)=>{
    if(event.target.id == "register"){
        registerUser()
    }
    else if(event.target.id == "login"){
        loginUser()
    }
    else if (event.target.id == "logout"){
        logOut()
    }
})
