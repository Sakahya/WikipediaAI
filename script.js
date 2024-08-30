// Add this event listener to handle the Enter key
document.getElementById('userInput').addEventListener('keypress', function(event) {
	if (event.key === 'Enter') {
		event.preventDefault(); // Prevent the default action (form submission)
		document.getElementById('sendBTN').click(); // Simulate clicking the Send button
	}
});
document.getElementById('sendBTN').addEventListener('click', async function() {
	const userInput = document.getElementById('userInput').value.trim();
	if (!userInput) return;
	// Display user's message
	appendMessage('user', userInput);
	document.getElementById('userInput').value = '';
	// Show loading animation
	const loadingMessage = "Loading...";
	appendMessage('bot', loadingMessage);
	// Process the user input
	const botResponse = await processUserInput(userInput);
	// Remove loading message
	removeLoadingMessage();
	// Display bot's response
	appendMessage('bot', botResponse);
});

function appendMessage(sender, message) {
	const chatbox = document.getElementById('chatbox');
	const messageElement = document.createElement('li');
	messageElement.className = `chat-${sender} chat`;
	messageElement.innerHTML = message; // Set the message HTML
	chatbox.appendChild(messageElement);
	chatbox.scrollTop = chatbox.scrollHeight; // Scroll to the bottom
	// Style user messages
	if (sender === 'user') {
		messageElement.style.textAlign = 'right';
		messageElement.style.backgroundColor = '#2196F3'; // Solid blue for user
		messageElement.style.color = 'white';
		messageElement.style.marginLeft = 'auto'; // Align to the right
		messageElement.style.borderRadius = '10px 10px 0 10px'; // Rounded corners
		messageElement.style.padding = '10px'; // Padding for the bubble
		messageElement.style.maxWidth = '70%'; // Max width for the bubble
	} else {
		messageElement.style.textAlign = 'left';
		messageElement.style.backgroundColor = '#4CAF50'; // Solid green for bot
		messageElement.style.color = 'white';
		messageElement.style.borderRadius = '10px 10px 10px 0'; // Rounded corners
		messageElement.style.padding = '10px'; // Padding for the bubble
		messageElement.style.maxWidth = '70%'; // Max width for the bubble
	}
}

