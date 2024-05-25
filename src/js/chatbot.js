const ChatbotModule = (function() {
    // DOM elements
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    // Variables
    let userMessage = null;
    const inputInitHeight = chatInput.scrollHeight;
    let stateIDs, changeState;


    // Initializes the module and registers event listeners
    // stateIDsRef: reference to the stateIDs enum in the states module
    // changeStateRef: reference to the changeState function in the stateMachine module
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
            if (e.key === "Enter" && !e.shiftKey) {
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

        setTimeout(() => {
            // Transition to the awaiting chatbot response state
            changeState(stateIDs.AWAITING_CHATBOT_RESPONSE);
            generateResponse();
        }, 600);
    }

    // Generates a response from the chatbot
    function generateResponse() {
        const API_URL = "https://jmi-dsc-chatbot-function-app.azurewebsites.net/api/JMI-DSC-Chatbot-HttpTrigger1";
        let chatHistory = getChatHistory(); // Retrieve existing chat history

        const currentMessage = {
            role: "user",
            content: userMessage
        };

        // Create a temporary updated history with the current message added to the end
        let updatedHistory = [...chatHistory, currentMessage];

        const data = {
            prompt: userMessage,
            messages: updatedHistory
        };

        console.log("Sending data to Azure Function:", JSON.stringify(data)); // Log the data being sent

        // Display a placeholder message while waiting for response
        const placeholderMessageLi = createChatLi("Nadenken...", "incoming");
        chatbox.appendChild(placeholderMessageLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);

        fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(res => {
            console.log("Received raw response:", res); // Log raw response
            if (!res.ok) {
                throw new Error("Network response was not ok: " + res.statusText);
            }
            return res.json();
        })
        .then(data => {
            console.log("Parsed response data:", data); // Log parsed data
            const responseMessage = data.response;

            // Display response and remove placeholder
            displayResponse(responseMessage);
            placeholderMessageLi.remove();

            // Transition to the responding state
            changeState(stateIDs.CHATBOT_RESPONDING);

            // Log the interaction
            logChatMessage(userMessage, responseMessage);
        })
        .catch(error => {
            console.error("Error fetching data:", error); // Log any errors
            placeholderMessageLi.textContent = "Oeps! Er is iets fout gegaan. Probeer het opnieuw.";
            // Transition to the error state
            changeState(stateIDs.ERROR);
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }


    // Displays chatbot response in the chatbox
    function displayResponse(responseMessage) {
        const incomingChatLi = createChatLi(responseMessage, "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }

    // Logs the chat message in the chat history
    function logChatMessage(userInput, chatbotResponse) {
        // Retrieve existing chat history
        let chatHistory = getChatHistory();

        // Add user message
        chatHistory.push({
            role: "user",
            content: userInput
        });

        // Add chatbot response
        chatHistory.push({
            role: "assistant",
            content: chatbotResponse
        });

        // Store updated history in cookies
        updateChatHistory(chatHistory);
    }

    // Fetches the chat history from cookies
    function getChatHistory() {
        const historyCookie = document.cookie.split("; ").find(row => row.startsWith("chatHistory="));
        return historyCookie ? JSON.parse(decodeURIComponent(historyCookie.split("=")[1])) : [];
    }

    function updateChatHistory(chatHistory) {
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Set expiration
        document.cookie = `chatHistory=${encodeURIComponent(JSON.stringify(chatHistory))}; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;
    }

    // Displays stored messages from cookies on page load
    function displayStoredMessages() {
        const chatHistory = getChatHistory();
        chatHistory.forEach(message => {
            const className = message.role === "user" ? "outgoing" : "incoming";
            const chatLi = createChatLi(message.content, className);
            chatbox.appendChild(chatLi);
        });
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }

    // Create chat list items
    function createChatLi(messageContent, className) {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" ? `<p>${messageContent}</p>` : `<span class="zehnder-letter">Z</span><p>${messageContent}</p>`;
        chatLi.innerHTML = chatContent;
        return chatLi;
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
