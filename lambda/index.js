/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const AmzIntents = require('./amazon-intents');
const LifecycleHandlers = require('./lifecycle-handlers');
const PokeAgendaTrainNumber = require('./poke-agenda-train-pokemon-number');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Ok, the Poke Agenda is ready. What would you like?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PokeAgendaTrainNumber.TrainWhichPokemonNumberHandler,
        PokeAgendaTrainNumber.WhichPokemonNumberAnswerHandler,
        AmzIntents.HelpIntentHandler,
        AmzIntents.CancelAndStopIntentHandler,
        AmzIntents.FallbackIntentHandler,
        LifecycleHandlers.SessionEndedRequestHandler)
    .addErrorHandlers(
        LifecycleHandlers.ErrorHandler)
    .withCustomUserAgent('poke-agenda/v1.0')
    .lambda();