function removeLoadingMessage() {
	const chatbox = document.getElementById('chatbox');
	const loadingMessages = chatbox.querySelectorAll('.chat-bot');
	loadingMessages.forEach(msg => {
		if (msg.textContent === "Loading...") {
			chatbox.removeChild(msg);
		}
	});
}
async function processUserInput(userInput) {
	// Fetch response from Wikipedia
	const wikipediaResponse = await fetchWikipediaSummary(userInput);
	if (wikipediaResponse) {
		// Get the image associated with the topic
		const imageUrl = await fetchWikipediaImage(userInput);
		const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${userInput} image" style="max-width: 100%; border-radius: 10px; margin-top: 10px;"/>` : '';
		return `${wikipediaResponse}<br>${imageHtml}`;
	} else {
		return "I'm sorry, I couldn't find any relevant information for your query.";
	}
}
async function fetchWikipediaSummary(topic) {
	const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
	if (!response.ok) {
		console.error("Error fetching summary:", response.statusText);
		return null; // Return null if the response is not successful
	}
	const data = await response.json();
	return data.extract; // Return the summary text
}
async function fetchWikipediaImage(topic) {
	const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topic)}&prop=pageimages&piprop=original&format=json&origin=*`);
	if (!response.ok) {
		console.error("Error fetching image:", response.statusText);
		return null; // Return null if the response is not successful
	}
	const data = await response.json();
	const page = Object.values(data.query.pages)[0];
	return page.original ? page.original.source : null; // Return original size image or null if no image found
}
document.getElementById('clearChatBtn').addEventListener('click', function() {
	const chatbox = document.getElementById('chatbox');
	chatbox.innerHTML = ''; // Clear all messages
});
// Add this event listener for the dark mode toggle button
document.querySelector('.dark-mode-toggle').addEventListener('click', function() {
	document.body.classList.toggle('dark-mode'); // Toggle the dark mode class
	// Change the button text based on the current mode
	if (document.body.classList.contains('dark-mode')) {
		this.textContent = 'Toggle Light Mode'; // Set text for dark mode
	} else {
		this.textContent = 'Toggle Dark Mode'; // Set text for light mode
	}
});
async function processUserInput(userInput) {
	// Check if the user input is just "/"
	if (userInput === "/") {
		return getCommandList();
	}
	// Check if the user input starts with "/"
	else if (userInput.startsWith("/")) {
		return await handleCommand(userInput);
	}
	// Fetch response from Wikipedia for general queries
	else {
		return await fetchWikipediaResponse(userInput);
	}
}
//cmd needed

// Function to fetch synonyms and related words
async function fetchSynonyms(word) {
	try {
		// Fetch synonyms
		const synonymsResponse = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=20`);
		const synonymsData = await synonymsResponse.json();
		// Fetch related words (including alternative expressions)
		const relatedResponse = await fetch(`https://api.datamuse.com/words?rel_trg=${encodeURIComponent(word)}&max=20`);
		const relatedData = await relatedResponse.json();
		// Combine synonyms and related words
		const combinedWords = [...synonymsData, ...relatedData];
		const uniqueWords = [...new Set(combinedWords.map(item => item.word))]; // Remove duplicates
		if (uniqueWords.length > 0) {
			let synonymsResponse = `<h3>Words related to "${word}":</h3><ul>`;
			uniqueWords.forEach(item => {
				synonymsResponse += `<li>${item}</li>`;
			});
			synonymsResponse += '</ul>';
			return synonymsResponse;
		} else {
			return `No related words found for "${word}".`;
		}
	} catch (error) {
		console.error('Error fetching synonyms:', error);
		return `Error fetching related words for "${word}".`;
	}
}
// Function to fetch different forms of a word
async function fetchWordForms(word) {
	try {
		const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
		const data = await response.json();
		if (data.length > 0) {
			const forms = [];
			const wordData = data[0];
			// Add the base form
			forms.push(wordData.word);
			// Add common forms based on the word type
			const partOfSpeech = wordData.meanings[0].partOfSpeech; // Get the part of speech
			if (partOfSpeech === 'verb') {
				forms.push(wordData.word + 's'); // Third person singular
				forms.push(wordData.word + 'ed'); // Past tense
				forms.push(wordData.word + 'ing'); // Present participle
			} else if (partOfSpeech === 'adjective') {
				forms.push(wordData.word + 'er'); // Comparative
				forms.push(wordData.word + 'est'); // Superlative
			}
			// Add more complex forms if applicable
			if (wordData.meanings) {
				wordData.meanings.forEach(meaning => {
					meaning.definitions.forEach(def => {
						if (def.example) {
							forms.push(def.example); // Example sentences as forms
						}
					});
				});
			}
			// Remove duplicates and filter out invalid forms
			const uniqueForms = [...new Set(forms.filter(form => form.length > 0))];
			let formsResponse = `<h3>Forms of "${word}":</h3><ul>`;
			uniqueForms.forEach(form => {
				formsResponse += `<li>${form}</li>`;
			});
			formsResponse += '</ul>';
			return formsResponse;
		} else {
			return `No forms found for "${word}".`;
		}
	} catch (error) {
		console.error('Error fetching word forms:', error);
		return `Error fetching forms for "${word}".`;
	}
}
// Function to enhance text
async function improveText(text) {
    // Simulating an enhancement process for the provided text
    const enhancedText = text
        .replace(/(\.\s+)/g, '. ') // Ensure proper spacing after periods
        .replace(/\s+/g, ' ') // Remove extra spaces
        .trim(); // Trim leading and trailing whitespace

    // Enhance vocabulary and fix grammatical issues
    const vocabularyEnhancedText = enhancedText
        .replace(/improve/g, 'ameliorate')
        .replace(/use/g, 'utilize')
        .replace(/make/g, 'render')
        .replace(/good/g, 'commendable')
        .replace(/bad/g, 'detrimental')
        .replace(/help/g, 'assist')
        .replace(/very/g, 'exceedingly');

    // Return the enhanced paragraph
    return `Here is the enhanced paragraph:\n\n"${vocabularyEnhancedText}"`;
}
//wik resp
async function fetchWikipediaResponse(query) {
	const wikipediaResponse = await fetchWikipediaSummary(query);
	if (wikipediaResponse) {
		const imageUrl = await fetchWikipediaImage(query);
		const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${query} image" style="max-width: 100%; border-radius: 10px; margin-top: 10px;"/>` : '';
		return `${wikipediaResponse}<br>${imageHtml}`;
	} else {
		return "I'm sorry, I couldn't find any relevant information for your query.";
	}
}
// Function to fetch weather information
async function fetchWeatherInfo(place) {
	try {
		const response = await fetch(`https://wttr.in/${encodeURIComponent(place)}?format=%C+%t+%h+%w`);
		const weatherData = await response.text();
		const [description,
			temperature, humidity,
			windSpeed
		] = weatherData.split(' ');
		return `
            <h3>Weather Information for ${place}:</h3>
            <p>Description: ${description}</p>
            <p>Temperature: ${temperature}</p>
            <p>Humidity: ${humidity}</p>
            <p>Wind Speed: ${windSpeed}</p>
        `;
	} catch (error) {
		console.error('Error fetching weather information:', error);
		return `Error fetching weather information for ${place}.`;
	}
}
// Function to fetch a random joke
async function fetchRandomJoke() {
	try {
		const response = await fetch('https://official-joke-api.appspot.com/random_joke');
		const data = await response.json();
		return `${data.setup} - ${data.punchline} 😄`;
	} catch (error) {
		console.error('Error fetching random joke:', error);
		return 'Error fetching random joke.';
	}
}
// Function to fetch the definition of a word
async function fetchDefinition(word) {
	try {
		const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
		const data = await response.json();
		if (data.length > 0) {
			const definitions = data[0].meanings.flatMap(meaning => meaning.definitions);
			let definitionResponse = `<h3>Definition of "${word}":</h3>`;
			definitions.forEach(def => {
				definitionResponse += `<p>${def.definition}</p>`;
			});
			return definitionResponse;
		} else {
			return `No definition found for "${word}".`;
		}
	} catch (error) {
		console.error('Error fetching definition:', error);
		return `Error fetching definition for "${word}".`;
	}
}
// Function to fetch a random fact
async function fetchRandomFact() {
    try {
        const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error('Error fetching random fact:', error);
        return 'Error fetching random fact.';
    }
}

