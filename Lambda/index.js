
/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * App ID for the skill
 */
var APP_ID = undefined; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/*****/
//Environment Configuration
var config = {};
config.IOT_BROKER_ENDPOINT      = "a3730revvijqbs.iot.eu-central-1.amazonaws.com".toLowerCase();
config.IOT_BROKER_REGION        = "us-central-1";
config.IOT_THING_NAME           = "flogo";
//Loading AWS SDK libraries
var AWS = require('aws-sdk');
AWS.config.region = config.IOT_BROKER_REGION;
//Initializing client for IoT
var iotData = new AWS.IotData({endpoint: config.IOT_BROKER_ENDPOINT});

var AlexaSkill = require('./AlexaSkill');

var HelloWorld = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
HelloWorld.prototype = Object.create(AlexaSkill.prototype);
HelloWorld.prototype.constructor = HelloWorld;

HelloWorld.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("HelloWorld onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

HelloWorld.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("HelloWorld onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Welcome to the Alexa Skills Kit, you can say hello";
    var repromptText = "You can say hello";
    response.ask(speechOutput, repromptText);
};

HelloWorld.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("HelloWorld onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

HelloWorld.prototype.intentHandlers = {
    // register custom intent handlers
    "FlogoLightsOnIntent": function (intent, session, response) {
        //response.tellWithCard("Hello World!", "Hello World", "Hello World!");
        console.log("FlogoLightsOnIntent started");
        /****/
        var repromptText = null;
        var sessionAttributes = {};
        var shouldEndSession = true;
        var speechOutput = "";
        var payloadObj=1; //On
        //Prepare the parameters of the update call
        var paramsUpdate = {
            topic:"/awsiot_to_localgateway",
            payload: JSON.stringify(payloadObj),
            qos:0
        };
        iotData.publish(paramsUpdate, function(err, data) {
          if (err){
            //Handle the error here
            console.log("MQTT Error" + data);
          }
          else {
            speechOutput = "Turning lights on now.";
            console.log(data);
            response.tell(speechOutput);
            //callback(sessionAttributes,buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
          }    
        });
    },
     "FlogoLightsOffIntent": function (intent, session, response) {
        console.log("FlogoLightsOffIntent started");
        var repromptText = null;
        var sessionAttributes = {};
        var shouldEndSession = true;
        var speechOutput = "";
        //payload to be passed to flogo flow
        var payloadObj=0; //off
         var paramsUpdate = {
            topic:"/awsiot_to_localgateway",
            payload: JSON.stringify(payloadObj),
            qos:0
        };
        iotData.publish(paramsUpdate, function(err, data) {
          if (err){
            //Handle the error here
            console.log("MQTT Error" + data);
          }
          else {
            speechOutput = "Turning lights off now.";
            console.log(data);
            response.tell(speechOutput);
            //callback(sessionAttributes,buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
          }    
        });
        /****/
    },
    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("You can ask me to turn lights on or off", "You can ask me to turn lights on or off");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the HelloWorld skill.
    var helloWorld = new HelloWorld();
    helloWorld.execute(event, context);
};
