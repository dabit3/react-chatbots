# Building ChatBots with React & AWS

In this tutorial, I'll walk through how to leverage AWS Amplify & Amazon Lex to build a functioning chatbot!

As voice and messaging channels become more and more important, voice as a platform is emerging to be another important target for developers who want to extend their existing skillset to create applications that are becoming more and more in demand.

Amazon Lex is service for building conversational interfaces into any application using voice and text.

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

Each intent can be thought of as its own unique application and configuration. Each intent also has it's own set of Sample Utterances & Slots (which we'll look at next).

The two main areas of the Lex console to take note of as of now are the __Sample Utterances__ & the __Slots__.

### Sample Utterances

Sample utterances are basically triggers to instantiate the bot. The idea here is to give enough sample utterances to cover most situations for the intent of the bot.

### Slots

Slots are the responses that you will be giving to the user once the bot is instantiated. The order of the slots is important, as it is the order that the responses will come to the user and the order in which the responses from the user will be gathered.

For now, we will leave everything as it is and go ahead and connect our React app to the chat bot!

Before connecting our React app to our new chat bot we need to pull down the new configuration that we updated in the console down to our local project. To do so we can run the following command:

```bash
awsmobile pull
```

> When prompted with __sync corresponding contents in backend/ with #current-backend-info/__, choose yes.

Now, we're ready to go to the next step.

## Connecting the React App to the ChatBot

To connect the React Application to the chat bot we need to do two things:

1. Configure our React Application to recognize our AWS configuration using the AWS Amplify library.

2. Configure our React Application to work with our new chat bot.

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

### 2. Add a method to handle the response from the chat bot.

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

So far what we have is a great intro to creating a bot, but in reality we'll want the bot to do much more. Much of the power behind using Lex comes with the ease of integration with Lambda functions, allowing us to take the results of the bot conversation and do things with it, like interact with external APIs & services.

Let's update our bot to send the response to a Lambda function instead of just returning the response.

