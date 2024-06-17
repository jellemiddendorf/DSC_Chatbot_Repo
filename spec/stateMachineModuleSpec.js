const wtf = require('wtfnode');

describe("stateMachineModule/", function() {
    beforeEach(function() {
        // Resets the state machine to a known state before each test
        stateModule.init();
        stateMachineModule.init();

        clearCookies();
        setCookie("userAgreementAccepted", "true");
    });

    afterEach(function() {
        // Clear the idle timeout after each test
        stateModule.clearIdleTimer();
    });

    afterAll(function() {
        // Clear the idle timeout after all tests are run
        stateModule.clearIdleTimer();
        
        // Clear the cookies after all tests are run
        clearCookies();

        // Close the window after all tests are run
        jsdom.window.close();

        // Dump the heap after all tests are run; useful for detecting memory leaks
        wtf.dump();
    });

    describe("Valid Transitions/", function() { // Valid Transitions
        describe("Closed/", function() { // CLOSED
            describe("User Agreement Not Accepted/", function() {
                beforeEach(function() {
                    clearCookies();
                    setCookie("userAgreementAccepted", "false");
                });
    
                it("should transition from CLOSED to OPEN to USER_AGREEMENT", function() {
                    var result = stateMachineModule.getCurrentState();
                    expect(result).toBe("closed");
                    var result = stateMachineModule.changeState("open");
                    expect(result).toBe("userAgreement");
                });
            });
    
            describe("User Agreement Accepted/", function() {
                it("should transition from CLOSED to OPEN", function() {
                    var result = stateMachineModule.getCurrentState();
                    expect(result).toBe("closed");
                    var result = stateMachineModule.changeState("open");
                    expect(result).toBe("open");
                });
            });
        });

        describe("Open/", function() { // OPEN
            it("should transition from OPEN to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("closed");
                expect(result).toBe("closed");
            });

            it("should transition from OPEN to USER_AGREEMENT", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
            });

            it("should transition from OPEN to Awaiting Chatbot Response", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
            });

            it("should transition from OPEN to IDLE to Close", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("closed");
            });
        });

        describe("User Agreement/", function() { // USER_AGREEMENT
            it("should transition from USER_AGREEMENT to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("closed");
                expect(result).toBe("closed");
            });

            it("should transition from USER_AGREEMENT to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
            });
        });

        describe("Awaiting Chatbot Response/", function() { // AWAITING_CHATBOT_RESPONSE
            it("should transition from Awaiting Chatbot Response to Chatbot Responding to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("open");
            });

            it("should transition from Awaiting Chatbot Response to Error to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("open");
            });
        });

        describe("Chatbot Responding/", function() { // CHATBOT_RESPONDING
            it("should transition from Chatbot Responding to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("open");
            });
        });

        describe("Idle/", function() { // IDLE
            it("should transition from IDLE to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("closed");
            });
        });

        describe("Error/", function() { // ERROR
            it("should transition from Error to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("open");
            });
        });
    });

    describe("Invalid Transitions", function() { // Invalid Transitions
        describe("Closed/", function() { // CLOSED
            it("should not transition from CLOSED to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("closed");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to USER_AGREEMENT", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to AWAITING_CHATBOT_RESPONSE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to CHATBOT_RESPONDING", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to IDLE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("closed");
            });

            it("should not transition from CLOSED to ERROR", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("closed");
            });
        });

        describe("Open/", function() { // OPEN
            it("should not transition from OPEN to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
            });

            it("should not transition from OPEN to CHATBOT_RESPONDING", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("open");
            });

            it("should not transition from OPEN to ERROR", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("open");
            });
        });

        describe("User Agreement/", function() { // USER_AGREEMENT
            it("should not transition from USER_AGREEMENT to USER_AGREEMENT", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
            });

            it("should not transition from USER_AGREEMENT to AWAITING_CHATBOT_RESPONSE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("userAgreement");
            });

            it("should not transition from USER_AGREEMENT to CHATBOT_RESPONDING", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("chatbotResponding");
                expect(result).toBe("userAgreement");
            });

            it("should not transition from USER_AGREEMENT to IDLE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("userAgreement");
            });

            it("should not transition from USER_AGREEMENT to ERROR", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("userAgreement");
                var result = stateMachineModule.changeState("error");
                expect(result).toBe("userAgreement");
            });
        });

        describe("Awaiting Chatbot Response/", function() { // AWAITING_CHATBOT_RESPONSE
            it("should not transition from AWAITING_CHATBOT_RESPONSE to AWAITING_CHATBOT_RESPONSE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
            });

            if("should not transition from AWAITING_CHATBOT_RESPONSE to CLOSED", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("closed");
                expect(result).toBe("awaitingChatbotResponse");
            });

            it("should not transition from AWAITING_CHATBOT_RESPONSE to OPEN", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("awaitingChatbotResponse");
            });

            it("should not transition from AWAITING_CHATBOT_RESPONSE to USER_AGREEMENT", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("userAgreement");
                expect(result).toBe("awaitingChatbotResponse");
            });

            it("should not transition from AWAITING_CHATBOT_RESPONSE to IDLE", function() {
                var result = stateMachineModule.getCurrentState();
                expect(result).toBe("closed");
                var result = stateMachineModule.changeState("open");
                expect(result).toBe("open");
                var result = stateMachineModule.changeState("awaitingChatbotResponse");
                expect(result).toBe("awaitingChatbotResponse");
                var result = stateMachineModule.changeState("idle");
                expect(result).toBe("awaitingChatbotResponse");
            });
        });

        // CHATBOT_RESPONDING automatically transitions to OPEN

        // IDLE automatically transitions to CLOSED

        // ERROR automatically transitions to OPEN
    });
});
