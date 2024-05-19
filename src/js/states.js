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
            transitions: [stateIDs.CHATBOT_RESPONDING]
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
        }
    };

    function handleToggleClick() {
        const currentState = stateMachineModule.getCurrentState();
        const newStateID = currentState === stateIDs.CLOSED ? stateIDs.OPEN : stateIDs.CLOSED;
        stateMachineModule.changeState(newStateID);
    }

    function userHasAcceptedAgreement() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('userAgreementAccepted='))
            ?.split('=')[1];
        return cookieValue === 'true';
    }

    function handleAgreement() {
        const isChecked = document.getElementById('agree-checkbox').checked;
        if (isChecked) {
            const expiryDate = new Date();
            expiryDate.setMinutes(expiryDate.getMinutes() + 30);
            document.cookie = `userAgreementAccepted=true; expires=${expiryDate.toUTCString()}; path=/; secure; SameSite=Lax`;
    
            stateMachineModule.changeState(stateIDs.OPEN);
        } else {
            alert('Accepteer de gebruikersovereenkomst om verder te gaan.');
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
        document.querySelector('.chat-input textarea').disabled = false;
        document.querySelector('#send-btn').disabled = false;
    }

    function disableChatInterface() {
        document.querySelector('.chat-input textarea').disabled = true;
        document.querySelector('#send-btn').disabled = true;
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
        document.querySelector('.user-agreement').style.display = 'block';
        document.querySelector('.agree-button').addEventListener('click', handleAgreement);
    }

    function hideUserAgreement() {
        enableChatInterface();
        document.querySelector('.user-agreement').style.display = 'none';
        document.querySelector('.agree-button').removeEventListener('click', handleAgreement);
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