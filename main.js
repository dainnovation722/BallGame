// setup canvas
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const showTime = document.querySelector('h2');

var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;

function resizeWindow() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeWindow);
const nHeart = 5;
const ul = document.querySelector('ul');
for (let i = 1; i <= nHeart; i++) {
    const li = document.createElement('li');
    li.setAttribute('class', 'hp' + i);
    li.textContent = "💛";
    ul.appendChild(li);
}




function random(min, max) {
    // function to generate random number
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num;
}

class Ball {
    constructor(x, y, velX, velY, color, size) {
        this.x = x;
        this.y = y;
        this.velX = velX;
        this.velY = velY;
        this.color = color;
        this.size = size;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.size, this.degToRad(0), this.degToRad(360));
        ctx.fill();
    }
    degToRad(angle) {
        return angle * Math.PI / 180;
    }
    update() {
        if ((this.x + this.size) >= width) {
            this.velX = -(this.velX);
        }
        if ((this.x - this.size) <= 0) {
            this.velX = -(this.velX);
        }
        if ((this.y + this.size) >= height) {
            this.velY = -(this.velY);
        }
        if ((this.y - this.size) <= 0) {
            this.velY = -(this.velY);
        }

        this.x += this.velX;
        this.y += this.velY;
    }
}

class PlayerBall extends Ball {
    constructor(x, y, velX, velY, color, size) {
        super(x, y, velX, velY, color, size);
        this.nCollision = 0;
        this.icon = new Image();
    }
    collisionDetect(balls) {
        let array = [];
        for (let j = 0; j < balls.length; j++) {
            if (!(this === balls[j])) {
                const dx = this.x - balls[j].x;
                const dy = this.y - balls[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.size + balls[j].size) {
                    // balls[j].coxlor = this.color = 'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')';
                    this.nCollision++;
                    array.push(j)
                }

            }
        }
        return array;
    }
    draw(ctx) {
        ctx.drawImage(this.icon, 0, 0, this.icon.naturalWidth, this.icon.naturalHeight,
            this.x - this.size, this.y - this.size, 2 * this.size, 2 * this.size);

    }
}


let balls = [];
let nBalls = 10;
// var nBalls = location.search.split("=")[1];

function returnBall() {
    let size = random(10, 20);
    let ball = new Ball(
        random(0 + size, width - size),
        random(0 + size, height - size),
        random(-7, 7),
        random(-7, 7),
        // 'rgba(255,0,255)',
        'rgb(' + random(0, 255) + ',' + random(0, 255) + ',' + random(0, 255) + ')',
        size
    );
    return ball;
}
while (balls.length < nBalls) {
    let ball = returnBall();
    balls.push(ball);
}

// Player Ball
let myball = new PlayerBall(100, 100, 0, 0, 'rgba(255,0,255)', 10);
myball.icon.src = 'img/face/smile.png';
myball.size = 20;


function mousemove(e) {
    myball.x = e.clientX;
    myball.y = e.clientY;
    myball.draw(ctx);
}
canvas.addEventListener('mousemove', mousemove);

function touchmove(e) {

    myball.x = e.changedTouches[0].clientX;
    myball.y = e.changedTouches[0].clientY;
    myball.draw(ctx);

}
canvas.addEventListener('touchmove', touchmove);


function updateHp(nCollision) {
    let li = document.querySelectorAll('li');
    li[nCollision - 1].textContent = '💙';
}

var counter = 0;
var myballDamage = 0;
var timeDamage = 0;
let nattacks = 0;
let time = 0;
let attackflag = false;

function loop() {

    // 時間更新 & キャンバス作成
    time = Math.floor(counter / 60);
    showTime.textContent = 'Time:' + time;
    if (!attackflag) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.25)';
    } else {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
    }
    ctx.fillRect(0, 0, width, height);


    // ゲーム終了条件
    if (myballDamage >= nHeart) {
        document.location.href = "gameover.html" + "?time=" + time;
        return;
    }

    // ボールのレンダリング
    for (let i = 0; i < balls.length; i++) {
        balls[i].update();
        balls[i].draw(ctx);
    }
    myball.update();
    myball.draw(ctx);


    // HP減少条件 
    collisionballs = myball.collisionDetect(balls);
    if (attackflag) {
        myball.nCollision = 0;
    }
    if (collisionballs.length) {
        myball.size += (balls[collisionballs[0]].size / 30);
    }
    console.log(collisionballs);
    if (counter > 60 && !attackflag) {

        // 1回以上の衝突 and 前回の衝突から1秒経過 => HPが1減少
        if (myball.nCollision > 0 && (counter - timeDamage) > 60) {
            timeDamage = counter;
            myballDamage++;
            updateHp(myballDamage);
        }

        // 前回の衝突から1秒以内 => ぴえんエフェクト
        if ((counter - timeDamage) <= 60) {
            myball.nCollision = 0;
            if ((counter - timeDamage) % 5 !== 0) {
                myball.icon.src = '';
            } else {
                myball.icon.src = 'img/face/pien.png';
            }
        } else {
            myball.icon.src = 'img/face/smile.png';
        }

    }


    // 攻撃
    if ((60 * 20) < counter && counter < (60 * 25)) {
        myball.icon.src = 'img/face/anger.png';
        balls.splice(collisionballs, collisionballs.length);
        attackflag = true;
    } else {
        attackflag = false;
    }

    // ボール増殖
    if (counter % 100 == 0) {
        balls.unshift(returnBall());
    }

    counter++;
    requestAnimationFrame(loop);

    console.log(counter);
}

loop();