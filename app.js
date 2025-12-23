// Données des stations (Mise à jour avec GIF et Mixcloud)
const radioStations = [
    { 
        name: "Neon Tokyo FM", 
        lat: 35.6762, lng: 139.6503, 
        genre: "Vaporwave • Synthwave", 
        city: "Tokyo", country: "Japan", 
        gif: "Berta Rose.gif", 
        mixcloud: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2Fspartacus%2F" 
    },
    { 
        name: "Cyberpunk Berlin", 
        lat: 52.5200, lng: 13.4050, 
        genre: "Techno • Industrial", 
        city: "Berlin", country: "Germany", 
        gif: "Berta Rose.gif", 
        mixcloud: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2FBerlinCommunityRadio%2F" 
    },
    { 
        name: "Still.fm", 
        lat: 45.5017, lng: -73.5673, 
        genre: "Underground • Experimental", 
        city: "Montreal", country: "Canada", 
        gif: "Berta Rose.gif", 
        mixcloud: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2Fn10as%2F" 
    },
    { 
        name: "Dark Web Radio", 
        lat: 51.5074, lng: -0.1278, 
        genre: "Darkwave • EBM", 
        city: "London", country: "UK", 
        gif: "Berta Rose.gif", 
        mixcloud: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2FNTS%2F" 
    },
    { 
        name: "Glitch São Paulo", 
        lat: -23.5505, lng: -46.6333, 
        genre: "Glitch • Breakcore", 
        city: "São Paulo", country: "Brazil", 
        gif: "Berta Rose.gif", 
        mixcloud: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2FMambaNegra%2F" 
    },
    { 
        name: "Terminal NYC", 
        lat: 40.7128, lng: -74.0060, 
        genre: "Industrial • Noise", 
        city: "New York", country: "USA", 
        gif: "Berta Rose.gif", 
        mixcloud: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2FTheLotRadio%2F" 
    },
    { 
        name: "Frequency Mexico", 
        lat: 19.4326, lng: -99.1332, 
        genre: "Cumbia Digital", 
        city: "Mexico City", country: "Mexico", 
        gif: "Berta Rose.gif", 
        mixcloud: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2Fairon%2F" 
    },
    { 
        name: "Void Bangkok", 
        lat: 13.7563, lng: 100.5018, 
        genre: "Bass • Dubstep", 
        city: "Bangkok", country: "Thailand", 
        gif: "Berta Rose.gif", 
        mixcloud: "https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2FBangkokCommunityRadio%2F" 
    }
];

// Variables Globales
let scene, camera, renderer, globeGroup, composer;
let markers = [];
let connectionLines = [];
let autoRotate = true;
let isFlatView = false;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let hoveredStation = null;
let isInitialized = false;
let clock = new THREE.Clock();

// Initialisation
function init() {
    // 1. Scène
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 20, 80);

    // 2. Caméra
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 25);

    // 3. Renderer avec antialiasing amélioré
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    document.getElementById('container').appendChild(renderer.domElement);

    // 4. Groupe Globe
    globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 5. Lumières minimalistes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.5);
    keyLight.position.set(10, 10, 10);
    scene.add(keyLight);

    // 6. Création des objets
    createMinimalistGlobe();
    createGeometricStarField();
    createMarkers();
    createConnectionLines();

    // 7. Events
    setupControls();
    window.addEventListener('resize', onWindowResize);
    document.getElementById('station-count').textContent = radioStations.length;

    // Animation d'entrée
    gsap.from(camera.position, {
        z: 50,
        duration: 2.5,
        ease: "power2.out"
    });

    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        isInitialized = true;
    }, 800);

    animate();
}

function createMinimalistGlobe() {
    // Globe principal - lignes fines et précises
    const globeGeometry = new THREE.SphereGeometry(6, 80, 80);
    
    // Wireframe ultra-fin
    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.08
    });
    
    const wireframe = new THREE.Mesh(globeGeometry, wireMaterial);
    wireframe.userData.isGlobe = true;
    globeGroup.add(wireframe);

    // Lignes de latitude/longitude custom - style japonais épuré
    createLatLongLines();

    // Core noir mat
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(5.95, 64, 64), coreMat);
    core.userData.isGlobe = true;
    globeGroup.add(core);
}

function createLatLongLines() {
    const material = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.15,
        linewidth: 1
    });

    // Lignes de latitude (horizontales)
    for (let lat = -80; lat <= 80; lat += 20) {
        const points = [];
        for (let lng = 0; lng <= 360; lng += 5) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = lng * (Math.PI / 180);
            const x = 6.05 * Math.sin(phi) * Math.cos(theta);
            const y = 6.05 * Math.cos(phi);
            const z = 6.05 * Math.sin(phi) * Math.sin(theta);
            points.push(new THREE.Vector3(x, y, z));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        line.userData.isGlobe = true;
        globeGroup.add(line);
    }

    // Lignes de longitude (verticales) - seulement quelques unes pour minimalisme
    for (let lng = 0; lng < 360; lng += 30) {
        const points = [];
        for (let lat = -90; lat <= 90; lat += 5) {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = lng * (Math.PI / 180);
            const x = 6.05 * Math.sin(phi) * Math.cos(theta);
            const y = 6.05 * Math.cos(phi);
            const z = 6.05 * Math.sin(phi) * Math.sin(theta);
            points.push(new THREE.Vector3(x, y, z));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        line.userData.isGlobe = true;
        globeGroup.add(line);
    }
}

