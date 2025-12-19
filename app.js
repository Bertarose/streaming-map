// Radio stations data - fictitious for now
const radioStations = [
    { name: "Neon Tokyo FM", lat: 35.6762, lng: 139.6503, genre: "Vaporwave • Synthwave", city: "Tokyo", country: "Japan", url: "https://example.com/stream1" },
    { name: "Cyberpunk Berlin", lat: 52.5200, lng: 13.4050, genre: "Techno • Industrial", city: "Berlin", country: "Germany", url: "https://example.com/stream2" },
    { name: "Still.fm", lat: 45.5017, lng: -73.5673, genre: "Underground • Experimental • Community", city: "Montreal", country: "Canada", url: "https://still.fm" },
    { name: "Dark Web Radio", lat: 51.5074, lng: -0.1278, genre: "Darkwave • EBM", city: "London", country: "UK", url: "https://example.com/stream4" },
    { name: "Glitch São Paulo", lat: -23.5505, lng: -46.6333, genre: "Glitch • Breakcore", city: "São Paulo", country: "Brazil", url: "https://example.com/stream5" },
    { name: "Terminal NYC", lat: 40.7128, lng: -74.0060, genre: "Industrial • Noise", city: "New York", country: "USA", url: "https://example.com/stream6" },
    { name: "Quantum Moscow", lat: 55.7558, lng: 37.6173, genre: "Post-Soviet Wave", city: "Moscow", country: "Russia", url: "https://example.com/stream7" },
    { name: "Hologram Seoul", lat: 37.5665, lng: 126.9780, genre: "K-Underground", city: "Seoul", country: "South Korea", url: "https://example.com/stream8" },
    { name: "Ether Cape Town", lat: -33.9249, lng: 18.4241, genre: "Afro-Futurism", city: "Cape Town", country: "South Africa", url: "https://example.com/stream9" },
    { name: "Circuit Melbourne", lat: -37.8136, lng: 144.9631, genre: "Electro • IDM", city: "Melbourne", country: "Australia", url: "https://example.com/stream10" },
    { name: "Ghost Station Reykjavik", lat: 64.1466, lng: -21.9426, genre: "Ambient • Drone", city: "Reykjavik", country: "Iceland", url: "https://example.com/stream11" },
    { name: "Frequency Mexico City", lat: 19.4326, lng: -99.1332, genre: "Cumbia Digital", city: "Mexico City", country: "Mexico", url: "https://example.com/stream12" },
    { name: "Pixel Amsterdam", lat: 52.3676, lng: 4.9041, genre: "Minimal • Deep House", city: "Amsterdam", country: "Netherlands", url: "https://example.com/stream13" },
    { name: "Void Bangkok", lat: 13.7563, lng: 100.5018, genre: "Bass • Dubstep", city: "Bangkok", country: "Thailand", url: "https://example.com/stream14" },
    { name: "Synapse Istanbul", lat: 41.0082, lng: 28.9784, genre: "Psychedelic Trance", city: "Istanbul", country: "Turkey", url: "https://example.com/stream15" }
];

// Three.js setup
let scene, camera, renderer, globe, markers = [], autoRotate = true, wireframeMode = false;
let currentStation = null;

