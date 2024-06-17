const { JSDOM } = require('jsdom');

// Define the HTML page structure
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DSC Chatbot</title>
</head>
<body>
    <div id="header-placeholder"></div>
    <button class="chatbot-toggler">
        <span style="display: block" class="material-symbols-rounded">mode_comment</span>
        <span class="material-symbols-outlined">close</span>
    </button>
    <div class="chatbot">
        <header>
            <span class="material-symbols-rounded">mode_comment</span>
            <h7>Zehnders support Chatbot!</h7>
        </header>
        <ul class="chatbox">
            <!-- Initially, you may want to mock an initial message or leave this empty -->
            <li class="chat incoming">
                <span class="zehnder-letter">Z</span>
                <p>Hallo ik ben Zehndy!<br>Hoe kan ik je helpen?</p>
            </li>
        </ul>
        <div class="chat-input">
            <textarea placeholder="Uw vraag..." spellcheck="false" required></textarea>
            <span id="send-btn" class="material-symbols-rounded">send</span>
        </div>
        <div class="user-agreement" style="display: none;" id="user-agreement">
            <label>
                <input type="checkbox" id="agree-checkbox">
                Ik begrijp dat Zehnder niet aansprakelijk is voor informatie van de chatbot of enige verliezen. Alle informatie moet worden geverifieerd. <br>
            </label>
            <button class="agree-button">Accepteer</button>
        </div>
    </div>
</body>
</html>`;

// Initialize jsdom with options to support cookies and handle external resources
const jsdom = new JSDOM(html, {
  url: "http://localhost",
  referrer: "http://localhost",
  contentType: "text/html",
  includeNodeLocations: true,
  storageQuota: 10000000
});

const { window } = jsdom;

// Extend the global object with properties from the window object
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.Node = window.Node;
global.URL = window.URL;

// Utility function to set a cookie
function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/`;
}

// Utility function to clear the cookies
function clearCookies() {
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
    });
}

// Ensure all window properties not already global are added to the global scope
Object.keys(window).forEach((property) => {
  if (typeof global[property] === 'undefined') {
    global[property] = window[property];
  }
});

// Include necessary mocks and polyfills for functions and properties
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};

// Set up mocks and polyfills for the testing environment
global.HTMLElement = window.HTMLElement;
global.HTMLInputElement = window.HTMLInputElement;
global.MouseEvent = window.MouseEvent;

// Enable Fetch API support
// global.fetch = require('node-fetch');

// Mock local storage and session storage
global.localStorage = window.localStorage;
global.sessionStorage = window.sessionStorage;

// Mocking cookie support
global.document.cookie = '';
global.navigator.cookieEnabled = true;

// Support for animations and transitions
global.requestAnimationFrame = window.requestAnimationFrame;
global.cancelAnimationFrame = window.cancelAnimationFrame;

// Mock event listener setup to debug events not fully simulated in jsdom
document.addEventListener = (event, cb) => {
  console.log(`Mock listener added for ${event}`);
};

