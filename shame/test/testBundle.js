const { stateModule, stateMachineModule, headerLoader, ChatbotModule } = require('./sourceBundle');


describe("stateMachineModule", function() {
    it("should correctly change states", function() {
        

        // Setup initial state
        stateMachineModule.init();

        // Test state transitions
        var result = stateMachineModule.changeState("open");
        expect(result).toBe("open");

        // Check for invalid transitions
        result = stateMachineModule.changeState("invalidState");
        expect(result).toBe("open"); // Should not change to invalid state
    });
});
