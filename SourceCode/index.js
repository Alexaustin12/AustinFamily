/**
This function provides information about the Austin household
For questions, reach out to Alex Austin
 **/

'use strict';

var aws = require('aws-sdk'); //enables additional functions that we won't use in this tutorial
var CARD_TITLE = "Austin Family Bot"; // The title that will show on the Alexa App

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
    const APP_ID = 'amzn1.ask.skill.a3cddf78-3f10-4962-b185-bd2ec2c22bfd';  // Replace with your Alexa skill's app ID. Security measure so that only your skill can call this functional.
    if (event.session.application.applicationId !== APP_ID) {
        context.fail("Invalid Application ID");
     }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            handleFinishSessionRequest(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
            //onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);

    // add any session init logic here
}

/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

    getWelcomeResponse(callback);
}


/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId); //send the session ID to the log (does not impact user experience, could be useful for debugging)

    var intent = intentRequest.intent, 
        intentName = intentRequest.intent.name; //we've now taken in a JSON object (intentRequest) and we're grabing the value "intent.name" and storing it for use below
    
    //Based on the intentName, we're defining what we want the skill to do
    if ("whoLivesAtIntent" === intentName) {
        handleWhoLivesAtRequest(intent, session, callback); 
    } else if ("choresTurnIntent" === intentName) {
        handleChoresTurnRequest(intent, session, callback);
    } else if ("funFactIntent" === intentName) {
        handleFunFactRequest(intent, session, callback);
        
    } else if ("AMAZON.HelpIntent" === intentName) {
        handleGetHelpRequest(intent, session, callback);
    } else if ("AMAZON.StopIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.CancelIntent" === intentName) {
        handleFinishSessionRequest(intent, session, callback);
    } else if ("AMAZON.StartOverIntent" === intentName) {
        getWelcomeResponse(callback);
    } else if ("AMAZON.RepeatIntent" === intentName) {
        handleRepeatRequest(intent, session, callback);
    } else {
        handleInvalidRequest(intent, session, callback) 
        throw "Invalid intent";
    }
}

