    // UserAgreement: "USER_AGREEMENT",
    // UserTyping: "USER_TYPING",
    // AwaitingChatbotResponse: "AWAITING_CHATBOT_RESPONSE",
    // ChatbotResponding: "CHATBOT_RESPONDING",
    // Idle: "IDLE",
    // Escalating: "ESCALATING",
    // Terminating: "TERMINATING",
    // ErrorHandling: "ERROR_HANDLING",
    // UserFeedbackCollection: "USER_FEEDBACK_COLLECTION"

    // [states.UserAgreement]: [states.UserTyping],
    // [states.UserTyping]: [states.AwaitingChatbotResponse, states.Idle],
    // [states.AwaitingChatbotResponse]: [states.ChatbotResponding, states.ErrorHandling],
    // [states.ChatbotResponding]: [states.UserTyping, states.Escalating, states.Terminating],
    // [states.Idle]: [states.UserTyping],
    // [states.Escalating]: [states.Idle],
    // [states.Terminating]: [],
    // [states.ErrorHandling]: [states.UserTyping, states.Idle],
    // [states.UserFeedbackCollection]: [states.Terminating]

export const stateIDs = {
    USER_AGREEMENT: 'userAgreement',
    USER_TYPING: 'userTyping',
    AWAITING_CHATBOT_RESPONSE: 'awaitingChatbotResponse',
    CHATBOT_RESPONDING: 'chatbotResponding',
    IDLE: 'idle',
};

export const states = {
    [stateIDs.USER_AGREEMENT]: {
        name: "User Agreement",
        enter: () => {
            console.log(`Entering ${states[stateIDs.USER_AGREEMENT].name} state`);
        },
        exit: () => {
            console.log(`Exiting ${states[stateIDs.USER_AGREEMENT].name} state`);
        },
        transitions: [stateIDs.USER_TYPING]
    },
    [stateIDs.USER_TYPING]: {
        name: "User Typing",
        enter: () => {
            console.log(`Entering ${states[stateIDs.USER_TYPING].name} state`);
        },
        exit: () => {
            console.log(`Exiting ${states[stateIDs.USER_TYPING].name} state`);
        },
        transitions: [stateIDs.AWAITING_CHATBOT_RESPONSE, stateIDs.IDLE]
    },
    [stateIDs.AWAITING_CHATBOT_RESPONSE]: {
        name: "Awaiting Chatbot Response",
        enter: () => {
            console.log(`Entering ${states[stateIDs.AWAITING_CHATBOT_RESPONSE].name} state`);
        },
        exit: () => {
            console.log(`Exiting ${states[stateIDs.AWAITING_CHATBOT_RESPONSE].name} state`);
        },
        transitions: [stateIDs.CHATBOT_RESPONDING]
    },
    [stateIDs.CHATBOT_RESPONDING]: {
        name: "Chatbot Responding",
        enter: () => {
            console.log(`Entering ${states[stateIDs.CHATBOT_RESPONDING].name} state`);
        },
        exit: () => {
            console.log(`Exiting ${states[stateIDs.CHATBOT_RESPONDING].name} state`);
        },
        transitions: [stateIDs.USER_TYPING]
    },
    [stateIDs.IDLE]: {
        name: "Idle",
        enter: () => {
            console.log(`Entering ${states[stateIDs.IDLE].name} state`);
        },
        exit: () => {
            console.log(`Exiting ${states[stateIDs.IDLE].name} state`);
        },
        transitions: [stateIDs.USER_TYPING]
    },
};

// let typingTimeout;
// states.UserTyping.enter = () => {
//     console.log("User is typing...");
//     clearTimeout(typingTimeout);
//     typingTimeout = setTimeout(() => {
//         stateMachine.changeState("IDLE");
//     }, 5000);
// };

// states.USER_TYPING.exit = () => {
//     clearTimeout(typingTimeout);
//     console.log("User stopped typing");
// };
