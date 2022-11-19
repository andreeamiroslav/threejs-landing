import * as THREE from './node_modules/three/build/three.module.js'
import {OrbitControls} from './node_modules/three/examples/jsm/controls/OrbitControls.js'
import * as dat from './node_modules/dat.gui/build/dat.gui.module.js'
import gsap from './node_modules/gsap/all.js'

const gui = new dat.GUI()
const world = {
    plane: {
        width: 400,
        height: 400,
        widthSegments: 50,
        heightSegments: 50
    }
}

gui.add(world.plane, 'width', 1, 500).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 500).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000)
const renderer = new THREE.WebGLRenderer()
const raycaster = new THREE.Raycaster()

renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

camera.position.z = 50
new OrbitControls(camera, renderer.domElement)

const planeGeometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)
const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
    vertexColors: true
})
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)

generatePlane()


const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, -1, 1)

const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 0, -1)

scene.add(planeMesh)
scene.add(light)
scene.add(backLight)

let frame = 0

function animate(){
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    raycaster.setFromCamera(mouse, camera)
    frame += 0.01

    const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position
    for(let i=0; i < array.length; i+=3){
        array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.003

        array[i+1] = originalPosition[i+1] + Math.sin(frame + randomValues[i+1]) * 0.003
    }

    planeMesh.geometry.attributes.position.needsUpdate = true

    const intersects = raycaster.intersectObject(planeMesh)

    if(intersects.length > 0) {
        //console.log(intersects[0].object.geometry.attributes.color)
        const {color} = intersects[0].object.geometry.attributes

        color.setX(intersects[0].face.a, 0.1)
        color.setY(intersects[0].face.a, 0.5)
        color.setZ(intersects[0].face.a, 1)

        color.setX(intersects[0].face.b, 0.1)
        color.setY(intersects[0].face.b, 0.5)
        color.setZ(intersects[0].face.b, 1)

        color.setX(intersects[0].face.c, 0.1)
        color.setY(intersects[0].face.c, 0.5)
        color.setZ(intersects[0].face.c, 1)
        
        color.needsUpdate = true

        const initialColor = {
            r: 0,
            g: 0.19,
            b: 0.4
        }

        const hoverColor = {
            r: 0.1,
            g: 0.5,
            b: 1
        }

        gsap.to(hoverColor, {
            r: initialColor.r,
            g: initialColor.g,
            b: initialColor.b,
            onUpdate: () => {
                color.setX(intersects[0].face.a, hoverColor.r)
                color.setY(intersects[0].face.a, hoverColor.g)
                color.setZ(intersects[0].face.a, hoverColor.b)

                color.setX(intersects[0].face.b, hoverColor.r)
                color.setY(intersects[0].face.b, hoverColor.g)
                color.setZ(intersects[0].face.b, hoverColor.b)

                color.setX(intersects[0].face.c, hoverColor.r)
                color.setY(intersects[0].face.c, hoverColor.g)
                color.setZ(intersects[0].face.c, hoverColor.b)
                    }
        })
    }
}

function generatePlane(){
    planeMesh.geometry.dispose()
    planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments, world.plane.heightSegments)

    const {array} = planeMesh.geometry.attributes.position // planeMesh.geometry.attributes.position/.array.length/ object destructuring
    const randomValues = []
    for(let i=0; i < array.length; i++){
        if(i % 3 == 0){
            const x = array[i]
            const y = array[i +1]
            const z = array[i +2]

            array[i] = x + (Math.random() - 0.5) * 3
            array[i + 1] = y + (Math.random() - 0.5) * 3
            array[i + 2] = z + (Math.random() - 0.5) * 3
        }

        randomValues.push(Math.random() * Math.PI * 2)
    }
    planeMesh.geometry.attributes.position.randomValues = randomValues
    planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array


    const colors = []

    for(let i=0; i<planeMesh.geometry.attributes.position.count; i++){
        colors.push(0,0.19,0.4)
    }

    planeMesh.geometry.setAttribute(
        'color', 
        new THREE.BufferAttribute(new Float32Array(colors), 3)
    )
}

const mouse = {
    x: undefined,
    y: undefined
}

animate()

addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1
    mouse.y = - (e.clientY / innerHeight) * 2 + 1
})