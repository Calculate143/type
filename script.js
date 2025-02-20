const paragraphs = [
    "The ancient art of storytelling has been passed down through generations, weaving tales of adventure, love, and wisdom. In every culture, stories serve as bridges between the past and present, connecting us to our ancestors and teaching valuable lessons about life. These narratives shape our understanding of the world and help us make sense of our experiences.",
    "Technology continues to reshape our daily lives in unprecedented ways. From artificial intelligence to quantum computing, innovations are pushing the boundaries of what's possible. As we navigate this digital revolution, we must consider both the benefits and challenges that come with rapid technological advancement. The future holds endless possibilities for those who embrace change.",
    "Our planet's ecosystems are delicate networks of interconnected life forms. Each species plays a crucial role in maintaining the balance of nature. From the smallest microorganisms to the largest mammals, every creature contributes to the biodiversity that makes Earth unique. Understanding and preserving these relationships is vital for our planet's future.",
    "The human brain is perhaps the most complex structure in the known universe. With billions of neurons forming trillions of connections, it processes vast amounts of information every second. Scientists are still discovering new aspects of how our minds work, from memory formation to consciousness itself. The more we learn, the more fascinating our neural architecture appears.",
    "Music has the power to transcend language barriers and connect people across cultures. Whether it's classical symphonies, jazz improvisations, or modern electronic beats, musical expression touches something deep within the human spirit. It can evoke emotions, trigger memories, and bring people together in shared experiences.",
    "The art of cooking has evolved from simple survival skills to a sophisticated form of creative expression. Different cuisines reflect the history, geography, and culture of their origins. As global connections increase, culinary traditions blend and transform, creating exciting new flavors and dining experiences. Food continues to be a central part of human social interaction.",
    "Space exploration represents humanity's endless curiosity about the universe. As we send probes to distant planets and peer into the depths of space with powerful telescopes, we discover new wonders that challenge our understanding of reality. The quest to explore beyond Earth drives technological innovation and inspires future generations.",
    "Language shapes how we think and perceive the world around us. With thousands of languages spoken globally, each offers unique ways of expressing ideas and emotions. The words we use influence our thoughts, while our cultural context affects how we communicate. Understanding different languages opens windows into diverse ways of thinking.",
    "The history of human civilization is marked by great achievements in architecture. From ancient pyramids to modern skyscrapers, our buildings reflect our technological capabilities and cultural values. Each era's architectural style tells stories about society's priorities, beliefs, and aspirations. These structures stand as testimonies to human creativity and engineering.",
    "Physical exercise is not just about building strength or endurance; it's a crucial component of overall well-being. Regular movement affects our mental health, cognitive function, and emotional balance. As we understand more about the mind-body connection, the importance of staying active becomes increasingly clear. Exercise is medicine for both body and soul.",
    "The ocean depths hold countless mysteries waiting to be discovered. Marine scientists continue to find new species and phenomena in the vast underwater world. From bioluminescent creatures in the deepest trenches to complex coral reef ecosystems, the ocean's biodiversity amazes and inspires us. Protecting these aquatic environments is crucial for Earth's future.",
    "Democracy relies on informed and engaged citizens participating in the political process. Understanding complex issues, evaluating different perspectives, and making reasoned decisions are essential skills in a functioning democratic society. Civil discourse and respect for diverse viewpoints help strengthen democratic institutions.",
    "Artificial intelligence is revolutionizing fields from healthcare to transportation. Machine learning algorithms can analyze vast amounts of data to identify patterns and make predictions. As AI systems become more sophisticated, questions about ethics, privacy, and the future of human work become increasingly important. Balancing innovation with responsibility is crucial.",
    "The art of photography captures moments in time, preserving memories and telling stories through visual imagery. Digital technology has transformed how we take and share photos, making photography more accessible than ever. Yet the fundamental principles of composition, lighting, and timing remain essential for creating compelling images.",
    "Climate change presents one of the greatest challenges facing our generation. Rising temperatures, extreme weather events, and shifting ecosystems affect communities worldwide. Addressing this global issue requires international cooperation, technological innovation, and individual action. The choices we make today will shape the planet's future."
];

