let scene, camera, renderer, mixer, model, clock;
let currentAction;
const actions = {};
let idleTimeout;
let userInteracted = false;
let speakToggle = true;

// Variables for mouse drag rotation
let isMouseDown = false;
let previousMouseX = 0;
let previousMouseY = 0;
let rotationSpeed = 0.005; // Rotation speed for mouse movement
let rotationY = 0.2; // Initial rotation value on Y-axis
let rotationX = 0; // Initial rotation value on X-axis
let rotationTargetY = rotationY; // Target for smooth return
let rotationTargetX = rotationX; // Target for smooth return
let returnTimeout; // Timer to trigger the model returning to normal

scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 5;

clock = new THREE.Clock();

renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(600, 600);
document.getElementById('chatbot-model').appendChild(renderer.domElement);
const chatBotContainer = document.getElementById("chatbot-container");

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const loader = new THREE.GLTFLoader();
loader.load('/models/chatbot.glb', function (gltf) {
    model = gltf.scene;
    model.scale.set(2.5, 2.5, 2.5);
    model.position.set(-0.5, -3, 0);
    model.rotation.y = rotationY; // Initial model rotation
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        actions[clip.name.toLowerCase()] = action;
    });


    waveTwiceThenPose();
    

    document.getElementById('chatbot-model').addEventListener('click', () => {
        userInteracted = true;
        
    });

    
});

function startChat() {
    chatBotContainer.style.display = "block"; // Show the chat panel
}


function playAnimation(name, loop = true) {
    if (!actions[name]) return;
    if (currentAction) currentAction.fadeOut(0.3);

    currentAction = actions[name];
    currentAction.reset();
    currentAction.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
    currentAction.clampWhenFinished = !loop;
    currentAction.fadeIn(0.3).play();
}

function waveTwiceThenPose() {
    // Step 1: Play "fly" (non-looping)
    playAnimation("fly", false);

    // Step 2: After "fly" finishes, play "wave" (non-looping)
    setTimeout(() => {
        playAnimation("wave", false);
     
        
    mixer.addEventListener('finished', function handler(e) {
        if (e.action === actions["wave"]) {
            mixer.removeEventListener('finished', handler);
            document.getElementById('message').style.display = "block";
            playAnimation("pose", true);
        }
    });
        

    }, actions["fly"].getClip().duration * 1000);
    
};



// Mouse drag handling for rotation
document.getElementById('chatbot-model').addEventListener('mousedown', (event) => {
    isMouseDown = true;
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;

    // Clear the return timer when mouse is down to prevent auto-return
    clearTimeout(returnTimeout);
});

document.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;

    // Calculate the difference in mouse movement
    const deltaX = event.clientX - previousMouseX;
    const deltaY = event.clientY - previousMouseY;

    // Update model rotation based on mouse movement
    rotationY += deltaX * rotationSpeed;// Only track vertical mouse movement
    model.rotation.y = rotationY;// Prevent excessive vertical rotation

    // Update previous mouse position for next movement
    previousMouseX = event.clientX;
    previousMouseY = event.clientY;

    // Reset the return timer as mouse is moving
    clearTimeout(returnTimeout);
    returnTimeout = setTimeout(() => {
        // Smoothly return to the original rotation over 3 seconds
        returnToNormalRotation();
    }, 3000); // 3 seconds of inactivity before auto-return
});

document.addEventListener('mouseup', () => {
    isMouseDown = false;
});

// Function to smoothly return the model to its initial rotation
function returnToNormalRotation() {
    const duration = 3; // Seconds to return to normal
    const startY = model.rotation.y;
    const startX = model.rotation.x;

    const endY = rotationTargetY;
    const endX = rotationTargetX;

    let startTime = Date.now();

    function smoothReturn() {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsedTime / duration, 1);

        // Calculate smooth transition between start and end
        model.rotation.y = startY + (endY - startY) * progress;
        model.rotation.x = startX + (endX - startX) * progress;

        if (progress < 1) {
            requestAnimationFrame(smoothReturn);
        }
    }

    smoothReturn();
}

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
}

animate();

// Intercept response from chatbot and trigger speak animation
const originalAppendMessage = appendMessage;
window.appendMessage = function (sender, message) {
    originalAppendMessage(sender, message);
    if (sender === "Bot") {
        const speakAnim = speakToggle ? "talk" : "talk";
        speakToggle = !speakToggle;

        playAnimation(speakAnim, true);

        const estimatedDuration = Math.max(2000, message.length * 30);
        setTimeout(() => {
            playAnimation("pose", true);
        }, estimatedDuration);
    }
};

//chatbot

const chatMessages = document.getElementById("chat-messages");
const userMessageInput = document.getElementById("user-message");
const sendMessageBtn = document.getElementById("send-message");
const chatContainer = document.getElementById('chat-window');
//const chatBotContainer = document.getElementById("chatbot-container");

function appendMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

sendMessageBtn.addEventListener("click", () => {
    const userMessage = userMessageInput.value.trim();
    if (!userMessage) return;

    appendMessage("You", userMessage);
    userMessageInput.value = "";
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Send the user message to the backend chatbot API
    fetch("http://tguideapp.pythonanywhere.com/chatbot/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.response) {
                appendMessage("Bot", data.response);
                playAnimation("speak2", true);
                
            } else if (data.error) {
                appendMessage("Bot", `Error: ${data.error}`);
            }
        })
        .catch(() => {
            appendMessage("Bot", "Error connecting to the server.");
        });
        chatContainer.scrollTop = chatContainer.scrollHeight;
});

window.closeChat = function() {
    chatBotContainer.style.display = "none";
};

window.startChat = function() {
    chatBotContainer.style.display = "block";
    document.getElementById('message').style.display= "none";
};



