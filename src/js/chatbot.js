const ChatbotModule = (function() {
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    let userMessage = null;
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
        const API_URL = "https://jmi-dsc-chatbot-function-app.azurewebsites.net/api/JMI-DSC-Chatbot-HttpTrigger1";
        const messageElement = chatElement.querySelector("p");
        let chatHistory = getChatHistory(); // Retrieve existing chat history

        const currentMessage = {
            role: "user",
            content: userMessage
        };

        // Create a temporary updated history with the current message
        let updatedHistory = [...chatHistory, currentMessage];

        const data = {
            prompt: userMessage,
            messages: updatedHistory
        };

                    // messages: [ // Contextual conversation if needed
            //     {
            //         "role": "user",
            //         "content": "Hello"
            //     },
            //     {
            //         "role": "assistant",
            //         "content": "Hi, I am the Zehnder chatbot. How can I assist you today?"
            //     },
            //     {
            //         "role": "user",
            //         "content": userMessage
            //     }
            // ]

        console.log("Sending data to Azure Function:", JSON.stringify(data)); // Log the data being sent

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
            const responseMessage = data.response; // Assuming the response is directly the message
            displayResponse(responseMessage);

            // Remove or update the "Nadenken..." message directly here
            chatElement.remove(); // This removes the placeholder 'Nadenken...' chat element

            //pendingResponse = responseMessage; // Store the response
            logChatMessage(userMessage, responseMessage); // Log both input and response

            pendingResponse = responseMessage; // Store the response
            changeState(stateIDs.CHATBOT_RESPONDING);
        })
        .catch((error) => {
            console.error("Error fetching data:", error); // Log any errors
            const errorMsg = "Oeps! Er is iets fout gegaan. Probeer het opnieuw.";

            messageElement.classList.add("error");
            messageElement.textContent = errorMsg;

            pendingResponse = errorMsg; // Store error message
            logChatMessage(userMessage, errorMsg); // Log the input with error message

            changeState(stateIDs.CHATBOT_RESPONDING);
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }

    // Displays chatbot response in the chatbox
    function displayResponse(responseMessage) {
        const incomingChatLi = createChatLi(responseMessage, "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }

    function logChatMessage(userInput, chatbotResponse) {
        let chatHistory = getChatHistory(); // Retrieve existing chat history

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

        updateChatHistory(chatHistory); // Store updated history
    }

    // Log the conversation after both input and response are available
    // function logChatMessage() {
    //     if (pendingUserMessage && pendingResponse) {
    //         const newMessage = {
    //             inputs: {
    //                 chat_input: pendingUserMessage
    //             },
    //             outputs: {
    //                 chat_output: pendingResponse
    //             }
    //         };
    //         updateChatHistory(newMessage);

    //         // Reset the pending messages
    //         pendingUserMessage = null;
    //         pendingResponse = null;
    //     }
    // }

    // Fetches the chat history from cookies
    function getChatHistory() {
        const historyCookie = document.cookie.split("; ").find(row => row.startsWith("chatHistory="));
        return historyCookie ? JSON.parse(decodeURIComponent(historyCookie.split("=")[1])) : [];

        // if (historyCookie) {
        //     return JSON.parse(decodeURIComponent(historyCookie.split("=")[1]));
        // }

        // return [
        //     {
        //         "role": "assistant",
        //         "content": "Hallo ik ben Zehndy! Hoe kan ik je helpen?"
        //     }
        // ];
    }

    function updateChatHistory(chatHistory) {
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Set expiration
        document.cookie = `chatHistory=${encodeURIComponent(JSON.stringify(chatHistory))}; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;
    }

    // Updates the chat history in cookies
    // function updateChatHistory(newMessage) {
    //     const chatHistory = getChatHistory();
    //     chatHistory.push(newMessage);
    //     const expiryDate = new Date();
    //     expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Set expiration
    //     document.cookie = `chatHistory=${encodeURIComponent(JSON.stringify(chatHistory))}; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;
    // }

    // // Displays stored messages from cookies on page load
    // function displayStoredMessages() {
    //     const chatHistory = getChatHistory();
    //     chatHistory.forEach(message => {
    //         // Display user's message
    //         const userChatLi = createChatLi(message.inputs.chat_input, "outgoing");
    //         chatbox.appendChild(userChatLi);

    //         // Check if there's a response and display it
    //         if (message.outputs.chat_output) {
    //             const responseChatLi = createChatLi(message.outputs.chat_output, "incoming");
    //             chatbox.appendChild(responseChatLi);
    //         }
    //     });
    //     chatbox.scrollTo(0, chatbox.scrollHeight);
    // }

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


    // // Create chat list items
    // function createChatLi(message, className) {
    //     const chatLi = document.createElement("li");
    //     chatLi.classList.add("chat", className);
    //     let chatContent = className === "outgoing" ? `<p></p>` : `<span class="zehnder-letter">Z</span><p></p>`;
    //     chatLi.innerHTML = chatContent;
    //     chatLi.querySelector("p").textContent = message;
    //     return chatLi;
    // }

    // Create chat list items
    function createChatLi(messageContent, className) {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" ? `<p>${messageContent}</p>` : `<span class="zehnder-letter">Z</span><p>${messageContent}</p>`;
        chatLi.innerHTML = chatContent;
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
