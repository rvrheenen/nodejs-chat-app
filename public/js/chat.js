const socket = io()

// elements
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector("#send-location")
const $messages = document.querySelector("#messages")

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const urlMessageTemplate = document.querySelector('#url-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
var {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.emit("joinRoom", {username, room}, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

const autoscroll = () => {
    // new message
    var $newMessage = $messages.lastElementChild

    // height of new message
    var newMessageStyles = getComputedStyle($newMessage)
    var newMessageMargin = parseInt(newMessageStyles.marginBottom)
    var newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height
    var visibleHeight = $messages.offsetHeight

    // height of messages container
    var containerHeight = $messages.scrollHeight

    // How far have I scrolled
    var scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

const autoscroll2 = () => {
    
}


// receive from socket
socket.on("message", (message) => {
    console.log(message)
    var html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on("locationMessage", (message) => {
    console.log(message)
    var html = Mustache.render(urlMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend", html)
})

socket.on("roomData", ({room, users}) => {
    var html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})


// send message
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.disabled = true

    let message = e.target.elements.message.value
    
    socket.emit("sendMessage", message, (error) => {
        $messageFormButton.disabled = false
        $messageFormInput.value = ""
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log("message delivered!")
    })
})


// send location
$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) return alert("Geolocation not supported by browser.")

    $sendLocationButton.disabled = true

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendLocation", {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }, (error) => {
            $sendLocationButton.disabled = false
            
            if (error) {
                return console.log(error)
            }
            console.log('location shared!')
        })
    })
})
