const stateMachine = (function() {
    let currentState = stateModule.stateIDs.CLOSED;
    let states = stateModule.states;

    function changeState(newStateID) {
        console.log(`=========================================`);
        //console.log(`Attempting to change state from ${currentState} to ${newStateID}`);
        
        if (states[currentState] && states[currentState].transitions.includes(newStateID)) {
            console.log(`State change from ${currentState} to ${newStateID} is allowed.`);

            if (states[currentState].exit) {
                states[currentState].exit();
            }

            //console.log(`Transitioning from ${states[currentState].name} to ${states[newStateID].name}`);
            currentState = newStateID;

            if (states[newStateID].enter) {
                states[newStateID].enter();
            }

            //return currentState;
        } else {
            console.error(`Invalid state transition from ${currentState} to ${newStateID}.`);
            //return currentState;
        }

        return currentState;
    }

    function getCurrentState() {
        return currentState;
    }

    function init() {
        //currentState = stateIDs.CLOSED;
        stateModule.states[currentState].enter();
        console.log(`State machine initialized.`);
    }

    return {
        changeState,
        getCurrentState,
        init
    };
})();

// Initialize the module
//stateMachine.init();
// Export the stateMachine object
//window.stateMachine = stateMachine;