// Initialize
function init() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 50);

    // Camera - adjust position based on screen size
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Center the globe
    camera.position.set(0, 0, 12);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.getElementById('container').appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x00ffff, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00ff00, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 0.8, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Create globe
    createGlobe();

    // Add radio stations
    addRadioStations();

    // Add stars background
    createStarField();

    // Mouse controls
    setupControls();

    // Update station count
    document.getElementById('station-count').textContent = radioStations.length;

    // Hide loading
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 1000);

    // Animation loop
    animate();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function createGlobe() {
    // Base globe geometry
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    
    // Wireframe material with neon effect
    const material = new THREE.MeshPhongMaterial({
        color: 0x001a1a,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
        emissive: 0x00ffff,
        emissiveIntensity: 0.2
    });

    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Load real Earth texture with continent outlines
    const textureLoader = new THREE.TextureLoader();
    
    // Using a public domain Earth map
    textureLoader.load(
        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
        function(texture) {
            // Create a canvas to process the texture into cyan outlines
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            
            // Create temporary image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = function() {
                // Draw image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Convert to cyan outlines (edge detection style)
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Calculate brightness
                    const brightness = (r + g + b) / 3;
                    
                    // Land is brighter, water is darker
                    if (brightness > 50) {
                        // Land - make it cyan outline
                        data[i] = 0;      // R
                        data[i + 1] = 255; // G
                        data[i + 2] = 255; // B
                        data[i + 3] = 150; // A
                    } else {
                        // Water - make it transparent dark
                        data[i] = 0;
                        data[i + 1] = 26;
                        data[i + 2] = 26;
                        data[i + 3] = 255;
                    }
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                // Create texture from processed canvas
                const processedTexture = new THREE.CanvasTexture(canvas);
                processedTexture.needsUpdate = true;
                
                // Add continent layer
                const continentGeometry = new THREE.SphereGeometry(5.02, 64, 64);
                const continentMaterial = new THREE.MeshBasicMaterial({
                    map: processedTexture,
                    transparent: true,
                    opacity: 0.7
                });
                const continentMesh = new THREE.Mesh(continentGeometry, continentMaterial);
                globe.add(continentMesh);
            };
            img.src = 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
        },
        undefined,
        function(error) {
            console.error('Error loading Earth texture:', error);
            // Fallback to simple style if texture fails to load
            addSimpleContinents();
        }
    );

    // Add grid lines for additional effect
    const gridHelper = new THREE.SphereGeometry(5.01, 24, 24);
    const gridMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.1
    });
    const gridMesh = new THREE.Mesh(gridHelper, gridMaterial);
    globe.add(gridMesh);

    // Add glow
    const glowGeometry = new THREE.SphereGeometry(5.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(glow);
}

// Fallback function for simple continents if texture loading fails
function addSimpleContinents() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Dark blue background
    ctx.fillStyle = '#001a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw simplified continent outlines in cyan
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;
    
    // North America
    ctx.beginPath();
    ctx.moveTo(200, 300);
    ctx.lineTo(250, 250);
    ctx.lineTo(350, 200);
    ctx.lineTo(450, 250);
    ctx.lineTo(500, 350);
    ctx.lineTo(450, 450);
    ctx.lineTo(350, 500);
    ctx.lineTo(250, 450);
    ctx.lineTo(200, 350);
    ctx.closePath();
    ctx.stroke();
    
    // South America
    ctx.beginPath();
    ctx.moveTo(450, 550);
    ctx.lineTo(500, 500);
    ctx.lineTo(550, 550);
    ctx.lineTo(550, 650);
    ctx.lineTo(500, 750);
    ctx.lineTo(450, 700);
    ctx.lineTo(430, 600);
    ctx.closePath();
    ctx.stroke();
    
    // Europe
    ctx.beginPath();
    ctx.moveTo(950, 250);
    ctx.lineTo(1050, 200);
    ctx.lineTo(1100, 250);
    ctx.lineTo(1050, 350);
    ctx.lineTo(950, 320);
    ctx.closePath();
    ctx.stroke();
    
    // Africa
    ctx.beginPath();
    ctx.moveTo(1000, 400);
    ctx.lineTo(1100, 380);
    ctx.lineTo(1150, 450);
    ctx.lineTo(1150, 600);
    ctx.lineTo(1100, 700);
    ctx.lineTo(1000, 650);
    ctx.lineTo(950, 550);
    ctx.lineTo(980, 450);
    ctx.closePath();
    ctx.stroke();
    
    // Asia
    ctx.beginPath();
    ctx.moveTo(1200, 200);
    ctx.lineTo(1400, 150);
    ctx.lineTo(1600, 200);
    ctx.lineTo(1700, 300);
    ctx.lineTo(1650, 400);
    ctx.lineTo(1500, 450);
    ctx.lineTo(1350, 400);
    ctx.lineTo(1200, 350);
    ctx.lineTo(1150, 250);
    ctx.closePath();
    ctx.stroke();
    
    // Australia
    ctx.beginPath();
    ctx.moveTo(1550, 650);
    ctx.lineTo(1650, 630);
    ctx.lineTo(1700, 700);
    ctx.lineTo(1650, 750);
    ctx.lineTo(1550, 730);
    ctx.closePath();
    ctx.stroke();
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    const continentGeometry = new THREE.SphereGeometry(5.02, 64, 64);
    const continentMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.8
    });
    const continentMesh = new THREE.Mesh(continentGeometry, continentMaterial);
    globe.add(continentMesh);
}

