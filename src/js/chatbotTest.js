
const ChatbotModule = (function() {
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    //const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    let userMessage = null; // Variable to store user's message
    const API_KEY = "PASTE-YOUR-API-KEY"; // Paste your API key here
    const inputInitHeight = chatInput.scrollHeight;

    //let states = stateModule.states; //Cannot access 'stateModule' before initialization
    let stateIDs, changeState;






    let pendingUserMessage = null; // Stores the last user input
    let pendingResponse = null; // Stores the last chatbot response
    























    function logChatMessage() {
        if (pendingUserMessage && pendingResponse) {
            const newMessage = {
                inputs: {
                    chat_input: pendingUserMessage  // Directly using the input string
                },
                outputs: {
                    chat_output: pendingResponse  // Directly using the output string, default to empty if none
                }
            }

            updateChatHistory(newMessage);
            
            // Reset the pending messages
            pendingUserMessage = null;
            pendingResponse = null;
        }
    }










    // function logChatMessage(input, output) {
    //     // const newMessage = {
    //     //     inputs: { chat_input: input },
    //     //     outputs: { chat_output: output }
    //     // };
    //     const newMessage = {
    //         inputs: {
    //             chat_input: input  // Directly using the input string
    //         },
    //         outputs: {
    //             chat_output: output || ""  // Directly using the output string, default to empty if none
    //         }
    //     };
    //     updateChatHistory(newMessage);
    // }

    function updateChatHistory(newMessage) {
        const chatHistory = getChatHistory();
        chatHistory.push(newMessage);

        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Set expiration
        document.cookie = `chatHistory=${encodeURIComponent(JSON.stringify(chatHistory))}; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;
    }

    function getChatHistory() {
        const historyCookie = document.cookie.split('; ').find(row => row.startsWith('chatHistory='));
        return historyCookie ? JSON.parse(decodeURIComponent(historyCookie.split('=')[1])) : [];
    }











    function createChatLi(message, className) {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", className);
        let chatContent = className === "outgoing" ? `<p></p>` : `<span class="zehnder-letter">Z</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    }

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
                messages: [{role: "user", content: userMessage}],
            })
        };

        fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            const responseMessage = data.choices[0].message.content.trim();
            displayResponse(responseMessage);

            // Log the chatbot's response
            pendingResponse = responseMessage; // Store the response
            logChatMessage(); // Log both input and response

            stateMachine.changeState(stateIDs.CHATBOT_RESPONDING);
        }).catch(() => {
            messageElement.classList.add("error");
            messageElement.textContent = "Oeps! Er is iets fout gegaan. Probeer het opnieuw.";

           

            // pendingResponse = "Oeps! Er is iets fout gegaan. Probeer het opnieuw."; // Use a generic error message
            // logChatMessage(); // Log the input with error message


            fetchWeather2(userMessage).then(weatherMessage => {
                messageElement.textContent = weatherMessage;
                messageElement.classList.remove("error");

                // Log the error or alternative response
                pendingResponse = weatherMessage; // Store the response
                logChatMessage(); // Log both input and response
            });
            stateMachine.changeState(stateIDs.CHATBOT_RESPONDING);
        }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }

    function displayResponse(responseMessage) {
        const incomingChatLi = createChatLi(responseMessage, "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }

    async function fetchWeather2(query) {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=f2e9be0466ad4d56b76103541242204&q=${query}`);
        const data = await response.json();
        return `The current temperature in ${data.location.name} is ${data.current.temp_c}°C.`;
    }

    function handleChat() {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        // Log the user's message
        pendingUserMessage = userMessage;
        
        setTimeout(() => {
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            stateMachine.changeState(stateIDs.AWAITING_CHATBOT_RESPONSE);
            generateResponse(incomingChatLi);
        }, 600);
    }

    function initListeners() {
        chatInput.addEventListener("input", () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = `${chatInput.scrollHeight}px`;
        });

        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
                e.preventDefault();
                handleChat();
            }
        });

        sendChatBtn.addEventListener("click", handleChat);
        //closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
        //chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
    }

    function getChatbotToggler() {
        return chatbotToggler;
    }

    function getSendChatBtn() {
        return sendChatBtn;
    }










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
        // Scroll to the bottom of the chatbox to show the most recent messages
        chatbox.scrollTo(0, chatbox.scrollHeight);
    }








    function init(stateIDsRef, changeStateRef) {
        stateIDs = stateIDsRef;
        changeState = changeStateRef;
        initListeners();
        displayStoredMessages();  // Load and display messages when the module initializes
        console.log("Chatbot module initialized.");
    }

    return {
        // init: function() {
        //     initListeners();
        //     console.log("Chatbot module initialized.");
        // },
        init,
        getChatbotToggler,
        getSendChatBtn
    };
})();