// State variables
let currentParagraph = "";
let timer = 60;
let timerInterval = null;
let isTyping = false;
let startTime;
let errorPositions = new Set();
let permanentErrors = new Set();
let totalKeystrokes = 0;
let correctKeystrokes = 0;

// Audio elements
const countdownSound = new Audio('countdown.mp3');
const endSound = new Audio('end.mp3');

// DOM elements
const quoteElement = document.getElementById("quote");
const inputElement = document.getElementById("input");
const timerElement = document.getElementById("timer");
const wpmElement = document.getElementById("wpm");
const cpmElement = document.getElementById("cpm");
const accuracyElement = document.getElementById("accuracy");
const errorsElement = document.getElementById("errors");
const startButton = document.getElementById("start");
const resetButton = document.getElementById("reset");

// Add modal HTML
const modalHTML = `
<div id="resultsModal" class="modal">
    <div class="modal-content">
        <h2>Test Results</h2>
        <div class="results-grid">
            <div class="result-item">
                <h3>WPM</h3>
                <p id="modalWpm">0</p>
            </div>
            <div class="result-item">
                <h3>CPM</h3>
                <p id="modalCpm">0</p>
            </div>
            <div class="result-item">
                <h3>Accuracy</h3>
                <p id="modalAccuracy">0%</p>
            </div>
            <div class="result-item">
                <h3>Errors</h3>
                <p id="modalErrors">0</p>
            </div>
        </div>
        <button id="closeModal" class="close-button">Close</button>
        <button id="retryTest" class="retry-button">Try Again</button>
    </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

// Get modal elements
const modal = document.getElementById("resultsModal");
const closeModal = document.getElementById("closeModal");
const retryTest = document.getElementById("retryTest");

// Functions
function getRandomParagraph() {
    return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}

function displayParagraph() {
    currentParagraph = getRandomParagraph();
    quoteElement.innerHTML = currentParagraph.split('').map(char => 
        `<span>${char}</span>`
    ).join('');
}

function startCountdown() {
    let count = 5;
    startButton.disabled = true;
    
    const countdownInterval = setInterval(() => {
        if (count > 0) {
            countdownSound.play();
            quoteElement.innerHTML = `<h1>${count}</h1>`;
            count--;
        } else {
            clearInterval(countdownInterval);
            startTest();
        }
    }, 1000);
}

function startTest() {
    isTyping = true;
    inputElement.disabled = false;
    inputElement.value = "";
    inputElement.focus();
    displayParagraph();
    startTime = new Date().getTime();
    errorPositions.clear();
    permanentErrors.clear();
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    
    timer = 60;
    timerInterval = setInterval(() => {
        timer--;
        timerElement.textContent = timer;
        
        if (timer <= 0) {
            endTest();
        }
    }, 1000);
}

function endTest() {
    isTyping = false;
    clearInterval(timerInterval);
    inputElement.disabled = true;
    startButton.disabled = false;
    endSound.play();
    calculateStats();
    showResults();
}

function resetTest() {
    clearInterval(timerInterval);
    isTyping = false;
    timer = 60;
    errorPositions.clear();
    permanentErrors.clear();
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    
    timerElement.textContent = timer;
    wpmElement.textContent = "0";
    cpmElement.textContent = "0";
    accuracyElement.textContent = "0";
    errorsElement.textContent = "0";
    
    inputElement.value = "";
    inputElement.disabled = true;
    startButton.disabled = false;
    quoteElement.innerHTML = "";
    displayParagraph();
}

function calculateStats() {
    const timeElapsed = Math.max(1, 60 - timer) / 60; // in minutes
    
    // Calculate WPM
    const typedCharacters = inputElement.value.length;
    const standardWordLength = 5;
    const grossWPM = Math.round((typedCharacters / standardWordLength) / timeElapsed);
    
    // Calculate CPM
    const cpm = Math.round(typedCharacters / timeElapsed);
    
    // Calculate accuracy
    const accuracy = totalKeystrokes > 0 ? Math.round((correctKeystrokes / totalKeystrokes) * 100) : 0;
    
    // Calculate net WPM
    const errors = permanentErrors.size;
    const netWPM = Math.max(0, Math.round(grossWPM - (errors / timeElapsed)));

    // Update display
    wpmElement.textContent = netWPM;
    cpmElement.textContent = cpm;
    accuracyElement.textContent = accuracy;
    errorsElement.textContent = errors;
}

function showResults() {
    document.getElementById("modalWpm").textContent = wpmElement.textContent;
    document.getElementById("modalCpm").textContent = cpmElement.textContent;
    document.getElementById("modalAccuracy").textContent = accuracyElement.textContent + "%";
    document.getElementById("modalErrors").textContent = errorsElement.textContent;
    modal.style.display = "flex";
}

// Event Listeners
inputElement.addEventListener("input", (e) => {
    if (!isTyping) return;

    const inputValue = inputElement.value;
    const quoteSpans = quoteElement.querySelectorAll("span");
    
    if (e.inputType === "deleteContentBackward") {
        // Don't increment totalKeystrokes for backspace
    } else {
        totalKeystrokes++;
        const currentPosition = inputValue.length - 1;
        if (currentPosition >= 0 && currentPosition < currentParagraph.length) {
            if (inputValue[currentPosition] === currentParagraph[currentPosition]) {
                correctKeystrokes++;
                if (!permanentErrors.has(currentPosition)) {
                    errorPositions.delete(currentPosition);
                }
            } else {
                errorPositions.add(currentPosition);
                permanentErrors.add(currentPosition);
            }
        }
    }

    // Update display
    quoteSpans.forEach((span, index) => {
        const char = inputValue[index];
        span.classList.remove("correct", "incorrect", "corrected", "current");
        
        if (char) {
            if (char === span.innerText) {
                if (permanentErrors.has(index)) {
                    span.classList.add("corrected");
                } else {
                    span.classList.add("correct");
                }
            } else {
                span.classList.add("incorrect");
            }
        } else if (index === inputValue.length) {
            span.classList.add("current");
        }
    });

    calculateStats();
});

startButton.addEventListener("click", startCountdown);
resetButton.addEventListener("click", resetTest);
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});
retryTest.addEventListener("click", () => {
    modal.style.display = "none";
    resetTest();
    startCountdown();
});
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Add styles
const style = document.createElement('style');
style.textContent = `
    .correct { color: #2ecc71; }
    .incorrect { color: #e74c3c; }
    .corrected { color: #f1c40f; }
    .current { 
        background-color: #bdc3c7;
        border-radius: 2px;
    }

    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        text-align: center;
        max-width: 500px;
        width: 90%;
    }

    .results-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
        margin: 2rem 0;
    }

    .result-item {
        padding: 1rem;
        border-radius: 8px;
        background-color: #f8f9fa;
    }

    .result-item h3 {
        color: #666;
        margin: 0 0 0.5rem 0;
        font-size: 1rem;
    }

    .result-item p {
        color: #2c3e50;
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
    }

    .close-button, .retry-button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        margin: 0 0.5rem;
        transition: background-color 0.2s;
    }

    .close-button {
        background-color: #e74c3c;
        color: white;
    }

    .retry-button {
        background-color: #2ecc71;
        color: white;
    }

    .close-button:hover {
        background-color: #c0392b;
    }

    .retry-button:hover {
        background-color: #27ae60;
    }

    .modal-content h2 {
        color: #2c3e50;
        margin: 0 0 1rem 0;
    }
`;
document.head.appendChild(style);

// Initial setup
displayParagraph();