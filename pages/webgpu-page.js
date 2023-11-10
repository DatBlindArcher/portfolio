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

define('webgpu-page', template, class extends Base {
    #device;
    #context;
    #canvasFormat;
    #timestamp;
    #timeBuffer;

    #geometry;

    async created() {
        this.#timestamp = 0;
        var result = await this.initializeGpu();

        if (result != undefined) {
            let error = this.find(".error");
            error.innerHTML = result;
            error.classList.remove('hidden');
            return;
        }

        this.initializeGeometry();
        this.update(0);
    }

    update(time) {
        const deltaTime = Math.min(time - this.#timestamp, 500);
        this.#timestamp = time;
        this.find(".fps").innerHTML = `${Math.trunc(1000 / deltaTime)} FPS`;

        // Update TimeBuffer
        const timeData = new Float32Array([time]);
        this.#device.queue.writeBuffer(this.#timeBuffer, 0, timeData);

        const encoder = this.#device.createCommandEncoder();
        
        // Clear the Canvas
        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: this.#context.getCurrentTexture().createView(),
                loadOp: "clear",
                clearValue: { r: 0, g: 0, b: 0.4, a: 1 },
                storeOp: "store",
            }]
        });

        // Draw Geometry
        pass.setPipeline(this.#geometry.pipeline);
        pass.setBindGroup(0, this.#geometry.bindGroup); 
        pass.setVertexBuffer(0, this.#geometry.vertexBuffer);
        pass.draw(this.#geometry.vertexCount);

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

        this.#timeBuffer = this.#device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });
    }

    initializeGeometry() {
        const vertices = new Float32Array([
            -0.8, -0.8, // Triangle 1 (Blue)
            0.8, -0.8,
            0.8,  0.8,
        
            -0.8, -0.8, // Triangle 2 (Red)
            0.8,  0.8,
            -0.8,  0.8,
        ]);

        const vertexBuffer = this.#device.createBuffer({
            label: "Cell vertices",
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.#device.queue.writeBuffer(vertexBuffer, 0, vertices);

        const vertexBufferLayout = {
            arrayStride: 8,
            attributes: [{
                format: "float32x2",
                offset: 0,
                shaderLocation: 0
            }],
        };

        const cellShaderModule = this.#device.createShaderModule({
            label: 'Cell shader',
            code: `
                @group(0) @binding(0) var<uniform> time : f32;

                @vertex
                fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
                    return vec4f(pos, 0, 1);
                }
          
                @fragment
                fn fragmentMain(@builtin(position) pos: vec4f) -> @location(0) vec4f {
                    var speed = .001;
                    var s = (sin(time * speed) + 1) / 2;
                    var c = (cos(time * speed) + 1) / 2;
                    var t = (tan(time * speed) + 1) / 2;
                    var h = 800.0; 
                    return vec4f(s * pos.x / h, s * 1 - pos.y / h, 0, 1);
                }
            `
        });

        const bindGroupLayout = this.#device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {}
            }]
        });

        const bindGroup = this.#device.createBindGroup({
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: this.#timeBuffer },
            }]
        });

        const pipelineLayout = this.#device.createPipelineLayout({
            bindGroupLayouts: [
                bindGroupLayout
            ]
        });

        const cellPipeline = this.#device.createRenderPipeline({
            label: "Cell pipeline",
            layout: pipelineLayout,
            vertex: {
                module: cellShaderModule,
                entryPoint: "vertexMain",
                buffers: [vertexBufferLayout]
            },
            fragment: {
                module: cellShaderModule,
                entryPoint: "fragmentMain",
                targets: [{
                    format: this.#canvasFormat
                }]
            }
        });

        this.#geometry = {
            pipeline: cellPipeline,
            bindGroup,
            vertexBuffer,
            vertexCount: vertices.length / 2
        };
    }
});