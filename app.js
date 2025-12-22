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
let scene, camera, renderer, globeGroup;
let markers = [];
let autoRotate = true;
let isFlatView = false; // Mode 2D vs 3D
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let hoveredStation = null;
let isInitialized = false; // Flag pour savoir si l'init est complète

// Initialisation
function init() {
    // 1. Scène
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 15, 60);

    // 2. Caméra
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 16);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000); // Fond noir pur
    document.getElementById('container').appendChild(renderer.domElement);

    // 4. Groupe Globe (pour tout faire tourner ensemble)
    globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 5. Lumières (On garde les couleurs pour le Globe uniquement)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Lumières néon pour éclairer la structure 3D
    const light1 = new THREE.PointLight(0x00ff00, 1, 100); // Vert
    light1.position.set(15, 15, 15);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0xff00ff, 1, 100); // Magenta
    light2.position.set(-15, -10, 15);
    scene.add(light2);

    // 6. Création des objets
    createGlobe();
    createStarField();
    createMarkers(); // Création des marqueurs avec logique de position cible

    // 7. Events
    setupControls();
    window.addEventListener('resize', onWindowResize);
    document.getElementById('station-count').textContent = radioStations.length;

    // Masquer le loading et activer les contrôles
    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
        isInitialized = true;
    }, 1000);

    animate();
}

function createGlobe() {
    // Le globe en fil de fer (Wireframe) - Garde les couleurs néon
    const geometry = new THREE.SphereGeometry(6, 64, 64);
    const material = new THREE.MeshBasicMaterial({
        color: 0x004444, // Cyan très sombre
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    
    const sphere = new THREE.Mesh(geometry, material);
    sphere.userData.isGlobe = true; // Tag pour pouvoir le cacher en mode 2D
    globeGroup.add(sphere);

    // Noyau noir pour cacher les lignes de derrière
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(5.9, 64, 64), coreMat);
    core.userData.isGlobe = true;
    globeGroup.add(core);
}

function createMarkers() {
    const loader = new THREE.TextureLoader();
    
    radioStations.forEach((station, index) => {
        // --- 1. Calcul Position Sphérique (Mode 3D) ---
        const phi = (90 - station.lat) * (Math.PI / 180);
        const theta = (station.lng + 180) * (Math.PI / 180);
        const r = 6.1; // Rayon légèrement plus grand que le globe

        const x3d = -r * Math.sin(phi) * Math.cos(theta);
        const y3d = r * Math.cos(phi);
        const z3d = r * Math.sin(phi) * Math.sin(theta);

        // --- 2. Calcul Position Plane (Mode 2D "Tactical") ---
        // Projection simple de Mercator
        const x2d = station.lng * 0.12; 
        const y2d = station.lat * 0.12;
        const z2d = 0;

        // --- 3. Création visuelle du marqueur ---
        const geometry = new THREE.IcosahedronGeometry(0.15, 0);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xff00ff, // Magenta Néon
            wireframe: true 
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // On initialise la position en mode 3D
        mesh.position.set(x3d, y3d, z3d);
        
        // On stocke les données pour l'animation et l'interaction
        mesh.userData = { 
            station: station, 
            pos3d: new THREE.Vector3(x3d, y3d, z3d),
            pos2d: new THREE.Vector3(x2d, y2d, z2d),
            currentPos: new THREE.Vector3(x3d, y3d, z3d)
        };

        // Ajout d'un cercle brillant autour
        const ringGeo = new THREE.RingGeometry(0.2, 0.25, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            side: THREE.DoubleSide, 
            transparent: true, opacity: 0.6 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.lookAt(new THREE.Vector3(0,0,0)); // Regarde vers le centre
        mesh.add(ring); // Le ring est enfant du marker

        globeGroup.add(mesh);
        markers.push(mesh);
    });
}

function createStarField() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for(let i=0; i<1500; i++) {
        vertices.push(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 200
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: 0x444444, size: 0.2 });
    scene.add(new THREE.Points(geometry, material));
}

// --- LOGIQUE DE TRANSITION 3D <-> 2D ---

function toggleViewMode() {
    // Vérification de sécurité
    if (!globeGroup || !globeGroup.children || !isInitialized) {
        console.warn('Globe not ready yet');
        return;
    }
    
    isFlatView = !isFlatView;
    const btn = document.getElementById('btn-view');
    
    if (isFlatView) {
        // PASSAGE EN MODE 2D
        btn.textContent = "MODE ORBITE [3D]";
        btn.classList.add('active');
        
        // Arrêter la rotation auto pour faciliter la lecture
        autoRotate = false;
        document.getElementById('btn-rotate').textContent = "AUTO ROTATION [OFF]";
        
        // Cacher le globe sphérique
        globeGroup.children.forEach(child => {
            if(child.userData && child.userData.isGlobe) {
                child.visible = false;
            }
        });

    } else {
        // PASSAGE EN MODE 3D
        btn.textContent = "VUE TACTIQUE [2D]";
        btn.classList.remove('active');
        
        autoRotate = true;
        document.getElementById('btn-rotate').textContent = "AUTO ROTATION [ON]";

        // Réafficher le globe
        globeGroup.children.forEach(child => {
            if(child.userData && child.userData.isGlobe) {
                child.visible = true;
            }
        });
    }
}

function toggleAutoRotate() {
    if (!isInitialized) {
        console.warn('Globe not ready yet');
        return;
    }
    
    autoRotate = !autoRotate;
    const btn = document.getElementById('btn-rotate');
    btn.textContent = autoRotate ? "AUTO ROTATION [ON]" : "AUTO ROTATION [OFF]";
}

function resetView() {
    if (!isInitialized) {
        console.warn('Globe not ready yet');
        return;
    }
    
    // Remettre en mode 3D si on est en 2D
    if (isFlatView) {
        toggleViewMode();
    }
    
    // Force reset immédiat
    globeGroup.rotation.set(0, 0, 0);
    camera.position.set(0, 0, 16);
    document.getElementById('station-info').style.display = 'none';
}

// --- INTERACTION SOURIS & GIF ---

function setupControls() {
    // Événements de souris standards
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('wheel', (e) => {
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(5, Math.min(50, camera.position.z));
    });
    
    // Click pour ouvrir
    document.addEventListener('click', onMouseClick);
}

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

function onMouseDown(e) { isDragging = true; previousMousePosition = { x: e.clientX, y: e.clientY }; }
function onMouseUp() { isDragging = false; }

function onMouseMove(e) {
    // 1. Gestion du Dragging (Rotation)
    if (isDragging && !isFlatView) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x += deltaY * 0.005;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    }

    // 2. Raycaster pour Hover (GIF)
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers);
    const tooltip = document.getElementById('holo-tooltip');

    if (intersects.length > 0) {
        // SURVOL D'UNE STATION
        const object = intersects[0].object;
        const station = object.userData.station;
        
        // Grossir légèrement le marqueur
        object.scale.set(1.5, 1.5, 1.5);
        
        // Afficher le GIF
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY + 15) + 'px';
        
        const img = document.getElementById('tooltip-img');
        if (img.dataset.src !== station.gif) {
            img.src = station.gif;
            img.dataset.src = station.gif;
            document.getElementById('tooltip-meta').textContent = ">> " + station.name;
        }
        
        document.body.style.cursor = 'pointer';

    } else {
        // PAS DE SURVOL
        tooltip.style.display = 'none';
        document.body.style.cursor = 'crosshair';
        
        // Remettre les marqueurs à taille normale
        markers.forEach(m => m.scale.set(1, 1, 1));
    }
}

