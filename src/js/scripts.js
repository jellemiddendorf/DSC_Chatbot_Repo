// // Select the HTML elements
// const button = document.querySelector('#myButton');
// const output = document.querySelector('#output');

// // Add event listener to the button
// button.addEventListener('click', () => {
//     // Perform some action when the button is clicked
//     output.textContent = 'Button clicked!';
// });

function sendMessage() {
    const inputField = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const userInput = inputField.value;
    inputField.value = '';

    // Display user input
    displayMessageWithHeader(userInput, 'user');

    // Fetch and display response
    fetchWeather(userInput).then(response => {
        displayMessageWithHeader(response, 'bot');
    }).catch(error => {
        displayMessageWithHeader('Failed to fetch data.', 'bot');
    });
}

function displayMessageWithHeader(message, sender) {
    const headerElement = document.createElement('div');
    const messageElement = document.createElement('div');
    headerElement.textContent = sender === 'user' ? 'User:' : 'Chatbot:';
    messageElement.textContent = message;
    messageElement.className = sender;
    messageElement.appendChild(headerElement);
    document.getElementById('chat-box').appendChild(headerElement);
    document.getElementById('chat-box').appendChild(messageElement);
}

function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = sender;
    document.getElementById('chat-box').appendChild(messageElement);
}

// Example function to fetch weather data
async function fetchWeather(query) {
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=f2e9be0466ad4d56b76103541242204&q=${query}`);
    const data = await response.json();
    return `The current temperature in ${data.location.name} is ${data.current.temp_c}°C.`;
}