// Update the handleCommand function to handle the /fact command
async function handleCommand(command) {
    const [cmd, ...args] = command.split(" ");
    const arg = args.join(" "); // Join the remaining arguments back into a single string
    switch (cmd) {
        case "/joke":
            return await fetchRandomJoke();
        case "/define":
            return await fetchDefinition(arg);
        case "/brief":
            return await fetchBriefExplanationFromBritannica(arg);
        case "/weather":
            return await fetchWeatherInfo(arg);
        case "/word":
            return await fetchSynonyms(arg);
        case "/forms":
            return await fetchWordForms(arg);
        case "/improve":
        case "/enhance":
            return await improveText(arg);
        case "/fact":
            return await fetchRandomFact();
        default:
            return "I'm sorry, I couldn't understand that command.";
    }
}

// Update the getCommandList function to include the /fact command
function getCommandList() {
    return `
        Here are the commands you can use:
        <ul>
            <li><strong>/joke</strong> - Get a random joke.</li>
            <li><strong>/define [word]</strong> - Get the definition of a specific word.</li>
            <li><strong>/brief</strong> - Get a brief explanation from Britannica.</li>
            <li><strong>/weather [place]</strong> - Get the current weather for a specific place.</li>
            <li><strong>/word [word]</strong> - Get synonyms for a word.</li>
            <li><strong>/forms [word]</strong> - Get various forms of the specified word.</li>
            <li><strong>/improve [text]</strong> (or <strong>/enhance [text]</strong>) - Suggest improvements for the provided text.</li>
            <li><strong>/fact</strong> - Get a random fact.</li>
        </ul>
    `;
}

// Function to enhance text
async function improveText(text) {
    // Simulating an enhancement process for the provided text
    const enhancedText = text
        .replace(/(\.\s+)/g, '. ') // Ensure proper spacing after periods
        .replace(/\s+/g, ' ') // Remove extra spaces
        .trim(); // Trim leading and trailing whitespace

    // Enhance vocabulary and fix grammatical issues
    const vocabularyEnhancedText = enhancedText
        .replace(/improve/g, 'ameliorate')
        .replace(/use/g, 'utilize')
        .replace(/make/g, 'render')
        .replace(/good/g, 'commendable')
        .replace(/bad/g, 'detrimental')
        .replace(/help/g, 'assist')
        .replace(/very/g, 'exceedingly');

    // Return the enhanced paragraph
    return `Here is the enhanced paragraph:\n\n"${vocabularyEnhancedText}"`;
}

// Update the handleCommand function to handle the /improve command
async function handleCommand(command) {
    const [cmd, ...args] = command.split(" ");
    const arg = args.join(" "); // Join the remaining arguments back into a single string
    switch (cmd) {
        case "/improve":
            return await improveText(arg);
        default:
            return "I'm sorry, I couldn't understand that command.";
    }
}