function onMouseClick(e) {
    // Si on a cliqué sur un marqueur (déjà détecté par le raycaster dans mousemove)
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
    
    // Stocker l'URL Mixcloud dans le bouton
    const btn = document.querySelector('#station-info .actions button');
    if (btn) {
        btn.onclick = function() { playStation(station.mixcloud); };
    }
    
    document.getElementById('station-info').style.display = 'block';
}

function closeStationInfo() {
    document.getElementById('station-info').style.display = 'none';
}

function playStation(mixcloudUrl) {
    if(!mixcloudUrl) return;
    
    // Créer une fenêtre flottante pour Mixcloud
    // Pour l'instant, ouverture dans un nouvel onglet pour éviter les soucis d'iframe complexes
    // Idéalement, on injecterait l'iframe dans une div #player
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

    // 1. Rotation Automatique (Seulement en mode 3D et si activé)
    if (autoRotate && !isDragging && !isFlatView) {
        globeGroup.rotation.y += 0.002;
    }
    
    // 2. Transition fluide des Positions (Tweening maison)
    // Lerp = Linear Interpolation (déplace doucement A vers B)
    const lerpSpeed = 0.05;
    
    markers.forEach(marker => {
        const target = isFlatView ? marker.userData.pos2d : marker.userData.pos3d;
        
        // Interpolation
        marker.position.x += (target.x - marker.position.x) * lerpSpeed;
        marker.position.y += (target.y - marker.position.y) * lerpSpeed;
        marker.position.z += (target.z - marker.position.z) * lerpSpeed;
        
        // En mode 2D, on s'assure que les marqueurs regardent la caméra
        if (isFlatView) {
            marker.lookAt(camera.position);
            // On annule la rotation du groupe globe en mode 2D
            globeGroup.rotation.x += (0 - globeGroup.rotation.x) * lerpSpeed;
            globeGroup.rotation.y += (0 - globeGroup.rotation.y) * lerpSpeed;
        } else {
            // En mode 3D, le ring regarde le centre (0,0,0)
            if (marker.children[0]) {
                marker.children[0].lookAt(0,0,0); 
            }
        }
    });

    // 3. Animation pulsante des marqueurs
    const time = Date.now() * 0.001;
    markers.forEach((marker, i) => {
        // Faire pulser l'anneau
        const ring = marker.children[0];
        if(ring) {
            const scale = 1 + Math.sin(time * 2 + i) * 0.2;
            ring.scale.set(scale, scale, 1);
        }
    });

    renderer.render(scene, camera);
}

// Lancer l'initialisation au chargement de la page
init();
