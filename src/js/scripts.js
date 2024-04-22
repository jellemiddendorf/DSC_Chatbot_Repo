// Select the HTML elements
const button = document.querySelector('#myButton');
const output = document.querySelector('#output');

// Add event listener to the button
button.addEventListener('click', () => {
    // Perform some action when the button is clicked
    output.textContent = 'Button clicked!';
});