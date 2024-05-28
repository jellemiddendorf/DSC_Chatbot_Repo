const stateModule = (function() {
    const stateIDs = {
        CLOSED: "closed",
        OPEN: "open",
        USER_AGREEMENT: "userAgreement",
        AWAITING_CHATBOT_RESPONSE: "awaitingChatbotResponse",
        CHATBOT_RESPONDING: "chatbotResponding",
        IDLE: "idle"
    };

    const states = {
        [stateIDs.CLOSED]: {
            name: "Closed",
            enter: function() { console.log(`Entering ${this.name} state`); },
            exit: function() { console.log(`Exiting ${this.name} state`); },
            transitions: [stateIDs.OPEN]
        },
        [stateIDs.OPEN]: {
            name: "Open",
            enter: function() { console.log(`Entering ${this.name} state`); },
            exit: function() { console.log(`Exiting ${this.name} state`); },
            transitions: [stateIDs.CLOSED, stateIDs.USER_AGREEMENT, stateIDs.AWAITING_CHATBOT_RESPONSE, stateIDs.IDLE]
        },
        [stateIDs.USER_AGREEMENT]: {
            name: "User Agreement",
            enter: function() { console.log(`Entering ${this.name} state`); },
            exit: function() { console.log(`Exiting ${this.name} state`); },
            transitions: [stateIDs.CLOSED, stateIDs.OPEN]
        },
        [stateIDs.AWAITING_CHATBOT_RESPONSE]: {
            name: "Awaiting Chatbot Response",
            enter: function() { console.log(`Entering ${this.name} state`); },
            exit: function() { console.log(`Exiting ${this.name} state`); },
            transitions: [stateIDs.CHATBOT_RESPONDING]
        },
        [stateIDs.CHATBOT_RESPONDING]: {
            name: "Chatbot Responding",
            enter: function() { console.log(`Entering ${this.name} state`); },
            exit: function() { console.log(`Exiting ${this.name} state`); },
            transitions: [stateIDs.OPEN]
        },
        [stateIDs.IDLE]: {
            name: "Idle",
            enter: function() { console.log(`Entering ${this.name} state`); },
            exit: function() { console.log(`Exiting ${this.name} state`); },
            transitions: [stateIDs.CLOSED]
        }
    };

    function init() {
        console.log("States initialized.");
    }

    return {
        stateIDs,
        states,
        init
    };
})();

const stateMachineModule = (function() {
    let currentState = stateModule.stateIDs.CLOSED;
    let states = stateModule.states;

    function changeState(newStateID) {
        if (states[currentState] && states[currentState].transitions.includes(newStateID)) { 
            // Log transition
            console.log(`Transition from ${currentState} to ${newStateID} is ${states[currentState].transitions.includes(newStateID) ? 'allowed' : 'not allowed'}.`);

            if (states[currentState].exit) {
                states[currentState].exit();
            }

            currentState = newStateID;

            if (states[newStateID].enter) {
                states[newStateID].enter();
            }
        } else {
            console.log(`Invalid transition attempted from ${currentState} to ${newStateID}.`);
        }

        return currentState;
    }

    function getCurrentState() {
        return currentState;
    }

    function init() {
        if (states[currentState].enter) {
            states[currentState].enter();
        }
        console.log("State machine initialized.");
    }

    return {
        changeState,
        getCurrentState,
        init
    };
})();

// Mocked Header Loader Module
const headerLoader = {
    init: function() {}
};

// Mocked Chatbot Module
const ChatbotModule = {
    init: function() {},
    getChatbotToggler: function() {
        return {};
    },
    getSendChatBtn: function() {
        return {};
    }
};

module.exports = {
    stateModule,
    stateMachineModule,
    headerLoader,
    ChatbotModule
};
