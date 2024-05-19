// import { stateMachine } from './stateMachineModule.js';
// import { ChatbotModule } from './chatModule.js';

// document.addEventListener("DOMContentLoaded", function() {
//     stateMachine.init();
//     ChatbotModule.init();
//     console.log("All modules initialized after DOM loaded.");
// });


//import { stateMachine } from './stateMachineModule.js';
//import { ChatbotModule } from './chatModule.js';

document.addEventListener("DOMContentLoaded", function() {
    stateModule.init();
    stateMachine.init();
    ChatbotModule.init(stateModule.stateIDs, stateMachine.changeState);
    headerLoader.init();

    console.log("All modules initialized after DOM loaded.");
});
