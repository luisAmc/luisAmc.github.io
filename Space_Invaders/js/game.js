var game = new Game();
function init() {
    if (game.init())
        game.start();
}

/*
    Variable que contendra todas las images.
    Se le conoce como "singleton", porque las 
    imagenes solo se crean una vez.
*/
var imageRepository = new function() {
    this.background = new Image();
    this.ship = new Image();
    this.bullet = new Image();
    this.alien = new Image();
    this.alienBullet = new Image();
    this.boss = new Image();
    this.bossBullet = new Image();
    //this.lifebar = new Image();
    
    var numImages = 7;
    var numLoaded = 0;
    function imageLoaded() {
        numLoaded++;
        console.log("numLoaded = " + numLoaded);
        if (numLoaded === numImages) {
            console.log("window.init()");
            window.init();
        }
    }
    this.background.onload = function() {
        imageLoaded();
    }
    this.ship.onload = function() {
        imageLoaded();
    }
    this.bullet.onload = function() {
        imageLoaded();
    }
    this.alien.onload = function() {
        imageLoaded();
    }
    this.alienBullet.onload = function() {
        imageLoaded();
    }
    this.boss.onload = function() {
        imageLoaded();
    }
    this.bossBullet.onload = function() {
        imageLoaded();
    }
    //this.lifebar.onload = function() {
    //    imageLoaded();
    //}
    
    this.background.src = "images/background.png";
    this.ship.src = "images/ship2.png";
    this.bullet.src = "images/bullets/bullet.png";
    this.alien.src = "images/aliens/alien2.png";
    this.alienBullet.src = "images/bullets/bullet_alien.png  ";
    this.boss.src = "images/aliens/boss.png";
    this.bossBullet.src = "images/bullets/bullet_boss.png";
    //this.lifebar.src = "images/lifebar/lifebar00.png";
}

/* 
    Drawable class
    Sera el parent de todos lo objetos que se dibujan
    en el juego.
*/
function Drawable() {
    this.init = function(x, y, width, height) {
        this.x = x; 
        this.y = y;
        this.width = width;
        this.height = height;
        console.log("init del boss");
    }

    this.speed = 0;
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.collidableWith = "";
    this.isColliding = false; //Cuando sea true no se dibujara.
    this.type = "";
    
    //Funcion abstracta
    this.draw = function() {};
    this.move = function() {};
    this.isCollidableWith = function(object) {
        return (this.collidableWith === object.type);
    };
}

//Background class
function Background() {
    this.speed = 1;
    this.draw = function() {
        this.y += this.speed;
        this.context.drawImage(imageRepository.background, this.x, this.y);
        this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);
    
        if (this.y >= this.canvasHeight)
            this.y = 0;
    };
}
Background.prototype = new Drawable();

//Bullet class
function Bullet(object) {
    this.alive = false;
    var self = object;
    
    this.spawn = function(x, y, speed) {
        this.x = x;
        this.y = y; 
        this.speed = speed * 1.5;
        this.alive = true;
    };
    
    this.draw = function() {
        this.context.clearRect(this.x - 1, this.y - 1, this.width + 2, this.height + 2);
        this.y -= this.speed;
        if (this.isColliding) 
            return true;
        else if (self === "bullet" && this.y <= 0 - this.height)
            return true;
        else if (self === "alienBullet" && this.y >= this.canvasHeight)
            return true;
        else {
            if (self === "bullet")
                this.context.drawImage(imageRepository.bullet, this.x, this.y);
            else if (self === "alienBullet")
                this.context.drawImage(imageRepository.alienBullet, this.x, this.y);
            return false;
        }
    };
    
    this.clear = function() {
        this.x = 0;
        this.y = 0;
        this.speed = 0;
        this.alive = false;
        this.isColliding = false;
    };
}
Bullet.prototype = new Drawable();