function createMarkers() {
    radioStations.forEach((station, index) => {
        // Position 3D
        const phi = (90 - station.lat) * (Math.PI / 180);
        const theta = (station.lng + 180) * (Math.PI / 180);
        const r = 6.15;

        const x3d = -r * Math.sin(phi) * Math.cos(theta);
        const y3d = r * Math.cos(phi);
        const z3d = r * Math.sin(phi) * Math.sin(theta);

        // Position 2D
        const x2d = station.lng * 0.12; 
        const y2d = station.lat * 0.12;
        const z2d = 0;

        // Marqueur minimaliste - simple sphère
        const geometry = new THREE.SphereGeometry(0.08, 16, 16);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x3d, y3d, z3d);
        
        mesh.userData = { 
            station: station, 
            pos3d: new THREE.Vector3(x3d, y3d, z3d),
            pos2d: new THREE.Vector3(x2d, y2d, z2d),
            currentPos: new THREE.Vector3(x3d, y3d, z3d),
            index: index
        };

        // Ring minimaliste - très fin
        const ringGeo = new THREE.RingGeometry(0.15, 0.16, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0xffffff, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.lookAt(new THREE.Vector3(0,0,0));
        mesh.add(ring);

        // Animation d'apparition décalée
        mesh.scale.set(0, 0, 0);
        gsap.to(mesh.scale, {
            x: 1, y: 1, z: 1,
            duration: 1,
            delay: index * 0.15,
            ease: "elastic.out(1, 0.5)"
        });

        globeGroup.add(mesh);
        markers.push(mesh);
    });
}

function createConnectionLines() {
    // Lignes subtiles connectant les stations proches
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.05,
        linewidth: 1
    });

    for (let i = 0; i < markers.length; i++) {
        for (let j = i + 1; j < markers.length; j++) {
            const marker1 = markers[i];
            const marker2 = markers[j];
            
            const points = [
                marker1.userData.pos3d.clone(),
                marker2.userData.pos3d.clone()
            ];
            
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, lineMaterial);
            line.userData.isConnection = true;
            globeGroup.add(line);
            connectionLines.push({ line, marker1, marker2 });
        }
    }
}

function createGeometricStarField() {
    // Particules géométriques minimales au lieu d'étoiles
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const sizes = [];
    
    for(let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 30 + Math.random() * 40;
        
        positions.push(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        
        sizes.push(Math.random() * 2 + 0.5);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({ 
        color: 0xffffff,
        size: 0.3,
        transparent: true,
        opacity: 0.4,
        sizeAttenuation: true
    });
    
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

// --- LOGIQUE DE TRANSITION 3D <-> 2D ---

function toggleViewMode() {
    if (!globeGroup || !globeGroup.children || !isInitialized) {
        console.warn('Globe not ready yet');
        return;
    }
    
    isFlatView = !isFlatView;
    const btn = document.getElementById('btn-view');
    
    if (isFlatView) {
        btn.textContent = "MODE ORBITE [3D]";
        btn.classList.add('active');
        
        autoRotate = false;
        document.getElementById('btn-rotate').textContent = "AUTO ROTATION [OFF]";
        
        globeGroup.children.forEach(child => {
            if(child.userData && child.userData.isGlobe) {
                gsap.to(child.material, {
                    opacity: 0,
                    duration: 0.6,
                    onComplete: () => { child.visible = false; }
                });
            }
        });

        // Animation de la caméra pour vue 2D
        gsap.to(camera.position, {
            z: 30,
            duration: 1.5,
            ease: "power2.inOut"
        });

    } else {
        btn.textContent = "VUE TACTIQUE [2D]";
        btn.classList.remove('active');
        
        autoRotate = true;
        document.getElementById('btn-rotate').textContent = "AUTO ROTATION [ON]";

        globeGroup.children.forEach(child => {
            if(child.userData && child.userData.isGlobe) {
                child.visible = true;
                gsap.to(child.material, {
                    opacity: child.userData.isGlobe ? 0.08 : 0.15,
                    duration: 0.6
                });
            }
        });

        gsap.to(camera.position, {
            z: 25,
            duration: 1.5,
            ease: "power2.inOut"
        });
    }
}

function toggleAutoRotate() {
    if (!isInitialized) return;
    autoRotate = !autoRotate;
    const btn = document.getElementById('btn-rotate');
    btn.textContent = autoRotate ? "AUTO ROTATION [ON]" : "AUTO ROTATION [OFF]";
}

function resetView() {
    if (!isInitialized) return;
    
    if (isFlatView) {
        toggleViewMode();
    }
    
    gsap.to(globeGroup.rotation, {
        x: 0, y: 0, z: 0,
        duration: 1.5,
        ease: "power2.inOut"
    });
    
    gsap.to(camera.position, {
        x: 0, y: 0, z: 25,
        duration: 1.5,
        ease: "power2.inOut"
    });
    
    document.getElementById('station-info').style.display = 'none';
}

// --- INTERACTION SOURIS & GIF ---

function setupControls() {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY * 0.01;
        gsap.to(camera.position, {
            z: Math.max(10, Math.min(60, camera.position.z + delta)),
            duration: 0.3,
            ease: "power2.out"
        });
    }, { passive: false });
    
    document.addEventListener('click', onMouseClick);
}

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function onMouseDown(e) { 
    isDragging = true; 
    previousMousePosition = { x: e.clientX, y: e.clientY }; 
}

function onMouseUp() { 
    isDragging = false; 
}

function onMouseMove(e) {
    if (isDragging && !isFlatView) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        gsap.to(globeGroup.rotation, {
            y: globeGroup.rotation.y + deltaX * 0.005,
            x: globeGroup.rotation.x + deltaY * 0.005,
            duration: 0.3,
            ease: "power2.out"
        });
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    // Raycaster pour Hover
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);
    const tooltip = document.getElementById('holo-tooltip');

    if (intersects.length > 0) {
        const object = intersects[0].object;
        const station = object.userData.station;
        
        // Animation de scale subtile
        gsap.to(object.scale, {
            x: 1.8, y: 1.8, z: 1.8,
            duration: 0.3,
            ease: "power2.out"
        });
        
        // Intensifier le ring
        if (object.children[0]) {
            gsap.to(object.children[0].material, {
                opacity: 0.8,
                duration: 0.3
            });
        }
        
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
        
        const img = document.getElementById('tooltip-img');
        if (img.dataset.src !== station.gif) {
            img.src = station.gif;
            img.dataset.src = station.gif;
            document.getElementById('tooltip-meta').textContent = station.name;
        }
        
        document.body.style.cursor = 'pointer';
        hoveredStation = object;

    } else {
        tooltip.style.display = 'none';
        document.body.style.cursor = 'crosshair';
        
        markers.forEach(m => {
            gsap.to(m.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.3,
                ease: "power2.out"
            });
            if (m.children[0]) {
                gsap.to(m.children[0].material, {
                    opacity: 0.3,
                    duration: 0.3
                });
            }
        });
        hoveredStation = null;
    }
}

