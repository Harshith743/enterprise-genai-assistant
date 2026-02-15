const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const statusIndicator = document.getElementById('status-indicator');
const statusText = statusIndicator.querySelector('.text');

// Poll for health status
const checkHealth = async () => {
    try {
        const res = await fetch('/api/health');
        if (res.ok) {
            statusIndicator.classList.add('ready');
            statusText.innerText = 'Ready';
            userInput.disabled = false;
            sendButton.disabled = false;
        } else {
            setTimeout(checkHealth, 2000);
        }
    } catch (e) {
        setTimeout(checkHealth, 2000);
    }
};

// Initial state
userInput.disabled = true;
sendButton.disabled = true;
checkHealth();

// Append message to UI
function appendMessage(role, text) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', role === 'user' ? 'user-message' : 'bot-message');

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.innerText = text; // Secure from XSS by using innerText

    msgDiv.appendChild(contentDiv);
    chatContainer.appendChild(msgDiv);

    // Scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.id = 'typing-indicator';
    msgDiv.classList.add('message', 'bot-message');

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.innerHTML = `
        <div class="typing-dots">
            <span></span><span></span><span></span>
        </div>
    `;

    msgDiv.appendChild(contentDiv);
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Handle submit
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = userInput.value.trim();
    if (!query) return;

    // UI Updates
    appendMessage('user', query);
    userInput.value = '';
    userInput.disabled = true;
    sendButton.disabled = true;

    showTypingIndicator();

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });

        const data = await res.json();
        removeTypingIndicator();

        if (data.error) {
            appendMessage('bot', `Error: ${data.error}`);
        } else {
            appendMessage('bot', data.response);
        }

    } catch (err) {
        removeTypingIndicator();
        appendMessage('bot', 'Sorry, I encountered a network error.');
        console.error(err);
    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
});
