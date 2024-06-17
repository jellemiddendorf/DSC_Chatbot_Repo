const requestBody = {
    "chat_history": [
        {
          "inputs": {
            "chat_input": "count along 1"
          },
          "outputs": {
            "chat_output": "2"
          }
        },
        {
            "inputs": {
                "chat_input": "4"
              },
              "outputs": {
                "chat_output": "8"
              } 
        }
      ],
      "chat_input": "16"
  };
  
  const requestHeaders = new Headers({
    "Content-Type": "application/json",
    "Authorization": "Bearer boqR5vhbvKJJcg3xL1M0IdgzdTTBeOtS"
  });
  
  requestHeaders.append("azureml-model-deployment", "dsc-chatbot-spicy-tomato-ep-1");
  
  const url = "https://dsc-chatbot-spicy-tomato-ep.westeurope.inference.ml.azure.com/score";
  
  fetch(url, {
    method: "POST",
    body: JSON.stringify(requestBody),
    headers: requestHeaders
  })
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      console.error("Request failed with status code", response.status);
      return response.text().then(text => { throw new Error(text); });
    }
  })
  .then((json) => console.log("Response JSON:", json))
  .catch((error) => console.error("Error during fetch:", error));
  