//Pool class
function Pool(maxSize) {
    var size = maxSize;
    var pool = [];
    this.init = function(object) {
        if (object == "bullet") {
             for (var index = 0; index < size; index++) {
                var bullet = new Bullet("bullet");
                bullet.init(0, 0, imageRepository.bullet.width, imageRepository.bullet.height);
                bullet.collidableWith = "alien";
                bullet.type = "bullet";
                pool[index] = bullet;
            }
        } else if (object == "alien") {
            for (var index = 0; index < size; index++) {
                var alien = new Alien();
                alien.init(0, 0, imageRepository.alien.width, imageRepository.alien.height);
                pool[index] = alien;
            }   
        } else if (object == "alienBullet") {
            for (var index = 0; index < size; index++) {
                var bullet = new Bullet("alienBullet");
                bullet.init(0, 0, imageRepository.alienBullet.width, imageRepository.alienBullet.height);
                bullet.collidableWith = "ship";
                bullet.type = "alienBullet";
                pool[index] = bullet;
            }
        }
    };
    
    this.getPool = function() {
        var object = [];
        for (var index = 0; index < size; index++) 
            if (pool[index].alive) 
                object.push(pool[index]);
        
        return object;
    };
    
    this.get = function(x, y, speed) {
        if (!pool[size - 1].alive) {
            pool[size - 1].spawn(x, y, speed);
            pool.unshift(pool.pop());
        }
    };
    
    this.getTwo = function(x1, y1, speed1, x2, y2, speed2) {
        if (!pool[size - 1].alive && !pool[size - 2].alive) {
            this.get(x1, y1, speed1);
            this.get(x2, y2, speed2);
        }
    };
    
    this.animate  = function() {
        for (var index = 0; index < size; index++) {
            if (pool[index].alive) {
                if (pool[index].draw()) {
                    pool[index].clear();
                    pool.push((pool.splice(index, 1))[0]);
                }
            } else 
                break;
        }
    };   
}

//Ship class
function Ship() {
    this.alive = false;
    this.speed = 5;
    this.bulletPool = new Pool(30);
    this.bulletPool.init("bullet");
    var fireRate = 15; //Cada 15 frames dispara
    var counter = 0; //Contador para saber cuando disparar
    this.collidableWith = "alienBullet";
    this.type = "ship";
    
    this.draw = function() {
        this.context.drawImage(imageRepository.ship, this.x, this.y);
    };
    
    this.move = function() {
        counter++;
        if (KEY_STATUS.left || KEY_STATUS.right || KEY_STATUS.down ||
           KEY_STATUS.up) {
            this.context.clearRect(this.x, this.y, this.width, this.height);
            if (KEY_STATUS.left) {
                this.x -= this.speed;
                if (this.x <= 0)
                    this.x = 0;
            } else if (KEY_STATUS.right) {
                this.x += this.speed;
                if (this.x >= this.canvasWidth - this.width)
                    this.x = this.canvasWidth - this.width;
            } else if (KEY_STATUS.up) {
                this.y -= this.speed;
                if (this.y <= this.canvasHeight / 2)
                    this.y = this.canvasHeight / 2;
            } else if (KEY_STATUS.down) {
                this.y += this.speed;
                if (this.y >= this.canvasHeight - this.height)
                    this.y = this.canvasHeight - this.height;
            }
            
            if (!this.isColliding)
                this.draw();
            else 
                this.alive = false;
            
        }
        if ((KEY_STATUS.space) && (counter >= fireRate) && (!this.isColliding)) {
            this.fire();
            counter = 0;
        }
    };
    
    this.fire = function() {
        this.bulletPool.getTwo(this.x + 7, this.y, 4, this.x + 63, this.y, 4);
    };
}
Ship.prototype = new Drawable();

//Alien class
function Alien() {
    var percentFire = 0.01;
    var chance = 0;
    this.alive = false;
    this.collidableWith = "bullet";
    this.type = "alien";
    
    this.spawn = function(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed * 1.5;
        this.speedX = speed / 1.5;
        this.speedY = speed / 3;
        this.alive = true;
        this.leftEdge = this.x - 90;
        this.rightEdge = this.x + 410;
        this.bottomEdge = game.mainCanvas.height;
    };
    
    this.draw = function() {
        console.log("this.y ", this.y);
        console.log("this.bottomEdge ", this.bottomEdge);
        this.context.clearRect(this.x - 1, this.y, this.width + 2, this.height);
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x <= this.leftEdge)
            this.speedX = this.speed;
        else if (this.x >= this.rightEdge + this.width)
            this.speedX = -this.speed;
        else if (this.y >= this.bottomEdge - this.height) {
            game.gameOver();
        }
        
        if (!this.isColliding) {
            this.context.drawImage(imageRepository.alien, this.x, this.y);

            chance = Math.floor(Math.random() * 101);
            if ((chance / 100) < percentFire) 
                this.fire();
            
            return false;
        } else {
            game.score += 1;
            return true;
        }
       
    };
    
    this.fire = function() {
        game.alienBulletPool.get(this.x + this.width / 2, this.y +this.height, -2.5);
    };
    
    this.clear = function() {
        this.x = 0; 
        this.y = 0;
        this.speed = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.alive = false;
        this.isColliding = false;
    };
}
Alien.prototype = new Drawable();

