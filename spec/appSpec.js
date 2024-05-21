const { stateModule, stateMachineModule, headerLoader, ChatbotModule } = require('./js/mockedApp');

describe("State Machine Module", function() {
    const stateIDs = stateModule.stateIDs;

    beforeEach(() => {
        stateMachineModule.init();
    });

    afterEach(() => {
        stateMachineModule.changeState(stateIDs.CLOSED);
    });

    it("should transition from CLOSED to OPEN", () => {
        stateMachineModule.changeState(stateIDs.OPEN);
        expect(stateMachineModule.getCurrentState()).toBe(stateIDs.OPEN);
    });

    it("should transition from OPEN to USER_AGREEMENT", () => {
        stateMachineModule.changeState(stateIDs.OPEN);
        stateMachineModule.changeState(stateIDs.USER_AGREEMENT);
        expect(stateMachineModule.getCurrentState()).toBe(stateIDs.USER_AGREEMENT);
    });

    it("should not transition from CLOSED to CHATBOT_RESPONDING", () => {
        stateMachineModule.changeState(stateIDs.CHATBOT_RESPONDING);
        expect(stateMachineModule.getCurrentState()).toBe(stateIDs.CLOSED);
    });

    it("should transition from USER_AGREEMENT to OPEN", () => {
        stateMachineModule.changeState(stateIDs.OPEN);
        stateMachineModule.changeState(stateIDs.USER_AGREEMENT);
        stateMachineModule.changeState(stateIDs.OPEN);
        expect(stateMachineModule.getCurrentState()).toBe(stateIDs.OPEN);
    });

    it("should transition from AWAITING_CHATBOT_RESPONSE to CHATBOT_RESPONDING", () => {
        stateMachineModule.changeState(stateIDs.OPEN);
        stateMachineModule.changeState(stateIDs.AWAITING_CHATBOT_RESPONSE);
        stateMachineModule.changeState(stateIDs.CHATBOT_RESPONDING);
        expect(stateMachineModule.getCurrentState()).toBe(stateIDs.CHATBOT_RESPONDING);
    });

    it("should transition from CHATBOT_RESPONDING to OPEN", () => {
        stateMachineModule.changeState(stateIDs.OPEN);
        stateMachineModule.changeState(stateIDs.AWAITING_CHATBOT_RESPONSE);
        stateMachineModule.changeState(stateIDs.CHATBOT_RESPONDING);
        stateMachineModule.changeState(stateIDs.OPEN);
        expect(stateMachineModule.getCurrentState()).toBe(stateIDs.OPEN);
    });

    it("should transition from IDLE to CLOSED", () => {
        stateMachineModule.changeState(stateIDs.OPEN);
        stateMachineModule.changeState(stateIDs.IDLE);
        stateMachineModule.changeState(stateIDs.CLOSED);
        expect(stateMachineModule.getCurrentState()).toBe(stateIDs.CLOSED);
    });

    it("should not transition from IDLE to OPEN", () => {
        stateMachineModule.changeState(stateIDs.OPEN);
        stateMachineModule.changeState(stateIDs.IDLE);
        stateMachineModule.changeState(stateIDs.OPEN);
        expect(stateMachineModule.getCurrentState()).toBe(stateIDs.IDLE);
    });

    // it("should log an error for invalid transition", () => {
    //     const consoleSpy = jest.spyOn(console, 'log');
    //     stateMachineModule.changeState(stateIDs.OPEN);
    //     errorMsg = stateMachineModule.changeState(stateIDs.CHATBOT_RESPONDING);
    //     expect(consoleSpy).toHaveBeenCalledWith(`Invalid transition attempted from ${stateIDs.OPEN} to ${stateIDs.CHATBOT_RESPONDING}.`);
    //     consoleSpy.mockRestore();
    // });
});

describe("Header Loader Module", function() {
    it("should have an init function", () => {
        expect(typeof headerLoader.init).toBe('function');
    });

    it("should initialize without errors", () => {
        expect(() => headerLoader.init()).not.toThrow();
    });
});

describe("Chatbot Module", function() {
    it("should have an init function", () => {
        expect(typeof ChatbotModule.init).toBe('function');
    });

    it("should have a getChatbotToggler function", () => {
        expect(typeof ChatbotModule.getChatbotToggler).toBe('function');
    });

    it("should have a getSendChatBtn function", () => {
        expect(typeof ChatbotModule.getSendChatBtn).toBe('function');
    });
});