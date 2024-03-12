

// WebGPU Context
var device;
var context;
var canvasFormat;
var depthTexture;

// Shadows
const shadowDepthTextureSize = 1024;
var shadowDepthTexture;
var shadowDepthTextureView;
var sceneBindGroupForShadow;
var shadowPassDescriptor;
var shadowPipeline;

// Rendering
var uniformBufferBindGroupLayout;
var bglForRender;
var sceneUniformBuffer;
var sceneBindGroupForRender;
var renderPassDescriptor;
var pipeline;

// Entities
var entities = [];
var load_glb;
var modelMap = new Map();
var models = {
    HexTile: './models/HexTile.glb'
};

async function setup_render(loader) {
    load_glb = loader;
    var result = await initialize_webgpu();

    if (result != undefined) {
        let error = document.getElementById("status");
        error.innerHTML = result;
        error.classList.remove('hidden');
        return;
    }
}

function render() {
    //var start = Date.now();
    const encoder = device.createCommandEncoder();

    {   // Shadow Pass
        const shadowPass = encoder.beginRenderPass(shadowPassDescriptor);
        shadowPass.setPipeline(shadowPipeline);
        shadowPass.setBindGroup(0, sceneBindGroupForShadow);

        for (var entity of entities) {
            if (entity.isLoaded) {
                shadowPass.setBindGroup(1, entity.bindGroup);
                shadowPass.setVertexBuffer(0, entity.model.vertexBuffer);
                shadowPass.setIndexBuffer(entity.model.indexBuffer, 'uint16');
                shadowPass.drawIndexed(entity.model.indexCount);
            }
        }

        shadowPass.end();
    }

    {   // Render Pass
        renderPassDescriptor.colorAttachments[0].view = context
            .getCurrentTexture()
            .createView();

        const pass = encoder.beginRenderPass(renderPassDescriptor);
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, sceneBindGroupForRender);

        // Draw Entities
        for (var entity of entities) {
            if (entity.isLoaded) {
                pass.setBindGroup(1, entity.bindGroup);
                pass.setVertexBuffer(0, entity.model.vertexBuffer);
                pass.setIndexBuffer(entity.model.indexBuffer, "uint16");
                pass.drawIndexed(entity.model.indexCount);
            }
        }

        pass.end();
    }

    device.queue.submit([encoder.finish()]);
    //var end = Date.now();
    //console.log((end - start) + " MS");
}