//Boss class
function Boss() {
    var percentFire = .03;
    var chance = 0;
    this.alive = false;
    this.collidableWith = "bullet";
    this.type = "boss";
    this.lifes = 50;
 
    this.spawn = function(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.speedX = speed / 1.8;
        this.speedY = speed / 2;
        this.alive = true;
        this.leftEdge = this.x - 90;
        this.rightEdge = this.x + 410;
        this.bottomEdge = game.mainCanvas - imageRepository.boss.height;
    };
    
    this.draw = function() {
        this.context.clearRect(this.x - 1, this.y, this.width + 2, this.height);
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x <= this.leftEdge)
            this.speedX = this.speed;
        else if (this.x >= this.rightEdge + this.width)
            this.speedX = -this.speed;
        else if (this.y + imageRepository.boss.height >= this.bottomEdge) {
            game.gameOver();
        }
        
        if (this.lifes > 0) {
            this.context.drawImage(imageRepository.boss, this.x, this.y);

            chance = Math.floor(Math.random() * 101);
            if ((chance / 100) < percentFire) 
                this.fire();
            
            return false;
        } else {
            this.life--;
            return true;
        }
       
    };
    
    this.fire = function() {
        game.alienBulletPool.get(this.x + this.width / 2, this.y +this.height, -2.5);
    };
    
    this.clear = function() {
        this.x = 0; 
        this.y = 0;
        this.speed = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.alive = false;
        this.isColliding = false;
    };
}
Boss.prototype = new Drawable();

