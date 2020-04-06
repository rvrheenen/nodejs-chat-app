const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) return {
        error: "Username and room are required!"
    }

    // Check for existing user

    if ( users.find(user => (user.room == room && user.username == username))  ) return {
        error: "Username is already taken in this room."
    }

    // Store user
    var user = {
        id,
        username,
        room
    }
    users.push(user)
    return {user}
}

const removeUser = (id) => {
    var index = users.findIndex(user => user.id == id)
    if (index >= 0)  return users.splice(index, 1)[0]
    
}

const getUser = (id) => {
    return users.find(user => user.id == id)
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room == room.trim().toLowerCase())
}

const getRooms = () => {
    return Array.from(new Set(users.map(u => u.room)))
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
}