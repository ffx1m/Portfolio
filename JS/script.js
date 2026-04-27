/* =========================================
    1. Typewriter Effect
========================================= */
const words = ['ธีรภัทร สุขเพีย', 'Thiraphat Sukphia'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typewriterElement = document.getElementById('typewriter-text');

function typeEffect() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
        // Remove char
        typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
    } else {
        // Add char
        typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
    }

    // Speed logic
    let typeSpeed = isDeleting ? 50 : 100;

    // If word is completely typed
    if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000; // Pause at the end of word
        isDeleting = true;
    } 
    // If word is completely deleted
    else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length; // Move to next word
        typeSpeed = 500; // Pause before typing new word
    }

    setTimeout(typeEffect, typeSpeed);
}

/* =========================================
    2. 3D AI Brain Animation (Three.js)
========================================= */
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 250;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Create Brain Particles (Neural Network / Plexus Effect)
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);

    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleData = [];

    // Helper to generate points roughly in a brain/sphere shape
    const r = 100;
    for (let i = 0; i < particleCount; i++) {
        // Create points on a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        // Slightly squash Y axis to make it more brain-shaped
        const x = r * Math.sin(phi) * Math.cos(theta) * (0.8 + Math.random() * 0.4);
        const y = r * Math.sin(phi) * Math.sin(theta) * 0.7 * (0.8 + Math.random() * 0.4); 
        const z = r * Math.cos(phi) * (0.8 + Math.random() * 0.4);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        particleData.push({
            velocity: new THREE.Vector3(-0.5 + Math.random(), -0.5 + Math.random(), -0.5 + Math.random()).normalize().multiplyScalar(0.2)
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Material for dots
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x0a84ff, // Apple blue
        size: 3,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    particlesGroup.add(particles);

    // Material for connecting lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x0a84ff,
        transparent: true,
        opacity: window.innerWidth <= 1200 ? 0.3 : 0.15  // Mobile & Tablet: higher opacity
    });
    // Need a larger buffer for lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(particleCount * particleCount * 3);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    particlesGroup.add(linesMesh);

    const maxDistance = 35; // Connection threshold

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate the whole brain
        particlesGroup.rotation.y += 0.002;
        particlesGroup.rotation.x += 0.001;

        let vertexpos = 0;
        let numConnected = 0;

        const positions = particles.geometry.attributes.position.array;
        const linePositionsArray = linesMesh.geometry.attributes.position.array;

        // Subtle particle movement
        for (let i = 0; i < particleCount; i++) {
            const pData = particleData[i];
            positions[i * 3] += pData.velocity.x;
            positions[i * 3 + 1] += pData.velocity.y;
            positions[i * 3 + 2] += pData.velocity.z;

            // Bounds check to keep shape
            const dist = Math.sqrt(
                Math.pow(positions[i*3], 2) + 
                Math.pow(positions[i*3+1], 2) + 
                Math.pow(positions[i*3+2], 2)
            );
            
            if(dist > r * 1.5) {
                pData.velocity.multiplyScalar(-1);
            }
        }

        // Check distances and create lines
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDistance) {
                    linePositionsArray[vertexpos++] = positions[i * 3];
                    linePositionsArray[vertexpos++] = positions[i * 3 + 1];
                    linePositionsArray[vertexpos++] = positions[i * 3 + 2];

                    linePositionsArray[vertexpos++] = positions[j * 3];
                    linePositionsArray[vertexpos++] = positions[j * 3 + 1];
                    linePositionsArray[vertexpos++] = positions[j * 3 + 2];
                    numConnected++;
                }
            }
        }

        linesMesh.geometry.setDrawRange(0, numConnected * 2);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    }

    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

/* =========================================
    3. UI & Mobile Menu Logic
========================================= */
function initUI() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const menuLinks = menu.querySelectorAll('a');
    const btnIcon = btn.querySelector('i');
    
    let menuIsOpen = false;

    // Toggle Mobile Menu & Button Color
    btn.addEventListener('click', () => {
        menuIsOpen = !menuIsOpen;
        
        if (menuIsOpen) {
            menu.classList.remove('hidden');
            // เปลี่ยนสีปุ่มเป็นสีขาว
            btn.style.color = '#ffffff';
            btnIcon.style.color = '#ffffff';
        } else {
            menu.classList.add('hidden');
            // คืนสีปุ่มเป็นสีเทา
            btn.style.color = '#9ca3af';
            btnIcon.style.color = '#9ca3af';
        }
    });

    // Close mobile menu on link click & Reset Button Color
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuIsOpen = false;
            menu.classList.add('hidden');
            // Reset button color back to gray
            btn.style.color = '#9ca3af';
            btnIcon.style.color = '#9ca3af';
        });
    });

    // Navbar Blur effect on scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            nav.classList.add('shadow-lg');
        } else {
            nav.classList.remove('shadow-lg');
        }
    });
}

/* =========================================
    4. Reset Scroll & URL on Refresh
========================================= */
// ป้องกันเบราว์เซอร์จำตำแหน่ง Scroll เดิมเมื่อรีเฟรช (ตั้งไว้ก่อน load)
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// ฟังก์ชันรีเซ็ต scroll
function resetScrollPosition() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

// ฟังก์ชันล้าง hash
function clearHashFromURL() {
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
    }
}

/* Initialize ASAP on DOMContentLoaded */
document.addEventListener('DOMContentLoaded', () => {
    resetScrollPosition();
    clearHashFromURL();
});

/* Initialize everything when page fully loaded */
window.addEventListener('load', () => {
    // Reset scroll อีกครั้ง เพื่อแน่ใจ
    resetScrollPosition();
    clearHashFromURL();

    // เรียกใช้ฟังก์ชันอื่นๆ ตามปกติ
    setTimeout(typeEffect, 1000); // Start typing after 1s delay
    initThreeJS();
    initUI();
});

/* Handle browser back/forward/refresh (Safari issue) */
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        // หน้าถูก restore จาก bfcache
        resetScrollPosition();
        clearHashFromURL();
    }
});