const stateModule = (function() {
    const stateIDs = {
        CLOSED: "closed",
        OPEN: "open",
        USER_AGREEMENT: "userAgreement",
        AWAITING_CHATBOT_RESPONSE: "awaitingChatbotResponse",
        CHATBOT_RESPONDING: "chatbotResponding",
        IDLE: "idle",
        ERROR: "error"
    };

    let idleTimeout;

    const states = {
        [stateIDs.CLOSED]: {
            name: "Closed",
            enter() {
                console.log(`Entering ${this.name} state`);
                document.body.classList.remove("show-chatbot");
                ChatbotModule.getChatbotToggler().addEventListener("click", handleToggleClick);
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
                ChatbotModule.getChatbotToggler().removeEventListener("click", handleToggleClick);
            },
            transitions: [stateIDs.OPEN]
        },
        [stateIDs.OPEN]: {
            name: "Open",
            enter() {
                console.log(`Entering ${this.name} state`);
                document.body.classList.add("show-chatbot");
                ChatbotModule.getChatbotToggler().addEventListener("click", handleToggleClick);
                enableChatInterface();
                evaluateUserAgreement();
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
                ChatbotModule.getChatbotToggler().removeEventListener("click", handleToggleClick);
                clearIdleTimer();
                disableChatInterface();
            },
            transitions: [stateIDs.CLOSED, stateIDs.USER_AGREEMENT, stateIDs.AWAITING_CHATBOT_RESPONSE, stateIDs.IDLE]
        },
        [stateIDs.USER_AGREEMENT]: {
            name: "User Agreement",
            enter() {
                console.log(`Entering ${this.name} state`);
                ChatbotModule.getChatbotToggler().addEventListener("click", handleToggleClick);
                showUserAgreement();
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
                ChatbotModule.getChatbotToggler().removeEventListener("click", handleToggleClick);
                hideUserAgreement();
            },
            transitions: [stateIDs.CLOSED, stateIDs.OPEN]
        },
        [stateIDs.AWAITING_CHATBOT_RESPONSE]: {
            name: "Awaiting Chatbot Response",
            enter() {
                console.log(`Entering ${this.name} state`);
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
            },
            transitions: [stateIDs.CHATBOT_RESPONDING, stateIDs.ERROR]
        },
        [stateIDs.CHATBOT_RESPONDING]: {
            name: "Chatbot Responding",
            enter() {
                console.log(`Entering ${this.name} state`);
                stateMachineModule.changeState(stateIDs.OPEN);
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
            },
            transitions: [stateIDs.OPEN]
        },
        [stateIDs.IDLE]: {
            name: "Idle",
            enter() {
                console.log(`Entering ${this.name} state`);
                stateMachineModule.changeState(stateIDs.CLOSED);
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
            },
            transitions: [stateIDs.CLOSED]
        },
        [stateIDs.ERROR]: {
            name: "Error",
            enter() {
                console.log(`Entering ${this.name} state`);
                stateMachineModule.changeState(stateIDs.OPEN);
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
            },
            transitions: [stateIDs.OPEN]
        }
    };

    function handleToggleClick() {
        const currentState = stateMachineModule.getCurrentState();
        const newStateID = currentState === stateIDs.CLOSED ? stateIDs.OPEN : stateIDs.CLOSED;
        stateMachineModule.changeState(newStateID);
    }

    function userHasAcceptedAgreement() {
        const cookieValue = document.cookie
            .split("; ")
            .find(row => row.startsWith("userAgreementAccepted="))
            ?.split("=")[1];
        return cookieValue === "true";
    }

    function handleAgreement() {
        var chatbot = document.querySelector(".chatbot");
        const isChecked = document.getElementById("agree-checkbox").checked;

        if (isChecked) {
            const expiryDate = new Date();
            expiryDate.setMinutes(expiryDate.getMinutes() + 30);
            document.cookie = `userAgreementAccepted=true; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;

            stateMachineModule.changeState(stateIDs.OPEN);
        } else {
            chatbot.classList.add("shake");

            // Remove the class after the animation completes so we can add it later again.
            chatbot.addEventListener("animationend", function() {
                chatbot.classList.remove("shake");
            }, { once: true });
        }
    }

    function startIdleTimer() {
        clearIdleTimer(); // Clear any existing timer
        idleTimeout = setTimeout(() => {
            stateMachineModule.changeState(stateIDs.IDLE);
        }, 300000); // 5 minutes of inactivity
    }

    function clearIdleTimer() {
        if (idleTimeout) {
            clearTimeout(idleTimeout);
            idleTimeout = null;
        }
    }

    function enableChatInterface() {
        document.querySelector(".chat-input textarea").disabled = false;
        document.querySelector("#send-btn").disabled = false;
    }

    function disableChatInterface() {
        document.querySelector(".chat-input textarea").disabled = true;
        document.querySelector("#send-btn").disabled = true;
    }

    function evaluateUserAgreement() {
        if (!userHasAcceptedAgreement()) {
            stateMachineModule.changeState(stateIDs.USER_AGREEMENT);
        } else {
            console.log("User has accepted agreement.");
            startIdleTimer();
        }
    }

    function showUserAgreement() {
        disableChatInterface();
        document.querySelector(".user-agreement").style.display = "block";
        document.querySelector(".agree-button").addEventListener("click", handleAgreement);
    }

    function hideUserAgreement() {
        enableChatInterface();
        document.querySelector(".user-agreement").style.display = "none";
        document.querySelector(".agree-button").removeEventListener("click", handleAgreement);
    }

    function init() {
        console.log("States initialized.");
    }

    return {
        stateIDs,
        states,
        idleTimeout,
        clearIdleTimer,
        init
    };
})();
const stateMachineModule = (function() {
    let currentState = stateModule.stateIDs.CLOSED;
    let states = stateModule.states;

    function changeState(newStateID) {
        console.log(`=========================================`);
        console.log(`Attempting to change state from ${currentState} to ${newStateID}`);

        if (currentState === newStateID) {
            console.log(`State is already ${currentState}. No change needed.`);
            return currentState;
        }

        // Validate if the state transition is allowed
        if (states[currentState] && states[currentState].transitions.includes(newStateID)) {
            console.log(`State change from ${currentState} to ${newStateID} is allowed.`);

            // Exit current state if an exit function exists
            if (states[currentState].exit) {
                states[currentState].exit();
            }

            // Update the current state
            currentState = newStateID;
            console.log(`Transitioning from ${states[currentState].name} to ${states[newStateID].name}`);

            // Enter the new state if an enter function exists
            if (states[newStateID].enter) {
                states[newStateID].enter();
            }
        } else {
            console.error(`Invalid state transition from ${currentState} to ${newStateID}.`);
        }

        return currentState;
    }

    function getCurrentState() {
        return currentState;
    }

    // Initializes the state machine
    function init() {
        currentState = stateModule.stateIDs.CLOSED;

        if (states[currentState] && states[currentState].enter) {
            states[currentState].enter();
        }
        console.log(`State machine initialized: '${currentState}'`);
    }

    return {
        changeState,
        getCurrentState,
        init
    };
})();

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

            let messageParagraph = placeholderMessageLi.querySelector("p");
            if (!messageParagraph) {
                // If I make a mistake in the future that removes the <p> tag, this will create a new one
                messageParagraph = document.createElement("p");
                placeholderMessageLi.appendChild(messageParagraph);
            }
            messageParagraph.textContent = "Oeps! Er is iets fout gegaan. Probeer het opnieuw.";
            messageParagraph.classList.add("error");

            chatbox.appendChild(placeholderMessageLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);

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
        const messageText = document.createElement("p");

        messageText.innerHTML = linkify(messageContent); // Convert URLs in messageContent into clickable links

        if (className !== "outgoing") { // Add the Zehnder 'Z' letter for incoming messages
            const zehnderLetter = document.createElement("span");
            zehnderLetter.classList.add("zehnder-letter");
            zehnderLetter.textContent = "Z";
            chatLi.appendChild(zehnderLetter);
        }

        const copyIcon = document.createElement("i"); // Create the copy icon
        copyIcon.classList.add("material-symbols-rounded", "copy-icon");
        copyIcon.textContent = "content_copy";
        copyIcon.onclick = () => {
            navigator.clipboard.writeText(messageContent);
        };

        messageText.appendChild(copyIcon); // Add copy icon
        chatLi.appendChild(messageText); // Add message text
        return chatLi;
    }

    // Returns linkified version of the input text
    function linkify(inputText) {
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
        return inputText.replace(urlRegex, function(url) {
            return "<a href=\"" + url + "\" target=\"_blank\">" + url + "</a>";
        });
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

const wtf = require('wtfnode');

describe("stateMachineModule/", function() {
    beforeEach(function() {
        // Resets the state machine to a known state before each test
        stateModule.init();
        stateMachineModule.init();

        clearCookies();
        setCookie("userAgreementAccepted", "true");
    });

    afterEach(function() {
        // Clear the idle timeout after each test
        stateModule.clearIdleTimer();
    });

    afterAll(function() {
        // Clear the idle timeout after all tests are run
        stateModule.clearIdleTimer();
        
        // Clear the cookies after all tests are run
        clearCookies();

        // Close the window after all tests are run
        jsdom.window.close();

        // Dump the heap after all tests are run; useful for detecting memory leaks
        wtf.dump();
    });

    describe("Valid Transitions/", function() { // Valid Transitions
        describe("Closed/", function() { // CLOSED
            describe("User Agreement Not Accepted/", function() {
                beforeEach(function() {
                    clearCookies();
                    setCookie("userAgreementAccepted", "false");
                });
    
                it("should transition from CLOSED to OPEN to USER_AGREEMENT", function() {
                    var result = stateMachineModule.getCurrentState();
                    expect(result).toBe("closed");
                    var result = stateMachineModule.changeState("open");
                    expect(result).toBe("userAgreement");
                });
            });
    
            describe("User Agreement Accepted/", function() {
                it("should transition from CLOSED to OPEN", function() {
                    var result = stateMachineModule.getCurrentState();
                    expect(result).toBe("closed");
                    var result = stateMachineModule.changeState("open");
                    expect(result).toBe("open");
                });
            });
        });

        describe("Open/", function() { // OPEN
            it("should transition from OPEN to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("closed");
                expect(result).toBe("closed");
            });

            it("should transition from OPEN to USER_AGREEMENT", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
            });

            it("should transition from OPEN to Awaiting Chatbot Response", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
            });

            it("should transition from OPEN to IDLE to Close", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("closed");
            });
        });

        describe("User Agreement/", function() { // USER_AGREEMENT
            it("should transition from USER_AGREEMENT to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("closed");
                expect(result).toBe("closed");
            });

            it("should transition from USER_AGREEMENT to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
            });
        });

        describe("Awaiting Chatbot Response/", function() { // AWAITING_CHATBOT_RESPONSE
            it("should transition from Awaiting Chatbot Response to Chatbot Responding to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("open");
            });

            it("should transition from Awaiting Chatbot Response to Error to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("open");
            });
        });

        describe("Chatbot Responding/", function() { // CHATBOT_RESPONDING
            it("should transition from Chatbot Responding to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("open");
            });
        });

        describe("Idle/", function() { // IDLE
            it("should transition from IDLE to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("closed");
            });
        });

        describe("Error/", function() { // ERROR
            it("should transition from Error to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("open");
            });
        });
    });

    describe("Invalid Transitions", function() { // Invalid Transitions
        describe("Closed/", function() { // CLOSED
            it("should not transition from CLOSED to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("closed");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to USER_AGREEMENT", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to AWAITING_CHATBOT_RESPONSE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to CHATBOT_RESPONDING", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to IDLE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to ERROR", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("closed");
            });
        });

        describe("Open/", function() { // OPEN
            it("should not transition from OPEN to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
            });

            it("should not transition from OPEN to CHATBOT_RESPONDING", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("open");
            });

            it("should not transition from OPEN to ERROR", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("open");
            });
        });

        describe("User Agreement/", function() { // USER_AGREEMENT
            it("should not transition from USER_AGREEMENT to USER_AGREEMENT", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
            });

            it("should not transition from USER_AGREEMENT to AWAITING_CHATBOT_RESPONSE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("userAgreement");
            });

            it("should not transition from USER_AGREEMENT to CHATBOT_RESPONDING", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("userAgreement");
            });

            it("should not transition from USER_AGREEMENT to IDLE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("userAgreement");
            });

            it("should not transition from USER_AGREEMENT to ERROR", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("userAgreement");
            });
        });

        describe("Awaiting Chatbot Response/", function() { // AWAITING_CHATBOT_RESPONSE
            it("should not transition from AWAITING_CHATBOT_RESPONSE to AWAITING_CHATBOT_RESPONSE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
            });

            if("should not transition from AWAITING_CHATBOT_RESPONSE to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("closed");
                expect(result).toBe("awaitingChatbotResponse");
            });

            it("should not transition from AWAITING_CHATBOT_RESPONSE to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("awaitingChatbotResponse");
            });

            it("should not transition from AWAITING_CHATBOT_RESPONSE to USER_AGREEMENT", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("awaitingChatbotResponse");
            });

            it("should not transition from AWAITING_CHATBOT_RESPONSE to IDLE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("awaitingChatbotResponse");
            });
        });

        // CHATBOT_RESPONDING automatically transitions to OPEN

        // IDLE automatically transitions to CLOSED

        // ERROR automatically transitions to OPEN
    });
});
