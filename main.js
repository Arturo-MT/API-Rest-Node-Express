let mealsState = []
let ruta = 'login'
let user = {}


const stringToHTML= (s)=>{
    const parser = new DOMParser()
    const doc = parser.parseFromString(s, 'text/html')
    
    return doc.body.firstChild
}

const renderOrder =(order, meals)=>{
    const meal = meals.find(meal => meal._id === order.meal_id)
    const element = stringToHTML(`<li data-id=${order._id}>${meal.name} - ${order.user_id}<li/>`)
    return element
}

const renderItem =(item)=>{
    const element = stringToHTML(`<li data-id=${item._id}>${item.name}<li/>`)

    element.addEventListener('click', ()=>{
        const mealsList = document.getElementById('meals-list')
        Array.from(mealsList.children).forEach(x => x.classList.remove('selected'))
        element.classList.add('selected')
        const mealsIdInput = document.getElementById('meals-id')
        mealsIdInput.value= item._id
    })

    console.log(element)
    return element
}

const initializeForm = () =>{
    const orderForm = document.getElementById('order')
    orderForm.onsubmit = (e) =>{
        e.preventDefault()
        const submit = document.getElementById('submit')
        submit.setAttribute('disabled', true)
        const mealId = document.getElementById('meals-id')
        const mealIdValue = mealId.value
        if(!mealIdValue){
            alert('Debe seleccionar un plato.')
            return
        }
        const order = {
            meal_id:mealIdValue,
            user_id:user._id,
        }
        const token2 = localStorage.getItem('token')
        fetch('https://serverless-six-ochre.vercel.app/api/orders',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: token2,
            },
            body: JSON.stringify(order)
        }).then(x=> x.json())
        .then(respuesta => {
            const renderedOrder = renderOrder(respuesta, mealsState)
            const ordersList = document.getElementById('orders-list')
            ordersList.appendChild(renderedOrder)
            submit.removeAttribute('disabled')
        })
    }
}

const initializeData = () =>{
    fetch('https://serverless-six-ochre.vercel.app/api/meals')
    .then(response => response.json())
    .then(data => {
        mealsState = data
        const mealsList = document.getElementById('meals-list')
        const submit = document.getElementById('submit')
        const itemsList = data.map(renderItem)
        mealsList.removeChild(mealsList.firstElementChild)
        itemsList.forEach(element => mealsList.appendChild(element))
        submit.removeAttribute('disabled')
        fetch('https://serverless-six-ochre.vercel.app/api/orders')
            .then(response => response.json())
            .then(ordersData =>{
                const ordersList = document.getElementById('orders-list')
                const lisOrders = ordersData.map(orderData => renderOrder(orderData, data))
                ordersList.removeChild(ordersList.firstElementChild)
                lisOrders.forEach(element =>ordersList.appendChild(element))
            })
    })
}

const renderApp = () =>{
    const token = localStorage.getItem('token')
    if(token){
        user = JSON.parse(localStorage.getItem('user'))
        return renderOrders()
    }
    renderLogin()

    const registerP = document.getElementById("register-P")
    registerP.addEventListener('click', ()=>{
        renderRegister()
    })
}

const renderOrders = () =>{
    const ordersView = document.getElementById('orders-view')
    document.getElementById('app').innerHTML = ordersView.innerHTML
    initializeForm()
    initializeData()
}

const renderLogin = () =>{
    const loginTemplate = document.getElementById('login-template')
    document.getElementById('app').innerHTML = loginTemplate.innerHTML

    const loginForm = document.getElementById('login-form')
    loginForm.onsubmit = (e)=>{
        e.preventDefault()
        const emailUsuario = document.getElementById('email').value
        const passwordUsuario = document.getElementById('password').value

    fetch('https://serverless-six-ochre.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailUsuario, password: passwordUsuario }),
    }).then(x => x.json())
        .then(respuesta =>{
            localStorage.setItem('token', respuesta.token)
            ruta = 'orders'
            return respuesta.token
        })
        .then(token => {
            return fetch('https://serverless-six-ochre.vercel.app/api/auth/me',{
                method:'GET',
                headers:{
                    'Content-Type':'application/json',
                    authorization: token,
                },        
            })
        })
        .then(x => x.json())
        .then(fetchedUser => {
            user = fetchedUser
            localStorage.setItem('user', JSON.stringify(fetchedUser))
            renderOrders()
        })
    }
}

const renderRegister= () =>{
    const registerTemplate = document.getElementById('register-template')
    document.getElementById('app').innerHTML = registerTemplate.innerHTML

    const registerForm = document.getElementById('register-form')
    registerForm.onsubmit = (e)=>{
        e.preventDefault()
        const emailUsuario = document.getElementById('email-register').value
        const passwordUsuario = document.getElementById('password-register').value
        const passwordConfirm = document.getElementById('password-confirmation').value
        const eq= passwordUsuario == passwordConfirm
        if(eq){
            fetch('https://serverless-six-ochre.vercel.app/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: emailUsuario, password: passwordUsuario }),
            }).then(x => x.json())
            .then(respuesta =>{
                localStorage.setItem('token', respuesta.token)
                ruta = 'orders'
                return respuesta.token
            })
            .then(token => {
                return fetch('https://serverless-six-ochre.vercel.app/api/auth/me',{
                    method:'GET',
                    headers:{
                        'Content-Type':'application/json',
                        authorization: token,
                    },        
                })
            })
            .then(x => x.json())
            .then(fetchedUser => {
                user = fetchedUser
                localStorage.setItem('user', JSON.stringify(fetchedUser))
                renderOrders()
            })
        }
    }
}

window.onload= () =>{
    renderApp()
}