function onMouseClick(e) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);
    
    if (intersects.length > 0) {
        const station = intersects[0].object.userData.station;
        showStationInfo(station);
    }
}

// --- AFFICHAGE INFOS & LECTURE ---

function showStationInfo(station) {
    document.getElementById('station-name').textContent = station.name;
    document.getElementById('station-location').textContent = `📍 ${station.city}, ${station.country}`;
    document.getElementById('station-genre').textContent = `🎵 ${station.genre}`;
    
    const btn = document.querySelector('#station-info .actions button');
    if (btn) {
        btn.onclick = function() { playStation(station.mixcloud); };
    }
    
    const panel = document.getElementById('station-info');
    panel.style.display = 'block';
    
    // Animation d'apparition
    gsap.from(panel, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: "power2.out"
    });
}

function closeStationInfo() {
    const panel = document.getElementById('station-info');
    gsap.to(panel, {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
            panel.style.display = 'none';
        }
    });
}

function playStation(mixcloudUrl) {
    if(!mixcloudUrl) return;
    window.open(mixcloudUrl, '_blank');
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- BOUCLE D'ANIMATION ---

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Rotation automatique lente et fluide
    if (autoRotate && !isDragging && !isFlatView) {
        globeGroup.rotation.y += 0.001;
    }
    
    // Transition fluide des positions
    const lerpSpeed = 0.08;
    
    markers.forEach((marker, i) => {
        const target = isFlatView ? marker.userData.pos2d : marker.userData.pos3d;
        
        marker.position.lerp(target, lerpSpeed);
        
        if (isFlatView) {
            marker.lookAt(camera.position);
            globeGroup.rotation.x += (0 - globeGroup.rotation.x) * lerpSpeed * 0.5;
            globeGroup.rotation.y += (0 - globeGroup.rotation.y) * lerpSpeed * 0.5;
        } else {
            if (marker.children[0]) {
                marker.children[0].lookAt(0, 0, 0); 
            }
        }

        // Animation subtile de pulsation
        if (marker.children[0] && marker !== hoveredStation) {
            const pulse = 1 + Math.sin(time * 1.5 + i * 0.5) * 0.08;
            marker.children[0].scale.set(pulse, pulse, 1);
        }
    });

    // Mise à jour des lignes de connexion
    connectionLines.forEach(conn => {
        const positions = conn.line.geometry.attributes.position.array;
        positions[0] = conn.marker1.position.x;
        positions[1] = conn.marker1.position.y;
        positions[2] = conn.marker1.position.z;
        positions[3] = conn.marker2.position.x;
        positions[4] = conn.marker2.position.y;
        positions[5] = conn.marker2.position.z;
        conn.line.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
}

// Lancer l'initialisation
init();
