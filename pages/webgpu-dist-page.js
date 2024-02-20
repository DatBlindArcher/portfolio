import { Base, define } from "../components/base.js";

const template = /*html*/`
<style>
div {
    height: 100%;
    background-color: black;
}

canvas {
    width: 800px;
    height: 800px;
}

.fps {
    top: 0;
    right: 0;
    position: absolute;
    color: white;
}

.error {
    position: absolute;
    color: red;
}

.hidden {
    display: none;
}
</style>
<div>
    <div class="error hidden"></div>
    <div class="fps"></div>
    <canvas width="800" height="800"></canvas>
</div>
`;

const shader = `
@group(0) @binding(0) var<uniform> instr : mat4x4<f32>;
@group(0) @binding(1) var<uniform> time : f32;

struct VertexOutput {
    @builtin(position) position : vec4<f32>,
    @location(0) uv : vec2<f32>
}

@vertex
fn vertexMain(@location(0) position: vec2<f32>, @location(1) uv: vec2<f32>) -> VertexOutput {
    var output : VertexOutput;
    output.position = vec4<f32>(position, 0.0, 1.0);
    output.uv = uv;
    return output;
}

@fragment
fn fragmentMain(fragData: VertexOutput) -> @location(0) vec4f {
    var speed = .002;
    var t = (sin((time + fragData.position.x) * speed) + 1) / 2;
    var c = (cos((time + fragData.position.x) * speed) + 1) / 2;
    return vec4f(t, 1 - t, c, 1.0);
}
`;

define('webgpu-dist-page', template, class extends Base {
    // WebGPU Context
    #device;
    #context;
    #canvasFormat;
    #depthTexture;
    #pipeline
    #bindGroupLayout
    #vertexBuffer

    // Time
    #timestamp;
    #timeBuffer;

    // Entities
    #cube;
    #sphere;

    async created() {
        this.#timestamp = 0;
        var result = await this.initializeGpu();

        if (result != undefined) {
            let error = this.find(".error");
            error.innerHTML = result;
            error.classList.remove('hidden');
            return;
        }

        this.#cube = this.cube(1);
        this.#sphere = this.sphere(1, 16, 32);
        this.update(0);
    }

    identity() {
        let dst = new Float32Array(16);
      
        dst[ 0] = 1;  dst[ 1] = 0;  dst[ 2] = 0;  dst[ 3] = 0;
        dst[ 4] = 0;  dst[ 5] = 1;  dst[ 6] = 0;  dst[ 7] = 0;
        dst[ 8] = 0;  dst[ 9] = 0;  dst[10] = 1;  dst[11] = 0;
        dst[12] = 0;  dst[13] = 0;  dst[14] = 0;  dst[15] = 1;
      
        return dst;
    }

    update(time) {
        const deltaTime = Math.min(time - this.#timestamp, 500);
        this.#timestamp = time;
        this.find(".fps").innerHTML = `${Math.trunc(1000 / deltaTime)} FPS`;

        // Update TimeBuffer
        const timeData = new Float32Array([time]);
        this.#device.queue.writeBuffer(this.#timeBuffer, 0, timeData);

        // Data Buffer
        this.#device.queue.writeBuffer(this.#cube.dataBuffer, 0, this.identity());
        this.#device.queue.writeBuffer(this.#sphere.dataBuffer, 0, this.identity());

        const encoder = this.#device.createCommandEncoder();
        
        // Clear the Canvas
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.#context.getCurrentTexture().createView(),
                clearValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
                loadOp: "clear",
                storeOp: "store",
            }],
            depthStencilAttachment: {
                view: this.#depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        });

        // Set Pipeline
        pass.setPipeline(this.#pipeline);
        pass.setVertexBuffer(0, this.#vertexBuffer);
        
        // Draw Cube
        pass.setBindGroup(0, this.#cube.bindGroup);
        pass.draw(6);

        // Draw Sphere
        pass.setBindGroup(0, this.#sphere.bindGroup);
        pass.draw(6);

        pass.end();
        this.#device.queue.submit([encoder.finish()]);

        // Update
        window.requestAnimationFrame(this.update.bind(this));
    }

    async initializeGpu() {
        // Check if WebGPU is supported
        if (!navigator.gpu) {
            return "WebGPU not supported on this browser.";
        }

        // Request adapter and device
        const adapter = await navigator.gpu.requestAdapter();
        
        if (!adapter) {
            return "No appropriate GPUAdapter found.";
        }

        this.#device = await adapter.requestDevice();

        // Configure the Canvas
        const canvas = this.find("canvas");
        this.#context = canvas.getContext("webgpu");
        this.#canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        this.#context.configure({ device: this.#device, format: this.#canvasFormat });

        this.#depthTexture = this.#device.createTexture({
            size: [canvas.width, canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });

        this.#timeBuffer = this.#device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });

        // Create single Geometry
        const vertices = new Float32Array([
            -1.0, -1.0, 0.0, 1.0,
             1.0, -1.0, 1.0, 1.0,
             1.0,  1.0, 1.0, 0.0,

            -1.0, -1.0, 0.0, 1.0,
             1.0,  1.0, 1.0, 0.0,
            -1.0,  1.0, 0.0, 0.0
        ]);

        this.#vertexBuffer = this.#device.createBuffer({
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        this.#device.queue.writeBuffer(this.#vertexBuffer, 0, vertices);

        // Create single Pipeline
        const shaderModule = this.#device.createShaderModule({
            code: shader
        });

        this.#bindGroupLayout = this.#device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {}
            },{
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {}
            }]
        });

        const pipelineLayout = this.#device.createPipelineLayout({
            bindGroupLayouts: [
                this.#bindGroupLayout
            ]
        });

        this.#pipeline = this.#device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: shaderModule,
                entryPoint: "vertexMain",
                buffers: [{
                    attributes: [
                        {
                            shaderLocation: 0,
                            offset: 0,
                            format: "float32x2"
                        },
                        {
                            shaderLocation: 1,
                            offset: 8,
                            format: "float32x2"
                        }
                    ],
                    arrayStride: 16,
                    stepMode: "vertex"
                }]
            },
            fragment: {
                module: shaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: this.#canvasFormat
                }]
            },
            primitive: {
              topology: 'triangle-list'
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus'
            }
        });
    }

    cube() {
        let dataBuffer = this.#device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });

        const bindGroup = this.#device.createBindGroup({
            layout: this.#bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: dataBuffer },
            },{
                binding: 1,
                resource: { buffer: this.#timeBuffer },
            }]
        });

        return {
            dataBuffer,
            bindGroup
        };
    }

    sphere(radius, latitudes, longitudes) {
        let dataBuffer = this.#device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });

        const bindGroup = this.#device.createBindGroup({
            layout: this.#bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: dataBuffer },
            },{
                binding: 1,
                resource: { buffer: this.#timeBuffer },
            }]
        });

        return {
            dataBuffer,
            bindGroup
        };
    }
});