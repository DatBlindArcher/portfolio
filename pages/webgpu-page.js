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
    #projBuffer;
    #viewBuffer;
    #viewBuffer2;
    #depthTexture;
    #bindGroupLayout;

    #geometry;
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

        this.initializeGeometry();
        this.#sphere = this.sphere(1, 16, 32);
        this.update(0);
    }

    update(time) {
        const deltaTime = Math.min(time - this.#timestamp, 500);
        this.#timestamp = time;
        this.find(".fps").innerHTML = `${Math.trunc(1000 / deltaTime)} FPS`;

        // Update TimeBuffer
        const timeData = new Float32Array([time]);
        this.#device.queue.writeBuffer(this.#timeBuffer, 0, timeData);

        // Update ViewMatrix
        this.#device.queue.writeBuffer(this.#viewBuffer, 0, this.transformationMatrix(time, -2));
        this.#device.queue.writeBuffer(this.#viewBuffer2, 0, this.transformationMatrix(time, 2));

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

        // Draw Geometry
        pass.setPipeline(this.#geometry.pipeline);
        pass.setBindGroup(0, this.#geometry.bindGroup);
        pass.setVertexBuffer(0, this.#geometry.vertexBuffer);
        pass.draw(this.#geometry.vertexCount);

        // Draw Sphere
        pass.setBindGroup(0, this.#sphere.bindGroup);
        pass.setVertexBuffer(0, this.#sphere.vertexBuffer);
        pass.setIndexBuffer(this.#sphere.indexBuffer, "uint32");
        pass.drawIndexed(this.#sphere.indexCount);

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

        this.#projBuffer = this.#device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });

        this.#viewBuffer = this.#device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });

        this.#viewBuffer2 = this.#device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        });

        let perspective = this.perspective(60.0, 1, .2, 100);
        this.#device.queue.writeBuffer(this.#projBuffer, 0, perspective);
    }

    initializeGeometry() {
        const vertices = new Float32Array([
             1,-1, 1,  
            -1,-1, 1, 
            -1,-1,-1,
             1,-1,-1, 
             1,-1, 1,  
            -1,-1,-1,
          
             1, 1, 1,  
             1,-1, 1, 
             1,-1,-1,
             1, 1,-1, 
             1, 1, 1,  
             1,-1,-1,
          
            -1, 1, 1,
             1, 1, 1, 
             1, 1,-1,
            -1, 1,-1,
            -1, 1, 1,
             1, 1,-1,
          
            -1,-1, 1, 
            -1, 1, 1,  
            -1, 1,-1, 
            -1,-1,-1,
            -1,-1, 1, 
            -1, 1,-1, 
          
             1, 1, 1,  
            -1, 1, 1, 
            -1,-1, 1,
            -1,-1, 1,
             1,-1, 1, 
             1, 1, 1,  
          
             1,-1,-1, 
            -1,-1,-1,
            -1, 1,-1, 
             1, 1,-1,  
             1,-1,-1, 
            -1, 1,-1, 
        ]);

        const vertexBuffer = this.#device.createBuffer({
            label: "Cell vertices",
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        this.#device.queue.writeBuffer(vertexBuffer, 0, vertices);

        const shader = this.#device.createShaderModule({
            label: 'Cell shader',
            code: `
                @group(0) @binding(0) var<uniform> proj : mat4x4<f32>;
                @group(0) @binding(1) var<uniform> view : mat4x4<f32>;
                @group(0) @binding(2) var<uniform> time : f32;

                struct VertexOutput {
                    @builtin(position) screenPos : vec4<f32>,
                    @location(1) worldPos : vec3<f32>,
                    @location(2) objectPos: vec3<f32>
                }
                
                @vertex
                fn vertexMain(@location(0) pos: vec3f) -> VertexOutput {
                    var output : VertexOutput;
                    output.screenPos = proj * view * vec4(pos, 1);
                    var w = view * vec4(pos, 1);
                    output.worldPos = w.xyz;
                    output.objectPos = pos;
                    return output;
                }
          
                @fragment
                fn fragmentMain(@location(1) worldPos: vec3f, @location(2) objectPos: vec3f) -> @location(0) vec4f {
                    var speed = .002;
                    var t = (sin((time + -worldPos.x * 200) * speed) + 1) / 2;
                    return vec4f(t * abs(objectPos.x), t * abs(objectPos.y), t * abs(objectPos.z), t);
                }
            `
        });

        this.#bindGroupLayout = this.#device.createBindGroupLayout({
            entries: [{
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {}
            },{
                binding: 1,
                visibility: GPUShaderStage.VERTEX,
                buffer: {}
            },{
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                buffer: {}
            }]
        });

        const bindGroup = this.#device.createBindGroup({
            layout: this.#bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: this.#projBuffer },
            },{
                binding: 1,
                resource: { buffer: this.#viewBuffer },
            },{
                binding: 2,
                resource: { buffer: this.#timeBuffer },
            }]
        });

        const pipelineLayout = this.#device.createPipelineLayout({
            bindGroupLayouts: [
                this.#bindGroupLayout
            ]
        });

        const pipeline = this.#device.createRenderPipeline({
            label: "Cell pipeline",
            layout: pipelineLayout,
            vertex: {
                module: shader,
                entryPoint: "vertexMain",
                buffers: [{
                    arrayStride: 12,
                    attributes: [{
                        format: "float32x3",
                        offset: 0,
                        shaderLocation: 0
                    }],
                }]
            },
            fragment: {
                module: shader,
                entryPoint: "fragmentMain",
                targets: [{
                    format: this.#canvasFormat
                }]
            },
            primitive: {
              topology: 'triangle-list',
              cullMode: 'back'
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus'
            }
        });

        this.#geometry = {
            pipeline,
            bindGroup,
            vertexBuffer,
            vertexCount: vertices.length / 3
        };
    }

    transformationMatrix(time, x) {
        let viewMatrix = this.identity();
        this.translate(viewMatrix, x, 0, -10);
        this.rotate(viewMatrix, 0, 1, 0, time / 300);
        return viewMatrix;
    }

    identity() {
        let dst = new Float32Array(16);
      
        dst[ 0] = 1;  dst[ 1] = 0;  dst[ 2] = 0;  dst[ 3] = 0;
        dst[ 4] = 0;  dst[ 5] = 1;  dst[ 6] = 0;  dst[ 7] = 0;
        dst[ 8] = 0;  dst[ 9] = 0;  dst[10] = 1;  dst[11] = 0;
        dst[12] = 0;  dst[13] = 0;  dst[14] = 0;  dst[15] = 1;
      
        return dst;
    }

    perspective(fov, aspect, zNear, zFar) {
        let dst = new Float32Array(16);
        
        const f = Math.tan(Math.PI * 0.5 - 0.5 * (fov * (180 / Math.PI)));
        
        dst[0]  = f / aspect;
        dst[1]  = 0;
        dst[2]  = 0;
        dst[3]  = 0;
        
        dst[4]  = 0;
        dst[5]  = f;
        dst[6]  = 0;
        dst[7]  = 0;
        
        dst[8]  = 0;
        dst[9]  = 0;
        dst[11] = -1;
        
        dst[12] = 0;
        dst[13] = 0;
        dst[15] = 0;
        
        if (zFar === Infinity) {
            dst[10] = -1;
            dst[14] = -zNear;
        } else {
            const rangeInv = 1 / (zNear - zFar);
            dst[10] = zFar * rangeInv;
            dst[14] = zFar * zNear * rangeInv;
        }
        
        return dst;
    }

    translate(m, v0, v1, v2) {
        const m00 = m[0];
        const m01 = m[1];
        const m02 = m[2];
        const m03 = m[3];
        const m10 = m[1 * 4 + 0];
        const m11 = m[1 * 4 + 1];
        const m12 = m[1 * 4 + 2];
        const m13 = m[1 * 4 + 3];
        const m20 = m[2 * 4 + 0];
        const m21 = m[2 * 4 + 1];
        const m22 = m[2 * 4 + 2];
        const m23 = m[2 * 4 + 3];
        const m30 = m[3 * 4 + 0];
        const m31 = m[3 * 4 + 1];
        const m32 = m[3 * 4 + 2];
        const m33 = m[3 * 4 + 3];
      
        m[12] = m00 * v0 + m10 * v1 + m20 * v2 + m30;
        m[13] = m01 * v0 + m11 * v1 + m21 * v2 + m31;
        m[14] = m02 * v0 + m12 * v1 + m22 * v2 + m32;
        m[15] = m03 * v0 + m13 * v1 + m23 * v2 + m33;
    }

    multiply(a, b) {
        let dst = new Float32Array(16);
      
        const a00 = a[0];
        const a01 = a[1];
        const a02 = a[2];
        const a03 = a[3];
        const a10 = a[ 4 + 0];
        const a11 = a[ 4 + 1];
        const a12 = a[ 4 + 2];
        const a13 = a[ 4 + 3];
        const a20 = a[ 8 + 0];
        const a21 = a[ 8 + 1];
        const a22 = a[ 8 + 2];
        const a23 = a[ 8 + 3];
        const a30 = a[12 + 0];
        const a31 = a[12 + 1];
        const a32 = a[12 + 2];
        const a33 = a[12 + 3];
        const b00 = b[0];
        const b01 = b[1];
        const b02 = b[2];
        const b03 = b[3];
        const b10 = b[ 4 + 0];
        const b11 = b[ 4 + 1];
        const b12 = b[ 4 + 2];
        const b13 = b[ 4 + 3];
        const b20 = b[ 8 + 0];
        const b21 = b[ 8 + 1];
        const b22 = b[ 8 + 2];
        const b23 = b[ 8 + 3];
        const b30 = b[12 + 0];
        const b31 = b[12 + 1];
        const b32 = b[12 + 2];
        const b33 = b[12 + 3];
      
        dst[ 0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
        dst[ 1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
        dst[ 2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
        dst[ 3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
        dst[ 4] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
        dst[ 5] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
        dst[ 6] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
        dst[ 7] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
        dst[ 8] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
        dst[ 9] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
        dst[10] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
        dst[11] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
        dst[12] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
        dst[13] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
        dst[14] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
        dst[15] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
      
        return dst;
    }

    rotate(m, x, y, z, angle) {
        let dst = m;
        angle *= 180 / Math.PI;
      
        const n = Math.sqrt(x * x + y * y + z * z);
        x /= n;
        y /= n;
        z /= n;
        const xx = x * x;
        const yy = y * y;
        const zz = z * z;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const oneMinusCosine = 1 - c;
      
        const r00 = xx + (1 - xx) * c;
        const r01 = x * y * oneMinusCosine + z * s;
        const r02 = x * z * oneMinusCosine - y * s;
        const r10 = x * y * oneMinusCosine - z * s;
        const r11 = yy + (1 - yy) * c;
        const r12 = y * z * oneMinusCosine + x * s;
        const r20 = x * z * oneMinusCosine + y * s;
        const r21 = y * z * oneMinusCosine - x * s;
        const r22 = zz + (1 - zz) * c;
      
        const m00 = m[0];
        const m01 = m[1];
        const m02 = m[2];
        const m03 = m[3];
        const m10 = m[4];
        const m11 = m[5];
        const m12 = m[6];
        const m13 = m[7];
        const m20 = m[8];
        const m21 = m[9];
        const m22 = m[10];
        const m23 = m[11];
      
        dst[ 0] = r00 * m00 + r01 * m10 + r02 * m20;
        dst[ 1] = r00 * m01 + r01 * m11 + r02 * m21;
        dst[ 2] = r00 * m02 + r01 * m12 + r02 * m22;
        dst[ 3] = r00 * m03 + r01 * m13 + r02 * m23;
        dst[ 4] = r10 * m00 + r11 * m10 + r12 * m20;
        dst[ 5] = r10 * m01 + r11 * m11 + r12 * m21;
        dst[ 6] = r10 * m02 + r11 * m12 + r12 * m22;
        dst[ 7] = r10 * m03 + r11 * m13 + r12 * m23;
        dst[ 8] = r20 * m00 + r21 * m10 + r22 * m20;
        dst[ 9] = r20 * m01 + r21 * m11 + r22 * m21;
        dst[10] = r20 * m02 + r21 * m12 + r22 * m22;
        dst[11] = r20 * m03 + r21 * m13 + r22 * m23;
      
        return dst;
    }

    sphere(radius, latitudes, longitudes) {
        let vertices = [];
        let indices = [];

        var deltaLatitude = Math.PI / latitudes;
        var deltaLongitude = 2 * Math.PI / longitudes;

        // Compute all vertices first except normals
        for (var i = 0; i <= latitudes; i++) {
            var latitudeAngle = Math.PI / 2 - i * deltaLatitude; /* Starting -pi/2 to pi/2 */
            var xy = radius * Math.cos(latitudeAngle);    /* r * cos(phi) */
            var z = radius * Math.sin(latitudeAngle);     /* r * sin(phi )*/

            /*
            * We add (latitudes + 1) vertices per longitude because of equator,
            * the North pole and South pole are not counted here, as they overlap.
            * The first and last vertices have same position and normal, but
            * different tex coords.
            */
            for (var j = 0; j <= longitudes; j++) {
                var longitudeAngle = j * deltaLongitude;

                var x = xy * Math.cos(longitudeAngle);       /* x = r * cos(phi) * cos(theta)  */
                var y = xy * Math.sin(longitudeAngle);       /* y = r * cos(phi) * sin(theta) */
                var z = z;                               /* z = r * sin(phi) */

                vertices.push(x, y, z);
            }
        }

        /*
        *  Indices
        *  k1--k1+1
        *  |  / |
        *  | /  |
        *  k2--k2+1
        */
        for (var i = 0; i < latitudes; i++) {
            var k1 = i * (longitudes + 1);
            var k2 = k1 + longitudes + 1;

            // 2 Triangles per latitude block excluding the first and last longitudes blocks
            for (var j = 0; j < longitudes; ++j, ++k1, ++k2) {
                if (i != 0) {
                    indices.push(k1, k2, k1 + 1);
                }

                if (i != (latitudes - 1)) {
                    indices.push(k1 + 1, k2, k2 + 1);
                }
            }
        }

        const bindGroup = this.#device.createBindGroup({
            layout: this.#bindGroupLayout,
            entries: [{
                binding: 0,
                resource: { buffer: this.#projBuffer },
            },{
                binding: 1,
                resource: { buffer: this.#viewBuffer2 },
            },{
                binding: 2,
                resource: { buffer: this.#timeBuffer },
            }]
        });

        var entity = { 
            bindGroup,
            vertices: new Float32Array(vertices), 
            indices: new Int32Array(indices),
            indexCount: indices.length
        };

        entity.vertexBuffer = this.#device.createBuffer({
            label: "Cell vertices",
            size: entity.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

        entity.indexBuffer = this.#device.createBuffer({
            label: "Cell indices",
            size: entity.indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });

        this.#device.queue.writeBuffer(entity.vertexBuffer, 0, entity.vertices);
        this.#device.queue.writeBuffer(entity.indexBuffer, 0, entity.indices);

        return entity;
    }
});