async function initialize_webgpu() {
    // Check if WebGPU is supported
    if (!navigator.gpu) {
        return "WebGPU not supported on this browser.";
    }

    // Request adapter and device
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
        return "No appropriate GPUAdapter found.";
    }

    device = await adapter.requestDevice();

    // Configure the Canvas
    const canvas = document.querySelector("canvas");
    context = canvas.getContext("webgpu");
    canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({ device: device, format: canvasFormat });

    depthTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: 'depth24plus-stencil8',
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    sceneUniformBuffer = device.createBuffer({
        size: 2 * 4 * 16 + 4 * 4,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
    });

    // Create the depth texture for rendering/sampling the shadow map.
    shadowDepthTexture = device.createTexture({
        size: [shadowDepthTextureSize, shadowDepthTextureSize, 1],
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        format: 'depth32float',
    });
    shadowDepthTextureView = shadowDepthTexture.createView();
    shadowPassDescriptor = {
        colorAttachments: [],
        depthStencilAttachment: {
            view: shadowDepthTextureView,
            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
        },
    };
    
    uniformBufferBindGroupLayout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                },
            },
        ],
    });

    bglForRender = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                buffer: {
                    type: 'uniform',
                },
            },
            {
                binding: 1,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                texture: {
                    sampleType: 'depth',
                },
            },
            {
                binding: 2,
                visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                sampler: {
                    type: 'comparison',
                },
            },
        ],
    });

    const shadowShader = device.createShaderModule({
        label: 'shadow shader',
        code: shadowCode
    });

    shadowPipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts: [
                uniformBufferBindGroupLayout,
                uniformBufferBindGroupLayout,
            ],
        }),
        vertex: {
            module: shadowShader,
            entryPoint: 'main',
            buffers: [{
                arrayStride: Float32Array.BYTES_PER_ELEMENT * 6,
                attributes: [
                    {
                        // position
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3',
                    },
                    {
                        // normal
                        shaderLocation: 1,
                        offset: Float32Array.BYTES_PER_ELEMENT * 3,
                        format: 'float32x3',
                    },
                ],
            }],
        },
        primitive: {
            topology: 'triangle-list',
            cullMode: 'back'
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth32float',
        }
    });
    
    const vertShader = device.createShaderModule({
        label: 'vertex shader',
        code: vertexCode
    });

    const fragShader = device.createShaderModule({
        label: 'fragment shader',
        code: fragmentCode
    });

    pipeline = device.createRenderPipeline({
        label: "pipeline",
        layout: device.createPipelineLayout({
            bindGroupLayouts: [bglForRender, uniformBufferBindGroupLayout],
        }),
        vertex: {
            module: vertShader,
            entryPoint: "main",
            buffers: [{
                arrayStride: Float32Array.BYTES_PER_ELEMENT * 6,
                attributes: [
                    {
                        // position
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3',
                    },
                    {
                        // normal
                        shaderLocation: 1,
                        offset: Float32Array.BYTES_PER_ELEMENT * 3,
                        format: 'float32x3',
                    },
                ],
            }]
        },
        fragment: {
            module: fragShader,
            entryPoint: "main",
            targets: [{
                format: canvasFormat
            }],
            constants: {
                shadowDepthTextureSize,
            },
        },
        primitive: {
            topology: 'triangle-list',
            cullMode: 'back'
        },
        depthStencil: {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus-stencil8'
        }
    });
    
    sceneBindGroupForShadow = device.createBindGroup({
        layout: uniformBufferBindGroupLayout,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: sceneUniformBuffer,
                },
            },
        ],
    });

    sceneBindGroupForRender = device.createBindGroup({
        layout: bglForRender,
        entries: [
            {
                binding: 0,
                resource: {
                    buffer: sceneUniformBuffer,
                },
            },
            {
                binding: 1,
                resource: shadowDepthTextureView,
            },
            {
                binding: 2,
                resource: device.createSampler({
                    compare: 'less',
                }),
            },
        ],
    });

    renderPassDescriptor = {
        colorAttachments: [
            {
                // view is acquired and set in render loop.
                view: undefined,

                clearValue: { r: 0.2, g: 0.2, b: 0.2, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            },
        ],
        depthStencilAttachment: {
            view: depthTexture.createView(),

            depthClearValue: 1.0,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            stencilClearValue: 0,
            stencilLoadOp: 'clear',
            stencilStoreOp: 'store',
        },
    };

    const upVector = new Float32Array([0, 1, 0]);
    const origin = new Float32Array([0, 0, 0]);
    const lightPosition = new Float32Array([50, 100, 100]);
    const lightViewMatrix = lookAt(lightPosition, origin, upVector);
    const lightProjectionMatrix = identity();
    {
        const left = -80;
        const right = 80;
        const bottom = -80;
        const top = 80;
        const near = -200;
        const far = 300;
        orthographic(left, right, bottom, top, near, far, lightProjectionMatrix);
    }

    const lightViewProjMatrix = multiply(
        lightProjectionMatrix,
        lightViewMatrix
    );

    {
        device.queue.writeBuffer(
            sceneUniformBuffer,
            0,
            lightViewProjMatrix.buffer,
            lightViewProjMatrix.byteOffset,
            lightViewProjMatrix.byteLength
        );

        const camera_matrix = perspective(60.0, 1, .2, 100);
        rotate(camera_matrix, 1, 0, 0, 45);
        translate(camera_matrix, 0, -18, -16);
        device.queue.writeBuffer(
            sceneUniformBuffer,
            64,
            camera_matrix.buffer,
            camera_matrix.byteOffset,
            camera_matrix.byteLength
        );
        
        device.queue.writeBuffer(
            sceneUniformBuffer,
            128,
            lightPosition.buffer,
            lightPosition.byteOffset,
            lightPosition.byteLength
        );
    }
}

