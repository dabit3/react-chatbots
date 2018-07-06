import React, { Component } from 'react';

import config from './aws-exports'

import Amplify from 'aws-amplify';
import { Interactions } from 'aws-amplify';
import { ChatFeed, Message } from 'react-chat-ui'


Amplify.configure({
  ...config,
  Interactions: {
    bots: {
      "BookTripMOBILEHUB": {
        "name": "BookTripMOBILEHUB",
        "alias": "$LATEST",
        "region": "us-east-1",
      },
    }
  }
});

class App extends Component {
  state = {
    input: '',
    finalMessage: '',
    messages: [
      new Message({
        id: 1,
        message: "Hello, how can I help you today?",
        name: 'AWS Chatbot'
      })
    ],
  }
  
  _handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      this.submitMessage()
    }
  }
  onChange(e) {
    const input = e.target.value
    this.setState({
      input
    })
  }
  async submitMessage() {
    const input = this.state.input
    const message = new Message({
      id: 0,
      message: input
    })
    let messages = [...this.state.messages, message]

    this.setState({
      messages,
      input: ''
    })
    const response = await Interactions.send("BookTripMOBILEHUB", input);
    const responseMessage = new Message({
      id: 1,
      message: response.message
    })
    messages  = [...this.state.messages, responseMessage]
    console.log('response: ', response)
    if (response.dialogState === 'Fulfilled') {
      if (response.intentName === 'BookTripBookHotel') {
        const { slots: { BookTripCheckInDate, BookTripLocation, BookTripNights, BookTripRoomType } } = response
        const finalMessage = `Congratulations! Your trip to ${BookTripLocation}  with a ${BookTripRoomType} rooom on ${BookTripCheckInDate} for ${BookTripNights} days has been booked!!`
        this.setState({ finalMessage })
      }
      console.log('intentName:', response.intentName)
      if (response.intentName === 'BookTripBookCar') {
        const { slots: { BookTripCarType, BookTripPickUpCity, BookTripPickUpDate }} = response
        const finalMessage = `Congratulations! Your ${BookTripCarType} for pick up in ${BookTripPickUpCity} on ${BookTripPickUpDate} has been reserved!`
        
        this.setState({ finalMessage }, () => {
          alert(this.state.finalMessage)
        })
      }  
    }
    this.setState({ messages })
  }
  render() {
    return (
      <div className="App">
        <header style={styles.header}>
          <p style={styles.headerTitle}>Welcome to my travel bot!</p>
        </header>
        <div style={styles.messagesContainer}>
        <h1>{this.state.finalMessage}</h1>
        <ChatFeed
          messages={this.state.messages}
          hasInputField={false}
          bubbleStyles={
            {
              text: {
                fontSize: 16,
              },
              chatbubble: {
                borderRadius: 30,
                padding: 10
              }
            }
          }
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
}

const styles = {
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

export default App