//--------------logic to handle each intent------------
function handleWhoLivesAtRequest(intent, session, callback){
    var sessionAttributes = {},
    speechOutput,
    householdName = intent.slots.householdName.value.toLowerCase(),
    roundhill = "Grandmommy and Grandaddy",
    stratford = "Jesse, Hunter, Will, and Austin live there.",
    newYork = "Brad and Sherry, of course... Oh, and a cat or two",
    statesville = "Taylor, Carey, Brinkley, Emma Ruth, and Jack. Sounds like fun!",
    berkeley = "Alex, and his roommates Christian, Greg, Steve, and Neeraj.",
    unknown = "I'm not sure who lives there. Dont forget, I'm just a robot!";
    
    if (householdName == 'round hill') {speechOutput = roundhill}
    else if (householdName == 'stratford') {speechOutput = stratford}
    else if (householdName == 'new york') {speechOutput = newYork}
    else if (householdName == 'statesville') {speechOutput = statesville}
    else if (householdName == 'california') {speechOutput = berkeley}
    else {speechOutput = unknown}
    
    var repromptText = "Are you still there? Try asking me who should take out the trash", //additional text you want Alexa to say if the user doesnt respond for 5 seconds
    shouldEndSession = true; //true if you want Alexa to end the session and close your skill, false if you want her to keep listening for another question
  
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function handleChoresTurnRequest(intent, session, callback){
    var sessionAttributes = {};
    var familyMembers = [
        'Alex',
        'Kirtie',
        'Kenny',
        'Jesse',
        'Hunter',
        'Taylor',
        'Carey',
        'Brad',
        'Sherry'
        ],
    funReplies = [
        'Hmmmm, I really think that should be ',
        'Well, since you asked, I would say ',
        'I choose ',
        'The best person for the job is ',
        "This time around I'll go with ",
        'Maybe we should switch it up and say ',
        'Though its not their turn, I still pick ',
        'Better go with ',
        'I think you should pick this time... Just kidding. It should be ',
        'You know who would be good at that? '
        ],    
    rand = Math.floor(Math.random() * familyMembers.length), //generate a random number between 1 and the "length" of the roommates array aka the number of items in the array called roommates (defined above). We also round the result down, since arrays actually start numbering at 0 instead of 1, but you don't need to know this detail.
    funRand = Math.floor(Math.random() * funReplies.length),
    speechOutput = funReplies[funRand] + familyMembers[rand], //now we grab the name from the slot at number rand. e.g. if rand was 3, we'd grab the 3rd name
    repromptText = "Are you still there? Try asking me who lives here", 
    shouldEndSession = true; 
  
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function handleFunFactRequest(intent, session, callback){
    var sessionAttributes = {},
    familyMemberName = intent.slots.familyMemberName.value.toLowerCase(),
    speechOutput;
    
    //probably going to want to convert this one to pull from a database
    if (familyMemberName == 'brinkley') {speechOutput = "Brinkley plays basketball!"}
    else if (familyMemberName == 'will') {speechOutput = "Will licks his toes"}
    else if (familyMemberName == 'emma ruth' || familyMemberName == 'er') {speechOutput = "Emma Ruth is great at singing"} //skill repeatedly fails if you try to invoke this intent straight from wake. e.g. if you say Alexa, ask scenic bot who is in axe? It fails out. However, if you open scenic bot, then ask who is in axe, it works. I've tried many iterations of axe, ax, x and nothing fixes, not sure whats causing this bug. It similarly fails out with oski.
    else if (familyMemberName == 'jack') {speechOutput = "Jack loves to dance."} // || cohortName == 'aska' || cohortName == 'an oscar' || cohortName == 'ask you' || cohortName == 'oskri'
    else if (familyMemberName == 'austin') {speechOutput = "Austin loves fire trucks."} 
    else speechOutput = "Enjoys long walks on the beach, going to the lake, and taco bell.";
    
    var repromptText = "Are you still there? Try asking me who should take out the trash", 
    shouldEndSession = true; 
  
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}




//------------logic for required/default Amazon functions-----------

function handleInvalidRequest(intent, session, callback) {
    var sessionAttributes = {},
        speechOutput = "Sorry, I don't follow. Try saying: Who lives in statesville?",
        repromptText = "Try saying: Who lives on stratford?";
        var shouldEndSession = false;
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function getWelcomeResponse(callback) {
    var sessionAttributes = {},
        speechOutput = "Hi, you can ask me who should do the chores. Try saying: Who should take out the trash?";
        var shouldEndSession = false;
        var repromptText = "Try saying: Who should do the dishes?";
    sessionAttributes = {
        "speechOutput": speechOutput,   //I think this is just recording what Alexa said for use later
        "repromptText": repromptText,   
    };
    callback(sessionAttributes,
        buildSpeechletResponse(CARD_TITLE, speechOutput, repromptText, shouldEndSession));
}

function handleRepeatRequest(intent, session, callback) {
    // Repeat the previous speechOutput and repromptText from the session attributes if available
    // else start a new session
    if (!session.attributes || !session.attributes.speechOutput) {
        getWelcomeResponse(callback);
    } else {
        callback(session.attributes,
            buildSpeechletResponseWithoutCard(session.attributes.speechOutput, session.attributes.repromptText, false));
    }
}

function handleGetHelpRequest(intent, session, callback) {
    // Provide a help prompt for the user, explaining how the skill works. Then, continue the skill
    // if there is one in progress, or provide the option to start another one.
    
    // Ensure that session.attributes has been initialized
    if (!session.attributes) {
        session.attributes = {};
    }

    // Set a flag to track that we're in the Help state.
    session.attributes.userPromptedToContinue = true;

    // Do not edit the help dialogue. This has been created by the Alexa team to demonstrate best practices.
    var speechOutput = "You can ask me who lives in new york or for fun facts. Try saying: Tell me a fact about Jack.";
    var repromptText = "You can also try saying: Who lives in California?";
    var shouldEndSession = false;
    callback(session.attributes,
        buildSpeechletResponseWithoutCard(speechOutput, repromptText, shouldEndSession));
}
function handleFinishSessionRequest(intent, session, callback) {
    // End the session with a "Good bye!" if the user wants to quit the skill
    callback(session.attributes,
        buildSpeechletResponseWithoutCard("Good bye!", "", true));
}


//-----------helper functions  ----------------
function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithDetail(title, detail, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: title,
            content: detail
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponsewithImage(title, detail, smallImageURL, largeImageURL, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
          type: "Standard",
          title: title,
          text: detail,
          image: {
            smallImageUrl: smallImageURL,
            largeImageUrl: largeImageURL
          }
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
