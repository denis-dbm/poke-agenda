const Alexa = require('ask-sdk-core');
const Axios = require('axios');
const POKEMONS_IN_UNIVERSE = 151;

const getRandomPokemonNumber = function() {
    const minNumber = 1;
    return Math.floor(Math.random() * ((POKEMONS_IN_UNIVERSE + 1) - minNumber) + minNumber);
}

const getMemoizedPokemonNumber = function(attributesManager) {
    const sessionAttributes = attributesManager.getSessionAttributes();
    
    if (sessionAttributes.pokemonNumber)
        return sessionAttributes.pokemonNumber;
    else
        return null;
}

const memoizePokemonNumber = function(attributesManager, number) {
    const sessionAttributes = attributesManager.getSessionAttributes();
    sessionAttributes.pokemonNumber = number;
    attributesManager.setSessionAttributes(sessionAttributes);
}

const matchPokemon = function(answerName, correctName) {
    if (!answerName || !correctName)
        return false;
    
    return answerName.toLowerCase() === correctName.toLowerCase();
}

const clearState = function(attributesManager) {
    const sessionAttributes = attributesManager.getSessionAttributes();
    delete sessionAttributes.pokemonNumber;
    attributesManager.setSessionAttributes(sessionAttributes);
}

const TrainWhichPokemonNumberHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'TrainWhichPokemonNumber';
    },
    handle(handlerInput) {
        let speakOutput = '';
        let number = getMemoizedPokemonNumber(handlerInput.attributesManager);
        
        if (number) {
            speakOutput = `Hum... wait, we have an active number. Which is pokemon number ${number}?`
        } else {
            number = getRandomPokemonNumber();
            memoizePokemonNumber(handlerInput.attributesManager, number);
            
            speakOutput = `OK. Which is pokemon number ${number}?`;
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const WhichPokemonNumberAnswerHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhichPokemonNumberAnswer';
    },
    async handle(handlerInput) {
        const pokemonNumber = getMemoizedPokemonNumber(handlerInput.attributesManager);
        let speakOutput = '';
        
        if (!pokemonNumber) {
            speakOutput = 'Really? Where? I can test your knowledgement about pokemons';
        } else {
            const response = await Axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`);
            const answeredPokemon = handlerInput.requestEnvelope.request.intent.slots.pokemon.value;
            
            if (response.status !== 200)
                speakOutput = "I am sorry, but I can't remember which pokemon is. Let's try again?";
            
            if (matchPokemon(answeredPokemon, response.data.name))
                speakOutput = `It's correct! ${response.data.name}'s number is ${pokemonNumber}`;
            else
                speakOutput = `Incorrect... the Pokemon is ${response.data.name}. Let's try again?`;
            
            clearState(handlerInput.attributesManager);
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
}

module.exports = {
  TrainWhichPokemonNumberHandler,
  WhichPokemonNumberAnswerHandler
};