function addRadioStations() {
    radioStations.forEach((station, index) => {
        // Convert lat/lng to 3D coordinates
        const phi = (90 - station.lat) * (Math.PI / 180);
        const theta = (station.lng + 180) * (Math.PI / 180);
        
        const x = -5.1 * Math.sin(phi) * Math.cos(theta);
        const y = 5.1 * Math.cos(phi);
        const z = 5.1 * Math.sin(phi) * Math.sin(theta);

        // Create marker
        const markerGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.9
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(x, y, z);
        marker.userData = { station: station, index: index };
        
        globe.add(marker);
        markers.push(marker);

        // Add pulsing ring
        const ringGeometry = new THREE.RingGeometry(0.15, 0.2, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(x, y, z);
        ring.lookAt(0, 0, 0);
        globe.add(ring);

        // Animate ring
        ring.userData.animate = true;
        ring.userData.time = Math.random() * Math.PI * 2;

        // Add light beam
        const beamGeometry = new THREE.CylinderGeometry(0.02, 0.02, 2, 8);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.4
        });
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(x, y, z);
        beam.lookAt(x * 2, y * 2, z * 2);
        beam.rotateX(Math.PI / 2);
        globe.add(beam);
    });
}

function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];

    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 100;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0x00ffff,
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

// Mouse controls
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

function setupControls() {
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onMouseWheel);
    renderer.domElement.addEventListener('click', onMouseClick);
}

function onMouseDown(e) {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onMouseMove(e) {
    if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        globe.rotation.y += deltaX * 0.005;
        globe.rotation.x += deltaY * 0.005;

        previousMousePosition = { x: e.clientX, y: e.clientY };
    }
}

function onMouseUp() {
    isDragging = false;
}

function onMouseWheel(e) {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.01;
    camera.position.z = Math.max(8, Math.min(20, camera.position.z));
}

function onMouseClick(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);

    if (intersects.length > 0) {
        const station = intersects[0].object.userData.station;
        showStationInfo(station);
    }
}

function showStationInfo(station) {
    currentStation = station;
    document.getElementById('station-name').textContent = station.name;
    document.getElementById('station-location').textContent = `📍 ${station.city}, ${station.country}`;
    document.getElementById('station-genre').textContent = `🎵 ${station.genre}`;
    document.getElementById('station-info').style.display = 'block';
}

function closeStationInfo() {
    document.getElementById('station-info').style.display = 'none';
    currentStation = null;
}

function playStation() {
    if (currentStation) {
        alert(`🎧 Connecting to: ${currentStation.name}\n\n[Stream URL: ${currentStation.url}]\n\nNote: Replace with actual audio player implementation`);
    }
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
}

function resetView() {
    globe.rotation.x = 0;
    globe.rotation.y = 0;
    camera.position.set(0, 0, 12);
}

function toggleWireframe() {
    wireframeMode = !wireframeMode;
    globe.material.opacity = wireframeMode ? 0.5 : 0.3;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Keep globe centered
    camera.position.set(0, 0, 12);
}

// Animation
function animate() {
    requestAnimationFrame(animate);

    // Auto rotate
    if (autoRotate && !isDragging) {
        globe.rotation.y += 0.001;
    }

    // Animate markers
    globe.children.forEach(child => {
        if (child.userData.animate) {
            child.userData.time += 0.05;
            child.material.opacity = 0.3 + Math.sin(child.userData.time) * 0.3;
            child.scale.set(1 + Math.sin(child.userData.time) * 0.2, 1 + Math.sin(child.userData.time) * 0.2, 1);
        }
    });

    renderer.render(scene, camera);
}

// Start
init();
