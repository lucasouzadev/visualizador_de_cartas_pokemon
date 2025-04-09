// Configuração da cena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(document.getElementById('card-container').clientWidth, document.getElementById('card-container').clientHeight);
document.getElementById('card-container').appendChild(renderer.domElement);

// Variáveis globais
let card;
let currentPokemonId = 25;
let isRotating = false;
let rotationSpeed = 0.02;
let isHovering = false;
let targetRotation = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };

// Função para criar a carta
function createCard(texture) {
    const cardGeometry = new THREE.PlaneGeometry(3, 4);
    const cardMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        specular: 0x050505,
        shininess: 100,
        side: THREE.DoubleSide,
        emissive: 0x111111,
        emissiveIntensity: 0.2
    });
    
    if (card) {
        scene.remove(card);
    }
    
    card = new THREE.Mesh(cardGeometry, cardMaterial);
    scene.add(card);
}

// Função para carregar Pokémon
async function loadPokemon(id) {
    try {
        // Formatar o ID para o formato correto (ex: 001, 025, etc)
        const formattedId = id.toString().padStart(3, '0');
        
        // Carregar textura da carta
        const textureLoader = new THREE.TextureLoader();
        const cardTexture = textureLoader.load(`https://raw.githubusercontent.com/chase-manning/pokemon-tcg-pocket-cards/main/images/a1-${formattedId}.png`);
        cardTexture.minFilter = THREE.LinearFilter;
        cardTexture.magFilter = THREE.LinearFilter;
        
        createCard(cardTexture);
        
        // Efeito de brilho ao trocar
        card.material.emissiveIntensity = 1;
        setTimeout(() => {
            card.material.emissiveIntensity = 0.2;
        }, 500);
        
    } catch (error) {
        console.error('Erro ao carregar Pokémon:', error);
    }
}

// Adicionar iluminação
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Posicionar a câmera
camera.position.z = 5;

// Event Listeners
document.getElementById('rotate-left').addEventListener('click', () => {
    isRotating = true;
    rotationSpeed = 0.02;
});

document.getElementById('rotate-right').addEventListener('click', () => {
    isRotating = true;
    rotationSpeed = -0.02;
});

document.getElementById('stop-rotation').addEventListener('click', () => {
    isRotating = false;
});

document.getElementById('change-pokemon').addEventListener('click', () => {
    const newId = parseInt(document.getElementById('pokemon-id').value);
    if (newId >= 1 && newId <= 151) {
        currentPokemonId = newId;
        loadPokemon(currentPokemonId);
    }
});

// Controles de mouse
const cardContainer = document.getElementById('card-container');

cardContainer.addEventListener('mousemove', (event) => {
    if (!isRotating) {
        const rect = cardContainer.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        targetRotation.y = x * 0.3;
        targetRotation.x = y * 0.3;
    }
});

cardContainer.addEventListener('mouseleave', () => {
    if (!isRotating) {
        targetRotation.x = 0;
        targetRotation.y = 0;
    }
});

// Função de animação
function animate() {
    requestAnimationFrame(animate);

    if (isRotating && card) {
        card.rotation.y += rotationSpeed;
    } else if (card) {
        // Suavizar a rotação ao passar o mouse
        currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
        currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;
        
        card.rotation.x = currentRotation.x;
        card.rotation.y = currentRotation.y;
    }

    renderer.render(scene, camera);
}

// Ajustar tamanho da janela
window.addEventListener('resize', () => {
    const container = document.getElementById('card-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Carregar Pokémon inicial
loadPokemon(currentPokemonId);

// Iniciar animação
animate(); 