# Building ChatBots with React & AWS

![](https://i.imgur.com/091cjMi.png)

In this tutorial, I'll walk through how to leverage AWS Amplify, AWS Lambda, & Amazon Lex to build a functioning chatbot!

> To see the final code, click [here](https://github.com/dabit3/react-chatbots).

As voice and messaging channels become more and more important, conversational interfaces as a platform are emerging to be another important target for developers who want to extend their existing skillset to create applications that are becoming more and more in demand. Amazon Lex is service for building conversational interfaces into any application using voice and text.

In this tutorial, we'll use the AWS Mobile CLI to create a new cloud-enabled project and add an Amazon Lex bot to our project. We'll then create a React application and use the AWS Amplify library to connect to and interact with the bot.

We'll also connect the bot to an AWS Lambda function and show how we can work with the parameters passed to our Lambda function if we would like to then connect to any external services or APIs using our chatbot.

The bot that we will be creating will be a booking service to book hotels and car rentals!

AWS Amplify provides some preconfigure chat UI that we'll start off with, but we will also be using [React Chat UI](https://github.com/brandonmowat/react-chat-ui) written by [Brandon Mowat](https://github.com/brandonmowat) for any custom chat UI that we end up building.

## Getting Started

The first thing we need to do is create a new React application using [Create React App](https://github.com/facebook/create-react-app). (If you don't already have it installed, go ahead and install if before going to the next step).

We'll create a new application called react-chatbot:

```bash
create-react-app react-chatbot
```

Next, we'll change into the directory for the react-chatbot application:

```bash
cd react-chatbot
```

Now, we'll need to create our new AWS project using the AWS Mobile CLI

To do so we'll first need to install the CLI.

```bash
npm i -g awsmobile-cli
```

Next, we need to configure the CLI with our AWS IAM credentials:

```bash
awsmobile configure
```

> If you've never worked with IAM credentials, [this video](https://www.youtube.com/watch?v=MpugaNKtw3k) will walk you through the entire process as well as configuring the CLI.

Now that the CLI is installed and configured, let's create a new AWS project:

```bash
awsmobile init -y
```

Once the project is created, we'll need to add cognito funcionality in order to interact with Lex. To do so we can run the following command:

```bash
awsmobile user-signin enable
```

Then, we can push the new configuration to AWS:

```bash
awsmobile push
```

Now, our project is created & we can move on to the next step:

## Creating the Lex chatbot

To create a chatbot we'll need to go ahead and open the project that we are working with in the AWS console. To do so, we can run the following command:

```bash
awsmobile console
```

Here, we should see our project in the AWS Console:

![](https://i.imgur.com/YByAHCB.png)

If we scroll down this window, we will see a feature called __Conversational Bots__. Click on this feature.

Next, we'll choose the __Book a trip__ sample bot, give the bot the name of __BookTripBot__ and then click __Create Bot__:

![](https://imgur.com/Y9Qiym5.png)

Now, we should see the bot that was created in our console! To edit the bot, click on the blue edit button:

![](https://imgur.com/DcHEhvy.png)

Now, we should see the Lex console:

![](https://i.imgur.com/eaSmFNc.png)

On the left hand side you will see all of the __Intents__ associated with the current chatbot.

In our case we have two intents: BookTripBotBookCar & BookTripBotBookHotel.

Each intent can be thought of as its own unique application and configuration. Each intent also has it's own set of Sample Utterances & Slots (which we'll look at next).

The two main areas of the Lex console to take note of as of now are the __Sample Utterances__ & the __Slots__.

### Sample Utterances

Sample utterances are basically triggers to instantiate the bot. The idea here is to give enough sample utterances to cover most situations for the intent of the bot.

### Slots

Slots are the responses that you will be giving to the user once the bot is instantiated. The order of the slots is important, as it is the order that the responses will come to the user and the order in which the responses from the user will be gathered.

For now, we will leave everything as it is and go ahead and connect our React app to the chatbot!

Before connecting our React app to our new chatbot we need to pull down the new configuration that we updated in the console down to our local project. To do so we can run the following command:

```bash
awsmobile pull
```

> When prompted with __sync corresponding contents in backend/ with #current-backend-info/__, choose yes.

Now, we're ready to go to the next step.

## Connecting the React App to the ChatBot

To connect the React Application to the chatbot we need to do two things:

1. Configure our React Application to recognize our AWS configuration using the AWS Amplify library.

2. Configure our React Application to work with our new chatbot.

### Configuring the app with AWS

To configure the app with the AWS resources we have just created we'll need to open `index.js` and add the following code below the last import:

```js
// other imports omitted
import config from './aws-exports' // new
import Amplify from 'aws-amplify' // new
Amplify.configure(config) // new

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
```

### Connecting the ChatBot to the React Application

Next, in `App.js`, we'll be using the __ChatBot__ component from `aws-amplify-react` to render some preconfigured UI for now that will interact with the bot.

### 1. Import the ChatBot component.

```js
import { ChatBot } from 'aws-amplify-react';
```

### 2. Add a method to handle the response from the chatbot.

```js
handleComplete(err, confirmation) {
    if (err) {
      alert('Bot conversation failed')
      return;
    }
    alert('Success: ' + JSON.stringify(confirmation, null, 2));
    return 'Reservation booked. Thank you! What would you like to do next?';
  }
```

### 3. Add the ChatBot component in the render method before the last closing div.

```js
<ChatBot
  title="My React Bot"
  botName="BookTripBotMOBILEHUB"
  welcomeMessage="Welcome, how can I help you today?"
  onComplete={this.handleComplete.bind(this)}
  clearOnComplete={true}
/>
```

Now, we should see the chatbot and be able to interact with it!

![](https://i.imgur.com/kUUxgai.png)

## Working with Lambda functions.

So far what we have is a great intro to creating a bot, but in reality we'll want the bot to do much more. Much of the power behind using Lex comes with the ease of integration with Lambda functions, allowing us to take the results of the bot conversation and do things with them, like interact with external APIs & services.

If we look at the __Fulfillment__ section of the Lex bot, we'll see that the current setting is __Return parameters to client__.

![](https://imgur.com/EkV8pa9.png)

Let's update our bot to send the response to a Lambda function instead of just returning the response. To do so, we first need to create a new Lambda function.

### Creating a Lambda function

To create a Lambda function, we need to go to the AWS Lambda console in the AWS dashboard. We can get there by either visiting [https://console.aws.amazon.com/lambda](https://console.aws.amazon.com/lambda) or by choosing __Lambda__ from the list of services in the [AWS Dashboard](https://console.aws.amazon.com).

From the AWS Lambda dashboard, click on the orange __Create Function__ button.

From here, choose __Author from Scratch__, give the function the name of __lambdaBookTripBot__, & leave the runtime at __Node.js 6.10__.

For the Role, choose __Create a new role from template(s)__.

You can give the role any name, I'll give it the name __lambdaBookTripBotRole__.

In __Policy Templates__, choose __Basic Edge Lambda permissions__ as the policy, then click __Create Function__.

![](https://i.imgur.com/3P4PqhU.png)

Once the function has been created, we'll update the function code to the following, and then click __Save__ to update our function code:

```js
exports.handler = (event, context, callback) => {
  callback(null, {
    "sessionAttributes": JSON.stringify(event.slots),
    "dialogAction": {
      "type": "Close",
      "fulfillmentState": "Fulfilled",
      "message": {
        "contentType": "PlainText",
        "content": "We booked your reservation yo!"
      }
    }
  });
};
```

### Overview of working with Amazon Lex & AWS Lambda

The code we used will handle the final output of our Lex bot, and return the output as the final response of the Lex interaction. In this function, we will be accessing the data from the bot in the __event__ object: __event.slots__.

Because we will be attaching this Lambda function to the __BookTripBotBookHotel__ intent, event.slots will have the following data structure:

```js
event.slots: {
  BookTripBotCheckInDate: "<SOMEVALUE>"
  BookTripBotLocation: "<SOMEVALUE>",
  BookTripBotNights: "<SOMEVALUE>",
  BookTripBotRoomType: "<SOMEVALUE>"
}
```

Amazon Lex expects a response from a Lambda function in the following format:

```js
{
  "sessionAttributes": {
    "key1": "value1",
    // other attributes
  },
  "dialogAction": {
    "type": "ElicitIntent, ElicitSlot, ConfirmIntent, Delegate, or Close",
    // other values depending on the dialogAction "type"
  }
}
```

Depending on the __dialogAction__ `type` value, we we will then also be able to pass in other configuration / values. ([View full documenation around using Amazon Lex with AWS Lambda](https://docs.aws.amazon.com/lex/latest/dg/lambda-input-response-format.html#using-lambda-response-format)).

In our case, we are returning the __event.slots__ as the __sessionAttributes__, then we're setting the __dialogAction__ type of __Close__, a __fullfillmentState__ of __Fulfilled__, and a __message__:

```js
{
  "sessionAttributes": JSON.stringify(event.slots),
  "dialogAction": {
    "type": "Close",
    "fulfillmentState": "Fulfilled",
    "message": {
      "contentType": "PlainText",
      "content": "We booked your reservation yo!"
    }
  }
}
```

## Updating Amazon Lex to pass the Fullfillment to AWS Lambda

Now that our Lambda function has been created, we can update the Lex bot to use the Lambda function.

In the Lex console of the bot that we've already created, click on the __BookTripBotBookHotel__ intent in the left menu.

Next, in the __Fulfillment__ options, update the configuration to __AWS Lambda Function__. Now, you should be able to choose the __lambdaBookTripBot__ Lambda function that we created a moment ago as the Lambda function we would like to use.

For the version, just choose __latest__.

Next, we need to save, build, & publish the Intent:

1. Scroll to the bottom & click __Save Intent__.
2. Click __Build__ in the top right corner of the console.
3. Click __Publish__ in the top right corner of the console.

## Using the Interactions category from AWS Amplify to interact with the chatbot

To get started working with the __Interactions__ category, we'll first need to go ahead and install the UI library we will be using to display the messages:

```bash
npm i react-chat-ui
```

Now, we'll go ahead and import the dependencies we'll need to implement everything:

```js
import { Interactions } from 'aws-amplify';
import { ChatFeed, Message } from 'react-chat-ui'
```

Next, we'll go ahead and set some initial state:

```js
state = {
  input: '',
    finalMessage: '',
    messages: [
      new Message({
        id: 1,
        message: "Hello, how can I help you today?",
      })
    ],
}
```

The initial message we will be showing displays a greeting of "Hello, how can I help you today?" to the user, and is set as the first item in the array of messages being held in our state.

For this app to work we will need three class methods:

1. __onChange__ - This will update the input field with the current value of the text input.

```js
onChange(e) {
  const input = e.target.value
  this.setState({
    input
  })
}
```

2. __handleKeyPress__ - This will listen to the keyboard input and submit a new message if the __Enter__ key is pressed.

```js
_handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    this.submitMessage()
  }
}
```

3. __submitMessage__ - This function does all of the work of creating new messages, updating the UI with the new messages, interacting with the chatbot, and updating the UI with responses to the chatbot:

```js
async submitMessage() {
  const { input } = this.state
  if (input === '') return
  const message = new Message({
    id: 0,
    message: input,
  })
  let messages = [...this.state.messages, message]

  this.setState({
    messages,
    input: ''
  })
  const response = await Interactions.send("BookTripMOBILEHUB", input);
  const responseMessage = new Message({
    id: 1,
    message: response.message,
  })
  messages  = [...this.state.messages, responseMessage]
  this.setState({ messages })

  if (response.dialogState === 'Fulfilled') {
    if (response.intentName === 'BookTripBookHotel') {
      const { slots: { BookTripCheckInDate, BookTripLocation, BookTripNights, BookTripRoomType } } = response
      const finalMessage = `Congratulations! Your trip to ${BookTripLocation}  with a ${BookTripRoomType} rooom on ${BookTripCheckInDate} for ${BookTripNights} days has been booked!!`
      this.setState({ finalMessage })
    }
  }
}
```

### This function does a lot, so let's walk through it!

- The message is __async__ because we will be using __await__ to handle a promise later on in the function.

- Destructure the `input` value from the state, then check to see if it is a valid string before we continue.

- Create a new __Message__, passing in the ID of 0 and the input value as the message property.

- Create a new messages array using the existing `state.messages`, and passing in the new message to the array. We then update the state with the new messages array and the input value to be an empty string.

- Call `Interactions.send`, passing in two arguments: The bot name and the value we are passing to it.

- Take the response from the bot and create another new message, this time passing in an id of 1 and the reponse.message as the message.

- Update the messages array in the state by adding the new message we've just created.

- We check to see if the `dialogState` value is `Fulfilled` (meaning the interaction is complete), if it is we create a `finalMessage` string and update the state with the new value of `finalMessage`. We use the `response.slots` to build the `finalMessage` string.

## Creating a custom UI for interacting the the updated chatbot.

Now, we can update our `render` method to use these methods as well as the __ChatFeed__ component from `react-chat-ui`:

```js
render() {
  return (
    <div className="App">
      <header style={styles.header}>
        <p style={styles.headerTitle}>Welcome to my travel bot!</p>
      </header>
      <div style={styles.messagesContainer}>
      <h2>{this.state.finalMessage}</h2>
      <ChatFeed
        messages={this.state.messages}
        hasInputField={false}
        bubbleStyles={styles.bubbleStyles}
      />
      <input
        onKeyPress={this._handleKeyPress}
        onChange={this.onChange.bind(this)}
        style={styles.input}
        value={this.state.input}
      />
      </div>
    </div>
  );
}

const styles = {
  bubbleStyles: {
    text: {
      fontSize: 16,
    },
    chatbubble: {
      borderRadius: 30,
      padding: 10
    }
  },
  headerTitle: {
    color: 'white',
    fontSize: 22
  },
  header: {
    backgroundColor: 'rgb(0, 132, 255)',
    padding: 20,
    borderTop: '12px solid rgb(204, 204, 204)'
  },
  messagesContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    alignItems: 'center'
  },
  input: {
    fontSize: 16,
    padding: 10,
    outline: 'none',
    width: 350,
    border: 'none',
    borderBottom: '2px solid rgb(0, 132, 255)'
  }
}
```

![](https://i.imgur.com/NT5VegL.png)

> To see the final code, click [here](https://github.com/dabit3/react-chatbots/blob/master/src/App.js).

Now, we should be able to ask the bot any of the sample utterances from our __BookTripBotBookHotel__ hotel bot!