//Game class
function Game() {
    this.init = function() {
        this.score = 0;
        
        this.backgroundCanvas = document.getElementById("background");
        this.shipCanvas = document.getElementById("ship");
        this.mainCanvas = document.getElementById("main");
        
        if (this.backgroundCanvas.getContext) {
            this.backgroundContext = this.backgroundCanvas.getContext("2d");
            this.shipContext = this.shipCanvas.getContext("2d");
            this.mainContext = this.mainCanvas.getContext("2d");
            
            Background.prototype.context = this.backgroundContext;
            Background.prototype.canvasWidth = this.backgroundCanvas.width;
            Background.prototype.canvasHeight = this.backgroundCanvas.height;
            
            Ship.prototype.context = this.shipContext;
            Ship.prototype.canvasWidth = this.shipCanvas.width;
            Ship.prototype.canvasHeight = this.shipCanvas.height;
            
            Bullet.prototype.context = this.mainContext;
            Bullet.prototype.canvasWidth = this.mainCanvas.width;
            Bullet.prototype.canvasHeight = this.mainCanvas.height;
            
            Alien.prototype.context = this.mainContext;
            Alien.prototype.canvasWidth = this.mainCanvas.width;
            Alien.prototype.canvasHeight = this.mainCanvas.height;
            
            Boss.prototype.context = this.mainContext;
            Boss.prototype.canvasWidth = this.mainCanvas.width;
            Boss.prototype.canvasHeight = this.mainCanvas.height;
            
            this.background = new Background();
            this.background.init(0, 0);
            
            this.spawnShip();
            this.spawnBoss();
            
            this.alienPool = new Pool(30);
            this.alienPool.init("alien");
            this.spawnAliens();
                 
            this.alienBulletPool = new Pool(50);
            this.alienBulletPool.init("alienBullet");
            this.spacialPartition = new SpacialPartition({
                x: 0,
                y: 0,
                width: this.mainCanvas.width, 
                height: this.mainCanvas.height
            });
            
            return true; //Se creo todo con exito
        } else 
            return false;
    };
    
    this.spawnShip = function() {
        this.ship = new Ship();
        this.ship.alive = true;
        this.ship.isColliding = false;
        var shipStartX = this.shipCanvas.width / 2 - imageRepository.ship.width;
        var shipStartY = this.shipCanvas.height - imageRepository.ship.height;
        this.ship.init(shipStartX, shipStartY, imageRepository.ship.width,
                       imageRepository.ship.height);
    };
    
    this.spawnBoss = function() {
        this.boss = new Boss();
        this.boss.alive = true;
        this.boss.isColliding = false;
        var bossStartX = this.mainCanvas.width / 2 - imageRepository.boss.width;
        var bossStartY = 0;
        this.boss.init(bossStartX, bossStartY, imageRepository.boss.width,
                       imageRepository.boss.height);
    };
    
    this.spawnAliens = function() {
        var width = imageRepository.alien.width;
        var height = imageRepository.alien.height;
        var x = 100;
        var y = -height;
        var spacer = y * 1.5;
        for (var index = 1; index <= 24; index++) {
            this.alienPool.get(x, y, 2);
            x += width + 25;
            if (index % 6 == 0) {
                x = 100;
                y += spacer;
            }
        }
    };
    
    this.start = function() {
        this.spawnShip()
        this.ship.draw();
        animate();
    };
    
    this.startGame = function() {
        document.getElementById("startMenu").style.display = "none";
        this.backgroundContext.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
        this.shipContext.clearRect(0, 0, this.shipCanvas.width, this.shipCanvas.height);
        this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        this.spacialPartition.clear();
        this.background.init(0, 0);
        this.ship.init(this.shipStartX, this.shipStartY, imageRepository.ship.width, imageRepository.ship.height);
        this.alienPool.init("alien");
        this.spawnAliens();
        this.alienBulletPool.init("alienBullet");
        this.score = 0;
        
        this.start();
    }
    
    this.gameOver = function() {
        document.getElementById("game-over").style.display = "block";
    };
    
    this.restart = function() {
        document.getElementById("game-over").style.display = "none";
        this.backgroundContext.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
        this.shipContext.clearRect(0, 0, this.shipCanvas.width, this.shipCanvas.height);
        this.mainContext.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
        this.spacialPartition.clear();
        this.background.init(0, 0);
        this.ship.init(this.shipStartX, this.shipStartY, imageRepository.ship.width, imageRepository.ship.height);
        this.alienPool.init("alien");
        this.spawnAliens();
        this.alienBulletPool.init("alienBullet");
        this.score = 0;
        
        this.start();
    };
}

//Animate class
function animate() {
    document.getElementById("score").innerHTML = game.score;
    
    game.spacialPartition.clear();
    game.spacialPartition.insert(game.ship);
    game.spacialPartition.insert(game.ship.bulletPool.getPool());
    game.spacialPartition.insert(game.alienPool.getPool());
    game.spacialPartition.insert(game.alienBulletPool.getPool());
    game.spacialPartition.insert(game.boss);
    detectCollision();
    
    if (game.score == 54) {
        console.log("tengo que spawner al boss");
        if (game.boss.lifes > 0) {
            console.log("voy a spawner al boss");
            game.boss.draw();
        }
    } else if (game.alienPool.getPool().length === 0)
        game.spawnAliens();
    
    if (game.ship.alive)
        requestAnimFrame(animate);
    else
        game.gameOver();
    
    game.background.draw();
    game.ship.move();
    game.ship.bulletPool.animate();
    game.alienPool.animate();
    game.alienBulletPool.animate();
}

//detectCollision method
function detectCollision() {
    var objects = [];
    game.spacialPartition.getAllObjects(objects);
    for (var x = 0, len = objects.length; x < len; x++) {
        game.spacialPartition.findObjects(obj = [], objects[x]);
        for (y = 0, length = obj.length; y < length; y++) {
            if (objects[x].collidableWith === obj[y].type &&
                (objects[x].x < obj[y].x + obj[y].width &&
                 objects[x].x + objects[x].width > obj[y].x &&
                 objects[x].y < obj[y].y + obj[y].height &&
                 objects[x].y + objects[x].height > obj[y].y)) {
                    objects[x].isColliding = true;
                    obj[y].isColliding = true;
            }
        }
    }
};

