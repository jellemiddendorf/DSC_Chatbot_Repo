const ChatbotModule = (function() {
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");
    let userMessage = null;
    const API_KEY = "PASTE-YOUR-API-KEY"; // Placeholder for the REST API key
    const inputInitHeight = chatInput.scrollHeight;

    let stateIDs, changeState;

    let pendingUserMessage = null; // Stores the last user input awaiting response
    let pendingResponse = null; // Stores the last chatbot response to be logged

    // Initializes the module and registers event listeners
    function init(stateIDsRef, changeStateRef) {
        stateIDs = stateIDsRef;
        changeState = changeStateRef;
        initListeners();
        displayStoredMessages(); // Load and display messages on startup
        console.log("Chatbot module initialized.");
    }

    // Sets up user interaction handlers for chat functionality
    function initListeners() {
        chatInput.addEventListener("input", () => {
            chatInput.style.height = "auto";
            chatInput.style.height = `${chatInput.scrollHeight}px`;
        });

        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) { //&& window.innerWidth > 800
                e.preventDefault();
                handleChat();
            }
        });

        sendChatBtn.addEventListener("click", handleChat);
    }

    // Handles user chat input
    function handleChat() {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        const chatLi = createChatLi(userMessage, "outgoing");
        chatbox.appendChild(chatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        pendingUserMessage = userMessage; // Store user input pending response

        setTimeout(() => {
            const incomingChatLi = createChatLi("Nadenken...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            changeState(stateIDs.AWAITING_CHATBOT_RESPONSE);
            generateResponse(incomingChatLi);
        }, 600);
    }

    // Generates a response from the chatbot
    function generateResponse(chatElement) {
        const API_URL = "https://api.openai.com/v1/chat/completions";
        const messageElement = chatElement.querySelector("p");
        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{role: "user", content: userMessage}]
            })
        };

        fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            const responseMessage = data.choices[0].message.content.trim();
            displayResponse(responseMessage);

            pendingResponse = responseMessage; // Store the response
            logChatMessage(); // Log both input and response

            changeState(stateIDs.CHATBOT_RESPONDING);
        }).catch(() => {
            messageElement.classList.add("error");
            messageElement.textContent = "Oeps! Er is iets fout gegaan. Probeer het opnieuw.";

            // pendingResponse = "Oeps! Er is iets fout gegaan. Probeer het opnieuw."; // Store error message
            // logChatMessage(); // Log the input with error message

            fetchWeather2(userMessage).then(weatherMessage => {
                messageElement.textContent = weatherMessage;
                messageElement.classList.remove("error");

                // Log the error or alternative response
                pendingResponse = weatherMessage; // Store the response
                logChatMessage(); // Log both input and response
            });

            changeState(stateIDs.CHATBOT_RESPONDING);
        }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }

    // Displays chatbot response in the chatbox
    function displayResponse(responseMessage) {
        const incomingChatLi = createChatLi(responseMessage, "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }

    // Log the conversation after both input and response are available
    function logChatMessage() {
        if (pendingUserMessage && pendingResponse) {
            const newMessage = {
                inputs: {
                    chat_input: pendingUserMessage
                },
                outputs: {
                    chat_output: pendingResponse
                }
            };
            updateChatHistory(newMessage);

            // Reset the pending messages
            pendingUserMessage = null;
            pendingResponse = null;
        }
    }

    // Fetches the chat history from cookies
    function getChatHistory() {
        const historyCookie = document.cookie.split("; ").find(row => row.startsWith("chatHistory="));
        return historyCookie ? JSON.parse(decodeURIComponent(historyCookie.split("=")[1])) : [];
    }

    // Updates the chat history in cookies
    function updateChatHistory(newMessage) {
        const chatHistory = getChatHistory();
        chatHistory.push(newMessage);
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Set expiration
        document.cookie = `chatHistory=${encodeURIComponent(JSON.stringify(chatHistory))}; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;
    }

    // Displays stored messages from cookies on page load
    function displayStoredMessages() {
        const chatHistory = getChatHistory();
        chatHistory.forEach(message => {
            // Display user's message
            const userChatLi = createChatLi(message.inputs.chat_input, "outgoing");
            chatbox.appendChild(userChatLi);

            // Check if there's a response and display it
            if (message.outputs.chat_output) {
                const responseChatLi = createChatLi(message.outputs.chat_output, "incoming");
                chatbox.appendChild(responseChatLi);
            }
        });
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }

    // Create chat list items
    function createChatLi(message, className) {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" ? `<p></p>` : `<span class="zehnder-letter">Z</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    }

    // Fetches weather data from the API
    async function fetchWeather2(query) {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=f2e9be0466ad4d56b76103541242204&q=${query}`);
        const data = await response.json();
        return `The current temperature in ${data.location.name} is ${data.current.temp_c}°C.`;
    }

    function getChatbotToggler() {
        return chatbotToggler;
    }

    function getSendChatBtn() {
        return sendChatBtn;
    }

    return {
        init,
        getChatbotToggler,
        getSendChatBtn
    };
})();
