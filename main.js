// script.js
// 定义常量，表示球的数量、最小和最大尺寸以及最大速度
const BALLS_COUNT = 25;
const BALL_SIZE_MIN = 10;
const BALL_SIZE_MAX = 20;
const BALL_SPEED_MAX = 7;

// 基础的形状类
class Shape {
    constructor(x, y, velX, velY, exists) {
        this.x = x;  //x坐标
        this.y = y; //y坐标
        this.velX = velX; //x方向速度
        this.velY = velY; //y方向速度
        this.exists = exists; //是否存在
    }
}

// 球类
class Ball extends Shape {
    constructor(x, y, velX, velY, color, size, exists) {
        super(x, y, velX, velY, exists);

        this.color = color;
        this.size = size;
    }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.fill();
    }

    update() {
        if (this.x + this.size >= width) {
            this.velX = -this.velX;
        }

        if (this.x - this.size <= 0) {
            this.velX = -this.velX;
        }

        if (this.y + this.size >= height) {
            this.velY = -this.velY;
        }

        if (this.y - this.size <= 0) {
            this.velY = -this.velY;
        }

        this.x += this.velX;
        this.y += this.velY;
    }

    collisionDetect() {
        for (let j = 0; j < balls.length; j++) {
            if (!(this === balls[j])) {
                const dx = this.x - balls[j].x;
                const dy = this.y - balls[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.size + balls[j].size && balls[j].exists) {
                    balls[j].color = this.color = randomColor();
                }
            }
        }
    }
}

// 邪恶圈类
class EvilCircle extends Shape {
    constructor(x, y, exists) {
        super(x, y, exists);

        this.velX = BALL_SPEED_MAX;
        this.velY = BALL_SPEED_MAX;
        this.color = "white";
        this.size = 10;
        this.setControls();
    }

    draw() {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        ctx.stroke();
    }

    checkBounds() {
        if (this.x + this.size >= width) {
            this.x -= this.size;
        }

        if (this.x - this.size <= 0) {
            this.x += this.size;
        }

        if (this.y + this.size >= height) {
            this.y -= this.size;
        }

        if (this.y - this.size <= 0) {
            this.y += this.size;
        }
    }

    // 方法：设置键盘事件来控制“邪恶圆”的移动
    setControls() {
        // 创建一个对象来存储按键状态
        this.keys = {
            ArrowLeft: false,
            ArrowUp: false,
            ArrowRight: false,
            ArrowDown: false,
            KeyW: false,
            KeyA: false,
            KeyS: false,
            KeyD: false
        };

        // 监听键盘按下事件
        window.onkeydown = (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = true;
            }
        };

        // 监听键盘释放事件
        window.onkeyup = (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = false;
            }
        };

        // 使用requestAnimationFrame来平滑处理移动
        const move = () => {
            // 根据按键状态更新位置
            if (this.keys.ArrowLeft || this.keys.KeyA) {
                this.x -= this.velX;
            }
            if (this.keys.ArrowUp || this.keys.KeyW) {
                this.y -= this.velY;
            }
            if (this.keys.ArrowRight || this.keys.KeyD) {
                this.x += this.velX;
            }
            if (this.keys.ArrowDown || this.keys.KeyS) {
                this.y += this.velY;
            }

            // 确保EvilCircle不会超出画布的边界
            this.x = Math.min(canvas.width - this.size, Math.max(this.size, this.x));
            this.y = Math.min(canvas.height - this.size, Math.max(this.size, this.y));

            // 请求下一帧动画
            requestAnimationFrame(move);
        };

        // 开始移动
        move();
    }


    collisionDetect() {
        for (let j = 0; j < balls.length; j++) {
            if (balls[j].exists) {
                const dx = this.x - balls[j].x;
                const dy = this.y - balls[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.size + balls[j].size) {
                    balls[j].exists = false;
                    count--;
                    para.textContent = "还剩 " + count + " 个球";
                }
            }
        }
    }
}

// 获取页面中的p元素和canvas元素
const para = document.querySelector("p");
const canvas = document.querySelector("canvas");
// 获取canvas的2D渲染上下文
const ctx = canvas.getContext("2d");

// 设置canvas的宽度和高度为窗口的宽度和高度
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// 创建一个数组来存储所有的球
const balls = [];
let count = 0; // 计数器，可能用于跟踪某些事件

// 创建一个“邪恶圈”实例，位置随机
const evilBall = new EvilCircle(
    random(0, width),
    random(0, height),
    true,
);

// 开始游戏循环
loop();

// 生成一个指定范围内的随机数
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

// 生成一个随机颜色
function randomColor() {
    return (
        "rgb(" +
        random(0, 255) +
        ", " +
        random(0, 255) +
        ", " +
        random(0, 255) +
        ")"
    );
}

// 游戏主循环函数
function loop() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fillRect(0, 0, width, height);

    while (balls.length < BALLS_COUNT) {
        const size = random(BALL_SIZE_MIN, BALL_SIZE_MAX);
        const ball = new Ball(
            random(0 + size, width - size),
            random(0 + size, height - size),
            random(-BALL_SPEED_MAX, BALL_SPEED_MAX),
            random(-BALL_SPEED_MAX, BALL_SPEED_MAX),
            randomColor(),
            size,
            true,
        );
        balls.push(ball);
        count++;
        para.textContent = "还剩 " + count + " 个球";
    }

    for (let i = 0; i < balls.length; i++) {
        if (balls[i].exists) {
            balls[i].draw();
            balls[i].update();
            balls[i].collisionDetect();
        }
    }

    evilBall.draw();
    evilBall.checkBounds();
    evilBall.collisionDetect();

    requestAnimationFrame(loop);
}
