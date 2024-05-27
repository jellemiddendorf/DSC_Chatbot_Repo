const stateMachineModule = (function() {
    let currentState = stateModule.stateIDs.CLOSED;
    let states = stateModule.states;

    function changeState(newStateID) {
        console.log(`=========================================`);
        console.log(`Attempting to change state from ${currentState} to ${newStateID}`);

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
        if (states[currentState] && states[currentState].enter) {
            states[currentState].enter();
        }
        console.log(`State machine initialized.`);
    }

    return {
        changeState,
        getCurrentState,
        init
    };
})();
