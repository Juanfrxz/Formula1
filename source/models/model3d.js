import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const initScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: document.querySelector("#canvas3D"),
        alpha: true 
    });
    
    // Variables para el control del mouse
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let model = null; // Variable para almacenar el modelo

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Cargar modelo
    const loader = new GLTFLoader();
    loader.load('../public/redbull-3d.glb', function (gltf) {
        console.log("Modelo cargado:", gltf);
        model = gltf.scene;
        scene.add(model);
        model.position.set(0, 0, 0);
    }, undefined, function (error) {
        console.error("Error cargando el modelo:", error);
    });

    // Posicionar cámara
    camera.position.set(0, 2, 10);

    // Event listeners para el mouse
    document.addEventListener('mousemove', (event) => {
        // Calcula la posición relativa del mouse en la ventana
        mouseX = (event.clientX - window.innerWidth / 2) / 100;
        mouseY = (event.clientY - window.innerHeight / 2) / 100;
    });

    // Función para suavizar la rotación
    function lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Animación
    function animate() {
        requestAnimationFrame(animate);

        if (model) {
            // Suaviza la rotación
            targetRotationY = lerp(targetRotationY, mouseX * 0.5, 0.05);
            targetRotationX = lerp(targetRotationX, mouseY * 0.5, 0.05);

            // Aplica la rotación al modelo
            model.rotation.y = targetRotationY;
            model.rotation.x = targetRotationX;
        }

        renderer.render(scene, camera);
    }
    animate();

    // Manejo de redimensionamiento de ventana
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', initScene);