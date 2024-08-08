document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const error = document.getElementById('login-error');
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && CryptoJS.AES.decrypt(u.password, 'secret key 123').toString(CryptoJS.enc.Utf8) === password);
    
    if ((username === 'admin' && password === 'admin123') || user) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'flex';
    } else {
        error.style.display = 'block';
    }
});

document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const email = document.getElementById('register-email').value;
    const error = document.getElementById('register-error');
    
    if (!validateEmail(email)) {
        error.style.display = 'block';
        error.textContent = 'Invalid email domain';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userExists = users.some(u => u.username === username);
    
    if (userExists) {
        error.style.display = 'block';
        error.textContent = 'Username already exists';
        return;
    }

    const encryptedPassword = CryptoJS.AES.encrypt(password, 'secret key 123').toString();
    users.push({ username, password: encryptedPassword, email });
    localStorage.setItem('users', JSON.stringify(users));

    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
});

document.getElementById('create-account-button').addEventListener('click', function() {
    document.getElementById('register-container').style.display = 'block';
    document.getElementById('login-container').style.display = 'none';
});

function validateEmail(email) {
    const validDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'web.de', 'web.com', 'web.fr', 'outlook.jp', 'finnishomo'];
    const emailDomain = email.split('@')[1];
    return validDomains.includes(emailDomain);
}

document.getElementById('message-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        addMessage(message, 'user');
        input.value = '';
        simulateBotResponse(message);
    }
});

document.getElementById('emoji-button').addEventListener('click', function() {
    const emojiPicker = document.getElementById('emoji-picker');
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('image-button').addEventListener('click', function() {
    document.getElementById('image-input').click();
});

document.getElementById('image-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            addMessage(`<img src="${e.target.result}" alt="Image" class="message-image">`, 'user');
            simulateBotResponse('image');
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('pin-button').addEventListener('click', function() {
    const pinnedMessages = document.getElementById('pinned-messages');
    pinnedMessages.style.display = pinnedMessages.style.display === 'none' ? 'block' : 'none';
});

document.addEventListener('click', function(event) {
    if (!event.target.closest('.context-menu')) {
        document.getElementById('context-menu').style.display = 'none';
    }
});

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
    const messageElement = event.target.closest('.message');
    if (messageElement) {
        const contextMenu = document.getElementById('context-menu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;

        document.getElementById('pin-message').onclick = function() {
            messageElement.classList.toggle('pinned');
            updatePinnedMessages();
            contextMenu.style.display = 'none';
        };

        document.getElementById('delete-message').onclick = function() {
            messageElement.remove();
            contextMenu.style.display = 'none';
        };

        document.getElementById('edit-message').onclick = function() {
            const newMessage = prompt('Edit your message:', messageElement.querySelector('.message-text').innerText);
            if (newMessage) {
                messageElement.querySelector('.message-text').innerText = newMessage;
            }
            contextMenu.style.display = 'none';
        };
    }
});

document.querySelectorAll('.channel').forEach(channel => {
    channel.addEventListener('click', function() {
        document.querySelector('.channel.selected').classList.remove('selected');
        this.classList.add('selected');
        const selectedChannel = this.getAttribute('data-channel');
        if (selectedChannel === 'private') {
            document.getElementById('chat-container').style.display = 'none';
            document.getElementById('key-container').style.display = 'block';
        } else {
            document.getElementById('messages').innerHTML = '';
            document.getElementById('key-container').style.display = 'none';
            document.getElementById('chat-container').style.display = 'flex';
        }
    });
});

document.getElementById('key-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const key = document.getElementById('access-key').value;
    const keyError = document.getElementById('key-error');
    if (key === '1827416471') {
        document.getElementById('key-container').style.display = 'none';
        document.getElementById('chat-container').style.display = 'flex';
        document.getElementById('messages').innerHTML = '';
    } else {
        keyError.style.display = 'block';
    }
});

function addMessage(text, sender) {
    const messageContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.innerHTML = text;
    
    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    const now = new Date();
    messageTime.innerText = now.toLocaleString();
    
    messageElement.appendChild(messageText);
    messageElement.appendChild(messageTime);
    
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function updatePinnedMessages() {
    const pinnedContainer = document.getElementById('pinned-container');
    pinnedContainer.innerHTML = '';
    const pinnedMessages = document.querySelectorAll('.message.pinned');
    pinnedMessages.forEach(msg => {
        const clonedMessage = msg.cloneNode(true);
        clonedMessage.classList.add('pinned-message');
        clonedMessage.addEventListener('click', function() {
            scrollToMessage(msg);
        });
        pinnedContainer.appendChild(clonedMessage);
    });
}

function scrollToMessage(messageElement) {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.scrollTop = messageElement.offsetTop - messagesContainer.offsetTop;
}

function simulateBotResponse(userMessage) {
    const responses = {
        "hello": "Hi there! How can I assist you today?",
        "how are you": "I'm just a bot, but I'm here to help!",
        "image": "Nice picture! What else can I do for you?",
        "😊": "Glad to see you're happy!"
        
    };


    const botMessage = responses[userMessage.toLowerCase()] || "I'm sorry, I didn't understand that.";
    setTimeout(() => {
        addMessage(botMessage, 'bot');
    }, 1000);
}

// Populate emoji picker with a list of emojis
const emojiPicker = document.getElementById('emoji-picker');
const emojis = ["😊", "😂", "😍", "😢", "😎", "😡", "👍", "🙏", "💪", "👏", "🎉", "❤️", "🤣", "😇", "😜", "😱", "😈", "👻", "👽", "🤖", "🎃", "😺", "🙀", "🤓", "🤔", "🤭", "🥳", "🥺", "🤩", "😏", "😌", "🤐", "😪", "😷", "🤒", "🤕", "🤑", "😲", "🤧", "😵", "🥴", "😎", "🤠", "🥳", "🥸", "🤥", "🤫", "🤭", "🧐", "🤓", "😈", "👿", "👹", "👺", "💀", "☠️", "👻", "👽", "👾", "🤖", "🎃", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🙈", "🙉", "🙊"];

emojis.forEach(emoji => {
    const button = document.createElement('button');
    button.innerText = emoji;
    button.addEventListener('click', () => {
        const messageInput = document.getElementById('message-input');
        messageInput.value += emoji;
        emojiPicker.style.display = 'none';
    });
    emojiPicker.appendChild(button);
});

function addMessage(text, sender) {
    const messageContainer = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.innerHTML = text;
    
    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    const now = new Date();
    messageTime.innerText = now.toLocaleString();
    
    messageElement.appendChild(messageText);
    messageElement.appendChild(messageTime);
    
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

document.getElementById('message-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (message) {
        addMessage(message, 'user');
        input.value = '';
        simulateBotResponse(message);
    }
});