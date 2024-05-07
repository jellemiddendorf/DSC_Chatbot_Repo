// import { states, stateIDs } from 'states.js';

const stateMachine = (function() {
    let currentState = null;

    function changeState(newStateID) {
        // Check if the transition is allowed
        if (states[currentState].transitions.includes(newStateID)) {
            console.log(`State change is allowed.`);
            
            // Exit the current state if there is an exit function
            if (states[currentState].exit) {
                states[currentState].exit();
            }

            // Log the state change
            console.log(`Transitioning from ${states[currentState].name} to ${states[newStateID].name}`);

            // Set the new state
            currentState = newStateID;

            // Enter the new state if there is an enter function
            if (states[newStateID].enter) {
                states[newStateID].enter();
            }
        } 
        else {
            console.log(`Transition from ${states[currentState].name} to ${states[newStateID].name} is not allowed.`);
        }
    }

    function getCurrentState() {
        return currentState;
    }

    function init() {
        currentState = stateIDs.USER_AGREEMENT;
        states[currentState].enter();
    }

    return {
        changeState,
        getCurrentState,
        init
    };
})();

// Initialize the module
stateMachine.init();

//export default stateMachine;