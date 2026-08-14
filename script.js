const degreeElement = document.getElementById('degreeDisplay');
let currentDegree = 30;

function changeDegree() {

    const newDegree = Math.floor(Math.random() * 101);
    
    degreeElement.style.transition = 'all 0.3s ease';
    degreeElement.textContent = newDegree;
}

setInterval(changeDegree, 100);




function updateDateTime() {

    const now = new Date();
    
    const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    
    const day = String(moscowTime.getDate()).padStart(2, '0');
    const month = String(moscowTime.getMonth() + 1).padStart(2, '0');
    const year = moscowTime.getFullYear();
    const dateString = `${day}.${month}.${year}`;
    
    const hours = String(moscowTime.getHours()).padStart(2, '0');
    const minutes = String(moscowTime.getMinutes()).padStart(2, '0');
    const seconds = String(moscowTime.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    document.getElementById('text').innerHTML = `<p>[ date: ${dateString} ]</p>`;
    document.getElementById('text2').innerHTML = `<p>[ time: ${timeString} MSK ]</p>`;
}

updateDateTime();

setInterval(updateDateTime, 1000);





// ========== МЕДУЗА ==========

document.addEventListener('DOMContentLoaded', function() {

const container = document.getElementById('jellyfish-container');
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 6; // ← Отодвинул камеру, чтобы медуза поместилась

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);


const jellyfishGroup = new THREE.Group();


jellyfishGroup.scale.set(2, 2, 2); // ← Увеличение в 2 раза

// Купол
const domeGeometry = new THREE.SphereGeometry(1.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
const domeMaterial = new THREE.MeshPhongMaterial({
    color: 0xff69b4,
    emissive: 0xff1493,
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.85,
    shininess: 100,
    side: THREE.DoubleSide,
});
const dome = new THREE.Mesh(domeGeometry, domeMaterial);
dome.scale.y = 0.5;
dome.position.y = 0.5;
jellyfishGroup.add(dome);

// Свечение
const glowGeometry = new THREE.SphereGeometry(0.8, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
const glowMaterial = new THREE.MeshPhongMaterial({
    color: 0xff69b4,
    emissive: 0xff1493,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
});
const glow = new THREE.Mesh(glowGeometry, glowMaterial);
glow.scale.y = 0.3;
glow.position.y = 0.4;
jellyfishGroup.add(glow);

// Щупальца
const tentacleCount = 30;
const tentacles = [];
for (let i = 0; i < tentacleCount; i++) {
    const points = [];
    const angle = (i / tentacleCount) * Math.PI * 2;
    const radius = 1.0 + Math.random() * 0.3;
    const length = 1.5 + Math.random() * 1.0;
    const segments = 20;
    for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const x = radius * Math.cos(angle) * (1 - t * 0.3);
        const z = radius * Math.sin(angle) * (1 - t * 0.3);
        const y = -t * length + 0.3;
        points.push(new THREE.Vector3(x, y, z));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: new THREE.Color().setHSL(0.9 + Math.random() * 0.1, 0.8, 0.6),
        transparent: true,
        opacity: 0.6 + Math.random() * 0.3,
    });
    const tentacle = new THREE.Line(geometry, material);
    tentacle.userData = {
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
        amplitude: 0.1 + Math.random() * 0.15,
        length: length,
        radius: radius,
        angle: angle,
        segments: segments,
    };
    jellyfishGroup.add(tentacle);
    tentacles.push(tentacle);
}

// Свет
const light = new THREE.PointLight(0xff69b4, 1, 10);
light.position.set(0, 2, 2);
jellyfishGroup.add(light);
scene.add(new THREE.AmbientLight(0x404060));
const backLight = new THREE.DirectionalLight(0x4488ff, 0.5);
backLight.position.set(-2, 1, -3);
scene.add(backLight);


let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

function animateJellyfish(time) {
    targetX += (mouseX * 0.3 - targetX) * 0.02;
    targetY += (mouseY * 0.3 - targetY) * 0.02;
    const floatY = Math.sin(time * 0.8) * 0.15;
    jellyfishGroup.position.y = floatY + targetY * 0.2;
    
    
    
    const breathe = 1 + Math.sin(time * 1.2) * 0.03;
    dome.scale.x = breathe;
    dome.scale.z = breathe;
    tentacles.forEach((tentacle) => {
        const data = tentacle.userData;
        const positions = tentacle.geometry.attributes.position.array;
        const timeOffset = time * data.speed + data.phase;
        for (let j = 0; j <= data.segments; j++) {
            const t = j / data.segments;
            const wave = Math.sin(timeOffset + t * 4) * data.amplitude * (1 - t * 0.5);
            const wave2 = Math.cos(timeOffset * 0.7 + t * 3) * data.amplitude * 0.5 * (1 - t * 0.5);
            const idx = j * 3;
            const baseX = data.radius * Math.cos(data.angle) * (1 - t * 0.3);
            const baseZ = data.radius * Math.sin(data.angle) * (1 - t * 0.3);
            positions[idx] = baseX + Math.cos(data.angle + Math.PI / 2) * wave + Math.sin(data.angle) * wave2;
            positions[idx + 1] = -t * data.length + 0.3 + Math.sin(timeOffset + t * 2) * 0.05;
            positions[idx + 2] = baseZ + Math.sin(data.angle + Math.PI / 2) * wave - Math.cos(data.angle) * wave2;
        }
        tentacle.geometry.attributes.position.needsUpdate = true;
    });
}

scene.add(jellyfishGroup);



let isDragging = false;
let prevMouse = { x: 0, y: 0 };

document.addEventListener('mousedown', (e) => {
    if (e.target.closest('#jellyfish-container canvas')) {
        isDragging = true;
        prevMouse.x = e.clientX;
        prevMouse.y = e.clientY;
        document.querySelector('#jellyfish-container canvas').style.cursor = 'grabbing';
    }
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouse.x;
    const deltaY = e.clientY - prevMouse.y;
    jellyfishGroup.rotation.y += deltaX * 0.01;
    jellyfishGroup.rotation.x += deltaY * 0.01;
    prevMouse.x = e.clientX;
    prevMouse.y = e.clientY;
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        const canvas = document.querySelector('#jellyfish-container canvas');
        if (canvas) canvas.style.cursor = 'grab';
    }
});


document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    if (e.target.closest('#jellyfish-container canvas')) {
        isDragging = true;
        prevMouse.x = touch.clientX;
        prevMouse.y = touch.clientY;
    }
});

document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - prevMouse.x;
    const deltaY = touch.clientY - prevMouse.y;
    jellyfishGroup.rotation.y += deltaX * 0.01;
    jellyfishGroup.rotation.x += deltaY * 0.01;
    prevMouse.x = touch.clientX;
    prevMouse.y = touch.clientY;
});

document.addEventListener('touchend', () => {
    isDragging = false;
});



function animate(time) {
    requestAnimationFrame(animate);
    animateJellyfish(time * 0.001);
    renderer.render(scene, camera);
}
animate(0);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



}); 