//QuadTree - spacial partition
function SpacialPartition(container, levelX) {
    var maxObjectsPerCuadrant = 10;
    this.bounds = container;
    var objects = [];
    this.nodes = [];
    var level = levelX || 0;
    var maxLevels = 5;

    this.clear = function() {
        objects = [];
        for (var index = 0; index < this.nodes.length; index++) 
            this.nodes[index].clear();
        this.nodes = [];
    };

    this.getAllObjects = function(allTheObjects) {
        for (var index = 0; index < this.nodes.length; index++) 
            this.nodes[index].getAllObjects(allTheObjects);
        for (var index = 0, length = objects.length; index < length; index++) 
            allTheObjects.push(objects[index]);
        return allTheObjects;
    };

    this.findObjects = function(canCollideWith, objectX) {
        var cuadrant = this.getCuadrant(objectX);
        if (cuadrant != -1 && this.nodes.length) 
            this.nodes[cuadrant].findObjects(canCollideWith, objectX);
        for (var i = 0, length = objects.length; i < length; i++) 
            canCollideWith.push(objects[i]);
        return canCollideWith;
    };

    this.insert = function(obj) {
        if (obj instanceof Array) {
            for (var index = 0, length = obj.length; index < length; index++) 
                this.insert(obj[index]);
            return;
        }
        if (this.nodes.length) {
            var index = this.getCuadrant(obj);
            if (index != -1) {
                this.nodes[index].insert(obj);
                return;
            }
        }
        objects.push(obj);
        if (objects.length > maxObjectsPerCuadrant && level < maxLevels) {
            if (this.nodes[0] == null) 
                this.split();
            
            var i = 0;
            while (i < objects.length) {
                var cuadrant = this.getCuadrant(objects[i]);
                if (cuadrant != -1) 
                    this.nodes[cuadrant].insert((objects.splice(i,1))[0]); //Splice (index, cantElements, *newElements*)
                else 
                    i++;
            }
        }
    };

    this.getCuadrant = function(obj) {
        var index = -1;
        var verticalMidpoint = this.bounds.x + this.bounds.width / 2;
        var horizontalMidpoint = this.bounds.y + this.bounds.height / 2;
        var topQuadrant = (obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint);
        var bottomQuadrant = (obj.y > horizontalMidpoint);

        if (obj.x < verticalMidpoint && obj.x + obj.width < verticalMidpoint) {
            if (topQuadrant) 
                index = 1;
            else if (bottomQuadrant) 
                index = 2;
        } else if (obj.x > verticalMidpoint) {
            if (topQuadrant) 
                index = 0;
            else if (bottomQuadrant) 
                index = 3;
        }
        return index;
    };

    this.split = function() {
        var subWidth = (this.bounds.width / 2);
        var subHeight = (this.bounds.height / 2);

        this.nodes[0] = new SpacialPartition({
            x: this.bounds.x + subWidth,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level + 1);
        this.nodes[1] = new SpacialPartition({
            x: this.bounds.x,
            y: this.bounds.y,
            width: subWidth,
            height: subHeight
        }, level + 1);
        this.nodes[2] = new SpacialPartition({
            x: this.bounds.x,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level + 1);
        this.nodes[3] = new SpacialPartition({
            x: this.bounds.x + subWidth,
            y: this.bounds.y + subHeight,
            width: subWidth,
            height: subHeight
        }, level + 1);
    };
}

KEY_CODES = {
    32: 'space',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
}

KEY_STATUS = {};
for (code in KEY_CODES) {
     KEY_STATUS[KEY_CODES[code]] = false;
}

document.onkeydown = function(e) {
    var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
    if (KEY_CODES[keyCode]) {
        e.preventDefault();
        KEY_STATUS[KEY_CODES[keyCode]] = true;
    }
}

document.onkeyup = function(e) {
    var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
    if (KEY_CODES[keyCode]) {
        e.preventDefault();
        KEY_STATUS[KEY_CODES[keyCode]] = false;
    }
}

window.requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 16);
        };
})();