document.addEventListener("DOMContentLoaded", function() {
    console.log = function() {};
    console.info = function() {};
    console.warn = function() {};
    console.error = function() {};

    stateModule.init();
    stateMachineModule.init();
    ChatbotModule.init(stateModule.stateIDs, stateMachineModule.changeState);
    headerLoader.init();

    console.log("All modules initialized after DOM loaded.");
});