const vertexCode = `
    struct Scene {
        lightViewProjMatrix: mat4x4<f32>,
        cameraViewProjMatrix: mat4x4<f32>,
        lightPos: vec3<f32>,
    }

    struct Model {
        modelMatrix: mat4x4<f32>,
    }

    @group(0) @binding(0) var<uniform> scene : Scene;
    @group(1) @binding(0) var<uniform> model : Model;

    struct VertexOutput {
        @location(0) shadowPos: vec3<f32>,
        @location(1) fragPos: vec3<f32>,
        @location(2) fragNorm: vec3<f32>,

        @builtin(position) Position: vec4<f32>,
    }

    @vertex
    fn main(@location(0) position: vec3<f32>, @location(1) normal: vec3<f32>) -> VertexOutput {
        var output : VertexOutput;

        // XY is in (-1, 1) space, Z is in (0, 1) space
        let posFromLight = scene.lightViewProjMatrix * model.modelMatrix * vec4(position, 1.0);

        // Convert XY to (0, 1)
        // Y is flipped because texture coords are Y-down.
        output.shadowPos = vec3(posFromLight.xy * vec2(0.5, -0.5) + vec2(0.5), posFromLight.z);

        output.Position = scene.cameraViewProjMatrix * model.modelMatrix * vec4(position, 1.0);
        output.fragPos = output.Position.xyz;
        output.fragNorm = normal;
        return output;
    }
`;
const fragmentCode = `
    override shadowDepthTextureSize: f32 = 1024.0;

    struct Scene {
        lightViewProjMatrix : mat4x4<f32>,
        cameraViewProjMatrix : mat4x4<f32>,
        lightPos : vec3<f32>,
    }

    @group(0) @binding(0) var<uniform> scene : Scene;
    @group(0) @binding(1) var shadowMap: texture_depth_2d;
    @group(0) @binding(2) var shadowSampler: sampler_comparison;

    struct FragmentInput {
        @location(0) shadowPos : vec3<f32>,
        @location(1) fragPos : vec3<f32>,
        @location(2) fragNorm : vec3<f32>,
    }

    const albedo = vec3<f32>(0.0, 0.9, 0.2);
    const ambientFactor = 0.2;

    @fragment
    fn main(input : FragmentInput) -> @location(0) vec4<f32> {
        // Percentage-closer filtering. Sample texels in the region
        // to smooth the result.
        var visibility = 0.0;
        let oneOverShadowDepthTextureSize = 1.0 / shadowDepthTextureSize;

        for (var y = -1; y <= 1; y++) {
            for (var x = -1; x <= 1; x++) {
                let offset = vec2<f32>(vec2(x, y)) * oneOverShadowDepthTextureSize;
                visibility += textureSampleCompare(shadowMap, shadowSampler, input.shadowPos.xy + offset, input.shadowPos.z - 0.007);
            }
        }

        visibility /= 9.0;

        let lambertFactor = max(dot(normalize(scene.lightPos - input.fragPos), normalize(input.fragNorm)), 0.0);
        let lightingFactor = min(ambientFactor + visibility * lambertFactor, 1.0);

        return vec4(lightingFactor * (input.fragPos.xyz + 10) / 20, 1.0);
    }
`;

const shadowCode = `
    struct Scene {
        lightViewProjMatrix: mat4x4<f32>,
        cameraViewProjMatrix: mat4x4<f32>,
        lightPos: vec3<f32>,
    }

    struct Model {
        modelMatrix: mat4x4<f32>,
    }

    @group(0) @binding(0) var<uniform> scene : Scene;
    @group(1) @binding(0) var<uniform> model : Model;

    @vertex
    fn main(@location(0) position: vec3<f32>) -> @builtin(position) vec4<f32> {
        return scene.lightViewProjMatrix * model.modelMatrix * vec4(position, 1.0);
    }
`;

function onModelLoaded(name, vertices, indices) {
    var model = modelMap.get(name);

    model.vertexCount = vertices.buffer.byteLength / (6 * 4);
    model.vertexBuffer = device.createBuffer({
        label: "vertices",
        size: vertices.buffer.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

    model.indexCount = indices.buffer.byteLength / 2;
    model.indexBuffer = device.createBuffer({
        label: "indices",
        size: indices.buffer.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    });

    model.isLoaded = true;

    device.queue.writeBuffer(model.vertexBuffer, 0, vertices.buffer);
    device.queue.writeBuffer(model.indexBuffer, 0, indices.buffer);

    for (var entity of entities) {
        if (entity.modelName == name) {
            entity.model = model;
            entity.isLoaded = true;
        }
    }
}

function createRenderObject(model, worldMatrix) {
    const uniformBuffer = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
    });

    const bindGroup = device.createBindGroup({
        layout: uniformBufferBindGroupLayout,
        entries: [{
            binding: 0,
            resource: {
                buffer: uniformBuffer,
            },
        }],
    });
    
    device.queue.writeBuffer(uniformBuffer, 0, worldMatrix.buffer);

    if (!modelMap.has(model)) {
        modelMap.set(model, { isLoaded: false });
        load_glb(model, models[model]);
    }
    
    var entity = {
        bindGroup,
        uniformBuffer,
        modelName: model,
        isLoaded: modelMap.has(model) && modelMap.get(model).isLoaded
    };

    entities.push(entity);
    return entity;
}

function updateRenderObject(entity, worldMatrix) {
    device.queue.writeBuffer(entity.uniformBuffer, 0, worldMatrix.buffer);
}

function setCameraObject(cameraMatrix) {
    device.queue.writeBuffer(
        sceneUniformBuffer,
        64,
        cameraMatrix.buffer,
        cameraMatrix.byteOffset,
        cameraMatrix.byteLength
    );
}