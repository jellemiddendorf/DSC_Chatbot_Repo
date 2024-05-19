// states.js
const stateModule = (function() {
    const stateIDs = {
        CLOSED: 'closed',
        OPEN: 'open',
        USER_AGREEMENT: 'userAgreement',
        AWAITING_CHATBOT_RESPONSE: 'awaitingChatbotResponse',
        CHATBOT_RESPONDING: 'chatbotResponding',
        IDLE: 'idle',
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
                // Enable input
                document.querySelector('.chat-input textarea').disabled = false;
                document.querySelector('#send-btn').disabled = false;

                if (!userHasAcceptedAgreement()) {
                    stateMachine.changeState(stateIDs.USER_AGREEMENT);
                }
                else {
                    console.log("User has accepted agreement.");
                    startIdleTimer();
                }
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
                ChatbotModule.getChatbotToggler().removeEventListener("click", handleToggleClick);
                clearIdleTimer();
                // Disable input
                document.querySelector('.chat-input textarea').disabled = true;
                document.querySelector('#send-btn').disabled = true;
            },
            transitions: [stateIDs.CLOSED, stateIDs.USER_AGREEMENT, stateIDs.AWAITING_CHATBOT_RESPONSE, stateIDs.IDLE]
        },
        [stateIDs.USER_AGREEMENT]: {
            name: "User Agreement",
            enter() {
                console.log(`Entering ${this.name} state`);
                ChatbotModule.getChatbotToggler().addEventListener("click", handleToggleClick);
                // Display user agreement UI and disable input
                document.querySelector('.chat-input textarea').disabled = true;
                document.querySelector('#send-btn').disabled = true;
                document.querySelector('.user-agreement').style.display = 'block';
                document.querySelector('.agree-button').addEventListener('click', handleAgreement);
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
                ChatbotModule.getChatbotToggler().removeEventListener("click", handleToggleClick);
                // Hide user agreement UI and enable input
                document.querySelector('.chat-input textarea').disabled = false;
                document.querySelector('#send-btn').disabled = false;
                document.querySelector('.user-agreement').style.display = 'none';
                document.querySelector('.agree-button').removeEventListener('click', handleAgreement);
            },
            transitions: [stateIDs.CLOSED, stateIDs.OPEN]
        },
        [stateIDs.AWAITING_CHATBOT_RESPONSE]: {
            name: "Awaiting Chatbot Response",
            enter() {
                console.log(`Entering ${this.name} state`);
                // Handle sending user message to chatbot
                stateMachine.changeState(stateIDs.CHATBOT_RESPONDING);
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
            },
            transitions: [stateIDs.CHATBOT_RESPONDING]
        },
        [stateIDs.CHATBOT_RESPONDING]: {
            name: "Chatbot Responding",
            enter() {
                console.log(`Entering ${this.name} state`);
                // Handle chatbot response
                stateMachine.changeState(stateIDs.OPEN);
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
                localStorage.clear();
                stateMachine.changeState(stateIDs.CLOSED);
            },
            exit() {
                console.log(`Exiting ${this.name} state`);
                // No additional exit logic needed for IDLE state
            },
            transitions: [stateIDs.CLOSED]
        }
    };

    function handleToggleClick() {
        const currentState = stateMachine.getCurrentState();
        const newStateID = currentState === stateIDs.CLOSED ? stateIDs.OPEN : stateIDs.CLOSED;
        stateMachine.changeState(newStateID);
    }

    function userHasAcceptedAgreement() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('userAgreementAccepted='))
            ?.split('=')[1];
        return cookieValue === 'true';
    }
    
    // function userHasAcceptedAgreement() {
    //     // Implement this function to check if the user has accepted the agreement
    //     // For example, check a cookie or local storage item
    //     return localStorage.getItem('userAgreementAccepted') === 'true';
    // }

    function handleAgreement() {
        const isChecked = document.getElementById('agree-checkbox').checked;
    
        if (isChecked) {
            const expiryDate = new Date();
            expiryDate.setMinutes(expiryDate.getMinutes() + 30); // Expires in 30 days // expiryDate.getDate() + 30
            document.cookie = `userAgreementAccepted=true; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;
    
            stateMachine.changeState(stateIDs.OPEN);
        } else {
            alert('Please accept the user agreement to continue.');
        }
    }

    // function handleAgreement() {
    //     const isChecked = document.getElementById('agree-checkbox').checked;

    //     if (isChecked) {
    //         localStorage.setItem('userAgreementAccepted', 'true');
    //         stateMachine.changeState(stateIDs.OPEN);
    //     } else {
    //         alert('Please accept the user agreement to continue.');
    //     }
    // }

    function startIdleTimer() {
        clearIdleTimer(); // Clear any existing timer
        idleTimeout = setTimeout(() => {
            stateMachine.changeState(stateIDs.IDLE);
        }, 300000); // 5 minutes of inactivity
    }

    function clearIdleTimer() {
        if (idleTimeout) {
            clearTimeout(idleTimeout);
            idleTimeout = null;
        }
    }


    function init() {
        console.log("States initialized.");
    }

    return {
        stateIDs,
        states,
        init
    };
})();




// export const stateIDs = {
//     CLOSED: 'closed',
//     OPEN: 'open',
//     USER_AGREEMENT: 'userAgreement',
//     USER_TYPING: 'userTyping',
//     AWAITING_CHATBOT_RESPONSE: 'awaitingChatbotResponse',
//     CHATBOT_RESPONDING: 'chatbotResponding',
//     IDLE: 'idle',
// };

// export const states = {
//     [stateIDs.CLOSED]: {
//         name: "Closed",
//         enter: () => {
//             console.log(`Entering ${states[stateIDs.CLOSED].name} state`);
//             ChatbotModule.getChatbotToggler().addEventListener("click", () => {
//                 if (stateMachine.changeState(stateIDs.OPEN) === stateIDs.OPEN) {
//                     document.body.classList.toggle("show-chatbot")
//                 }
//             });
//         },
//         exit: () => {
//             console.log(`Exiting ${states[stateIDs.CLOSED].name} state`);
//             // remove event listener
//             ChatbotModule.getChatbotToggler().removeEventListener("click", () => {
//                 if (stateMachine.changeState(stateIDs.OPEN) === stateIDs.OPEN) {
//                     document.body.classList.toggle("show-chatbot")
//                 }
//             });
//         },
//         transitions: [stateIDs.OPEN]
//     },
//     [stateIDs.OPEN]: {
//         name: "Open",
//         enter: () => {
//             console.log(`Entering ${states[stateIDs.OPEN].name} state`);
//             ChatbotModule.getChatbotToggler().addEventListener("click", () => {
//                 if (stateMachine.changeState(stateIDs.CLOSED) === stateIDs.CLOSED) {
//                     document.body.classList.toggle("show-chatbot")
//                 }
//             });
//         },
//         exit: () => {
//             console.log(`Exiting ${states[stateIDs.OPEN].name} state`);
//         },
//         transitions: [stateIDs.CLOSED]
//     },
//     [stateIDs.USER_AGREEMENT]: {
//         name: "User Agreement",
//         enter: () => {
//             console.log(`Entering ${states[stateIDs.USER_AGREEMENT].name} state`);
//         },
//         exit: () => {
//             console.log(`Exiting ${states[stateIDs.USER_AGREEMENT].name} state`);
//         },
//         transitions: [stateIDs.USER_TYPING]
//     },
//     [stateIDs.USER_TYPING]: {
//         name: "User Typing",
//         enter: () => {
//             console.log(`Entering ${states[stateIDs.USER_TYPING].name} state`);
//         },
//         exit: () => {
//             console.log(`Exiting ${states[stateIDs.USER_TYPING].name} state`);
//         },
//         transitions: [stateIDs.AWAITING_CHATBOT_RESPONSE, stateIDs.IDLE]
//     },
//     [stateIDs.AWAITING_CHATBOT_RESPONSE]: {
//         name: "Awaiting Chatbot Response",
//         enter: () => {
//             console.log(`Entering ${states[stateIDs.AWAITING_CHATBOT_RESPONSE].name} state`);
//         },
//         exit: () => {
//             console.log(`Exiting ${states[stateIDs.AWAITING_CHATBOT_RESPONSE].name} state`);
//         },
//         transitions: [stateIDs.CHATBOT_RESPONDING]
//     },
//     [stateIDs.CHATBOT_RESPONDING]: {
//         name: "Chatbot Responding",
//         enter: () => {
//             console.log(`Entering ${states[stateIDs.CHATBOT_RESPONDING].name} state`);
//         },
//         exit: () => {
//             console.log(`Exiting ${states[stateIDs.CHATBOT_RESPONDING].name} state`);
//         },
//         transitions: [stateIDs.USER_TYPING]
//     },
//     [stateIDs.IDLE]: {
//         name: "Idle",
//         enter: () => {
//             console.log(`Entering ${states[stateIDs.IDLE].name} state`);
//         },
//         exit: () => {
//             console.log(`Exiting ${states[stateIDs.IDLE].name} state`);
//         },
//         transitions: [stateIDs.USER_TYPING]
//     },
// };