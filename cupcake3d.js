import * as THREE from './assets/vendor/three.module.js';

const host = document.getElementById('cupcake-scene');
const pauseButton = document.getElementById('scene-pause');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const english = document.documentElement.lang.toLowerCase() === 'en';

function buildScene() {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 60);
    camera.position.set(0, 4.7, 12);
    camera.lookAt(0, 1.25, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb2c1ae, 2.3));
    const keyLight = new THREE.DirectionalLight(0xfff8ed, 3.2);
    keyLight.position.set(-4, 7, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 6;
    keyLight.shadow.camera.bottom = -6;
    keyLight.shadow.normalBias = .035;
    keyLight.shadow.bias = -.0002;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xf8d5e1, 1.7);
    fillLight.position.set(5, 3, -3);
    scene.add(fillLight);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: .12 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -.3;
    floor.receiveShadow = true;
    scene.add(floor);

    const material = (color, roughness = .55) => new THREE.MeshPhysicalMaterial({ color, roughness, metalness: 0, clearcoat: .08 });
    const spongeMaterial = material(0xa56b3a, .9);
    const sprinkleColors = [0xffffff, 0xb84b67, 0x375c45, 0xf3d16d];
    const sprinkleMaterials = sprinkleColors.map(color => material(color, .35));

    class CreamSpiral extends THREE.Curve {
        getPoint(t, target = new THREE.Vector3()) {
            const angle = t * Math.PI * 6.7;
            const radius = .78 * Math.pow(1 - t, .8);
            return target.set(Math.cos(angle) * radius, 1.4 + 1.45 * (1 - Math.pow(1 - t, 1.3)), Math.sin(angle) * radius);
        }
    }

    function cupcake(wrapperColor, creamColor, seed) {
        const group = new THREE.Group();
        const paperGeometry = new THREE.CylinderGeometry(.98, .69, 1.22, 192, 8);
        const positions = paperGeometry.attributes.position;
        // Radial folds make the paper wrapper catch the light along its pleats.
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i), z = positions.getZ(i);
            const radius = Math.hypot(x, z);
            if (radius < .1) continue;
            const angle = Math.atan2(z, x);
            const folded = radius + .035 * Math.cos(angle * 48);
            positions.setXYZ(i, x * folded / radius, positions.getY(i), z * folded / radius);
        }
        paperGeometry.computeVertexNormals();
        const wrapper = new THREE.Mesh(paperGeometry, material(wrapperColor, .8));
        wrapper.position.y = .61;
        wrapper.castShadow = true;
        wrapper.receiveShadow = true;
        group.add(wrapper);

        const sponge = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), spongeMaterial);
        sponge.position.y = 1.22;
        sponge.scale.set(.99, .23, .99);
        sponge.castShadow = true;
        group.add(sponge);
        const creamMaterial = material(creamColor, .42);
        const creamBase = new THREE.Mesh(new THREE.SphereGeometry(.91, 48, 24), creamMaterial);
        creamBase.scale.y = .33;
        creamBase.position.y = 1.4;
        creamBase.castShadow = true;
        group.add(creamBase);

        const curve = new CreamSpiral();
        const segments = 240, sides = 16;
        const creamGeometry = new THREE.TubeGeometry(curve, segments, .3, sides, false);
        const creamPositions = creamGeometry.attributes.position;
        // Taper the piped spiral and add the ridges of a star-shaped piping tip.
        for (let ring = 0; ring <= segments; ring++) {
            const t = ring / segments;
            const center = curve.getPointAt(t);
            const radius = .3 * Math.pow(1 - t, .65) + .006;
            for (let side = 0; side <= sides; side++) {
                const index = ring * (sides + 1) + side;
                const direction = new THREE.Vector3().fromBufferAttribute(creamPositions, index).sub(center).normalize();
                direction.multiplyScalar(radius * (1 + .09 * Math.cos(side / sides * Math.PI * 16))).add(center);
                creamPositions.setXYZ(index, direction.x, direction.y, direction.z);
            }
        }
        creamGeometry.computeVertexNormals();
        const cream = new THREE.Mesh(creamGeometry, creamMaterial);
        cream.castShadow = true;
        cream.receiveShadow = true;
        group.add(cream);

        const sprinkleGeometry = new THREE.CapsuleGeometry(.025, .12, 3, 6);
        const random = () => {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            return seed / 4294967296;
        };
        for (let i = 0; i < 34; i++) {
            const t = .06 + random() * .8;
            const center = curve.getPointAt(t);
            const normal = new THREE.Vector3(center.x, .55, center.z).normalize();
            const sprinkle = new THREE.Mesh(sprinkleGeometry, sprinkleMaterials[i % sprinkleMaterials.length]);
            sprinkle.position.copy(center).addScaledVector(normal, .3 * Math.pow(1 - t, .65));
            sprinkle.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
            group.add(sprinkle);
        }
        return group;
    }

    const cupcakes = [cupcake(0x466d59, 0xffe7a0, 28), cupcake(0xdb92a8, 0xffdce7, 51), cupcake(0x927496, 0xe6d4ec, 73)];
    const stage = new THREE.Group();
    cupcakes.forEach(item => stage.add(item));
    scene.add(stage);

    function resize() {
        const width = host.clientWidth, height = host.clientHeight;
        if (!width || !height) return;
        const mobile = width < 760;
        const aspect = width / height;
        const viewHeight = Math.max(4.5, (mobile ? 6.4 : 9.5) / aspect);
        camera.left = -viewHeight * aspect / 2;
        camera.right = viewHeight * aspect / 2;
        camera.top = viewHeight / 2;
        camera.bottom = -viewHeight / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        cupcakes[0].position.set(mobile ? -1.95 : -2.8, mobile ? .3 : .02, -.7);
        cupcakes[2].position.set(mobile ? 1.95 : 2.8, mobile ? .3 : .02, -.7);
        cupcakes[0].scale.setScalar(mobile ? .58 : .86);
        cupcakes[2].scale.setScalar(mobile ? .58 : .86);
        cupcakes[1].position.set(0, -.12, .65);
        cupcakes[1].scale.setScalar(mobile ? 1.03 : 1.12);
        draw();
    }

    let paused = motionPreference.matches;
    let visible = true;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let targetRotation = 0, rotation = 0;
    let pointerStart = null;
    let startRotation = 0;
    function draw() {
        cupcakes.forEach((item, index) => {
            item.rotation.y = rotation + Math.sin(elapsed * .35 + index) * .13;
            item.rotation.z = [ -.12, .055, .14 ][index];
        });
        stage.rotation.x = Math.sin(elapsed * .45) * .015;
        renderer.render(scene, camera);
    }
    function animate(time) {
        frame = 0;
        if (!visible || document.hidden) return;
        const delta = Math.min((time - lastTime) / 1000, .05);
        lastTime = time;
        if (!paused) elapsed += delta;
        rotation += (targetRotation - rotation) * .09;
        draw();
        if (!paused || Math.abs(targetRotation - rotation) > .001) frame = requestAnimationFrame(animate);
    }
    function schedule() {
        if (!frame && visible && !document.hidden) { lastTime = performance.now(); frame = requestAnimationFrame(animate); }
    }
    function updatePause() {
        const label = english ? (paused ? 'Play animation' : 'Pause animation') : (paused ? 'Animation abspielen' : 'Animation pausieren');
        pauseButton.setAttribute('aria-label', label);
        pauseButton.setAttribute('title', label);
        pauseButton.setAttribute('aria-pressed', String(paused));
        pauseButton.innerHTML = '<i data-lucide="' + (paused ? 'play' : 'pause') + '" aria-hidden="true"></i>';
        window.lucide?.createIcons();
        schedule();
    }
    pauseButton.hidden = false;
    pauseButton.addEventListener('click', () => { paused = !paused; updatePause(); });
    motionPreference.addEventListener('change', event => { paused = event.matches; updatePause(); });
    host.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        pointerStart = event.clientX;
        startRotation = targetRotation;
        host.setPointerCapture(event.pointerId);
    });
    host.addEventListener('pointermove', event => {
        if (pointerStart === null) return;
        targetRotation = startRotation + (event.clientX - pointerStart) * .009;
        schedule();
    });
    const release = () => { pointerStart = null; };
    host.addEventListener('pointerup', release);
    host.addEventListener('pointercancel', release);
    host.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            targetRotation += event.key === 'ArrowLeft' ? -.3 : .3;
            schedule();
        }
    });
    const observer = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) schedule();
        else if (frame) { cancelAnimationFrame(frame); frame = 0; }
    });
    observer.observe(host);
    document.addEventListener('visibilitychange', schedule);
    new ResizeObserver(resize).observe(host);
    renderer.domElement.addEventListener('webglcontextlost', event => {
        event.preventDefault();
        host.classList.remove('is-ready');
        pauseButton.hidden = true;
        visible = false;
        cancelAnimationFrame(frame);
    });
    resize();
    updatePause();
    host.classList.add('is-ready');
}

if (host) {
    try { buildScene(); }
    catch (error) {
        host.querySelector('canvas')?.remove();
        pauseButton.hidden = true;
        console.warn('3D scene unavailable; showing the product photograph.', error);
    }
}
