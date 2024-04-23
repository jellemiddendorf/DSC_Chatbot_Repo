// // Select the HTML elements
// const button = document.querySelector('#myButton');
// const output = document.querySelector('#output');

// // Add event listener to the button
// button.addEventListener('click', () => {
//     // Perform some action when the button is clicked
//     output.textContent = 'Button clicked!';
// });

function sendMessage(source) {
    const inputId = source === 'main' ? 'main-user-input' : 'popup-user-input';
    const chatBoxId = source === 'main' ? 'main-chat-box' : 'popup-chat-box';

    const inputField = document.getElementById(inputId);
    const chatBox = document.getElementById(chatBoxId);
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
    headerElement.className = 'message-header';
    headerElement.textContent = sender === 'user' ? 'User:' : 'Chatbot:';

    const messageElement = document.createElement('div');
    messageElement.className = 'message ${sender}';
    messageElement.textContent = message;

    // Clone the setup for each chat box
    const containerMain = document.createElement('div');
    containerMain.appendChild(headerElement.cloneNode(true));
    containerMain.appendChild(messageElement.cloneNode(true));

    const containerPopup = document.createElement('div');
    containerPopup.appendChild(headerElement.cloneNode(true));
    containerPopup.appendChild(messageElement.cloneNode(true));

    // Append cloned containers to each chat box
    // Has to be done because appendChild moves the element from one parent to another
    document.getElementById('main-chat-box').appendChild(containerMain);
    document.getElementById('popup-chat-box').appendChild(containerPopup);
}

function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = sender;
    document.getElementById('chat-box').appendChild(messageElement);
}

function togglePopup() {
    var popup = document.getElementById('popup-chat-interface');
    if (popup.classList.contains('is-visible')) {
        popup.classList.remove('is-visible');
        popup.classList.add('is-hidden');
    } else {
        popup.classList.add('is-visible');
        popup.classList.remove('is-hidden');
    }
}

// Example function to fetch weather data
async function fetchWeather(query) {
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=f2e9be0466ad4d56b76103541242204&q=${query}`);
    const data = await response.json();
    return `The current temperature in ${data.location.name} is ${data.current.temp_c}°C.`;
}