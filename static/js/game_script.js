document.addEventListener("DOMContentLoaded", function () {

    const INVADER_ROWS = 5;
    const INVADER_COLS = 11;
    const BLOCK_HEIGHT = 52;
    const BLOCK_WIDTH = 32;
    const OFFSET_X = 70;
    const OFFSET_Y = 50;

    const INVADER_SPEED = 1100;

    const INVADER_MOVE_THRESHOLD = 0.5;
    //1100
    const INVADER_STEPS = 25;
    //26
    const INVADER_ROWS_MOVE = 5;

    const PLAYER_MOVE_SPEED = 250;
    const SCREEN_EDGE = 2;

    const BULLET_SPEED = 14000;
    // 30000

    const highscoresDiv = document.getElementById("highscores");

    const highscoresDivWidth = highscoresDiv.offsetWidth;

    kaboom({
        background: [0, 0, 0],
        debug: true,
        scale: 1,
        canvas: document.getElementById('game-canvas')
    });

    function calculateCanvasSize() {
        const canvas = document.getElementById('game-canvas');
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const windowHeight = window.innerHeight;
        const canvasHeight = windowHeight - navbarHeight;
        const canvasWidth = canvasHeight * (16 / 9);
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }

    calculateCanvasSize();
    window.addEventListener('resize', calculateCanvasSize);

    loadRoot("static/res/sprites")
    loadSprite("player", "/invaders/space__0006_Player.png")
    loadSprite("invader_A1", "/invaders/space__0004_C1.png")
    loadSprite("invader_A2", "/invaders/space__0005_C2.png")
    loadSprite("invader_B1", "/invaders/space__0002_B1.png")
    loadSprite("invader_B2", "/invaders/space__0003_B2.png")
    loadSprite("invader_C1", "/invaders/space__0000_A1.png")
    loadSprite("invader_C2", "/invaders/space__0001_A2.png")
    loadSprite("invader_explosion", "/invaders/space__0009_EnemyExplosion.png")

    scene("game", () => {

        const player = add([
            sprite("player"),
            scale(2),
            //origin("center"),
            pos(100, 600),
            area(),
            {
                score: 0,
                lives: 3,
            },
            "player",
        ]);

        onKeyPress("space", () => {
            console.log("Space key pressed");
            console.log("Pause status:", pause);
            
        });

        let pause = false;
        let bulletOnScreen = false;

        // Function to shoot bullets
        onKeyPress("space", () => {
            if (pause) return;
            if (!bulletOnScreen) { // Check if there's no bullet on the screen
                const bulletPosition = {
                    x: player.pos.x + 10,
                    y: player.pos.y
                };
                spawnBullet(bulletPosition, -1, "bullet");
                bulletOnScreen = true; // Set to true when bullet is fired
            }
        });

        // Function to spawn bullets
        function spawnBullet(bulletPos, direction, tag) {
            const bullet = add([
                rect(4, 12),
                pos(bulletPos.x + 14, bulletPos.y - 12), // Set initial position
                color(255, 255, 255),
                area(),
                "missile",
                tag,
                {
                    direction,
                    speed: BULLET_SPEED,
                },
            ]);

            bullet.onUpdate(() => {
                bullet.move(0, -2 * bullet.speed * dt()); // Move the bullet upwards
                if (bullet.pos.y < 0) { // If bullet goes off-screen, destroy it
                    destroy(bullet);
                    console.log("Bullet destroyed");
                }
            });

            bullet.on("destroy", () => { // Event handler for bullet destruction
                bulletOnScreen = false; // Set to false when bullet gets destroyed
            });

            let shaking = false;

            function resetShake() {
                shaking = false;
                camPos(800, 387.5); // Reset camera position to its original position
            }


            onCollide("bullet", "invader", (bullet, invader) => { // Collision detection with invaders
                destroy(bullet); // Destroy bullet
                bulletOnScreen = false;
                invader.exploded = true;
                invader.use(sprite("invader_explosion"));
            
                if (!shaking) { // Check if shake is not already active
                    resetShake(); // Reset any existing shake effect
                    shaking = true; // Set shaking to true to indicate shake is active
                    shake(4); // Apply new shake effect
                }

                wait(0.1, () => {
                    destroy(invader); // Destroy the invader after 1 second
                });
            });
            
        }

        function changeInvaderSprites() {
            const invaders = get("invader");
            for (const invader of invaders) {
                if (!invader.exploded) {
                    let newSprite;
                    switch (invader.spriteName) {
                        case "invader_A1":
                            newSprite = "invader_A2";
                            break;
                        case "invader_A2":
                            newSprite = "invader_A1";
                            break;
                        case "invader_B1":
                            newSprite = "invader_B2";
                            break;
                        case "invader_B2":
                            newSprite = "invader_B1";
                            break;
                        case "invader_C1":
                            newSprite = "invader_C2";
                            break;
                        case "invader_C2":
                            newSprite = "invader_C1";
                            break;
                        default:
                            newSprite = invader.spriteId;
                    }
                    invader.spriteName = newSprite;
                    invader.use(sprite(newSprite));
                }
            }
            console.log("Sprites changed");
        }

        let invaderMap = [];

        function spawnInvaders() {
            for (let row = 0; row < INVADER_ROWS; row++) {
                invaderMap[row] = [];
                let invaderSprite, offsetX = 0, offsetY = 0;
                switch (row) {
                    case 0:
                        invaderSprite = "invader_C2";
                        offsetX = 9;
                        break;
                    case 1:
                    case 2:
                        invaderSprite = "invader_B2";
                        offsetX = 3;
                        break;
                    case 3:
                    case 4:
                        invaderSprite = "invader_A1";
                        break;
                    default:
                        invaderSprite = "invader_A1";
                }
                for (let col = 0; col < INVADER_COLS; col++) {
                    const x = col * BLOCK_WIDTH * 2 + OFFSET_X + offsetX;
                    const y = row * BLOCK_HEIGHT + OFFSET_Y;
                    const invader = add([
                        pos(x, y),
                        sprite(invaderSprite),
                        area(),
                        scale(2),
                        "invader",
                        {
                            row: row,
                            col: col,
                            spriteName: invaderSprite,
                            exploded: false,
                        },
                    ]);
                    console.log(invader.pos)
                    const camPosition = camPos();
                    console.log("Camera position:", camPosition);
                    console.log(invaderSprite)
                }
            }
        }
        spawnInvaders();


        onKeyDown("left", () => {
            if (pause) return;
            if (player.pos.x >= SCREEN_EDGE) {
                player.move(-1 * PLAYER_MOVE_SPEED, 0);
            }
        });

        onKeyDown("right", () => {
            if (pause) return;
            if (player.pos.x <= canvas.width - highscoresDivWidth + 168) {
                // canvas.width - width vom div das den score anzeigt
                player.move(PLAYER_MOVE_SPEED, 0);
            }
        });

        let invaderDirection = 1;
        let invaderMoveCounter = 0;
        let invaderRowsMoved = 0;

        let invaderMoveTimer = 0;

        onUpdate(() => {
            if (pause) return;
        
            invaderMoveTimer += dt();
        
            // Adjust the invader speed by controlling the move interval
             // Lower value means faster speed

            if (invaderMoveTimer >= INVADER_MOVE_THRESHOLD) {
                invaderMoveTimer -= INVADER_MOVE_THRESHOLD; // Reset timer

                const invaders = get("invader");
                for (const invader of invaders) {
                    invader.move(invaderDirection * INVADER_SPEED, 0);
                }
        
                invaderMoveCounter++;
        
                if (invaderMoveCounter > INVADER_STEPS) {
                    invaderDirection = invaderDirection * -1;
                    invaderMoveCounter = 0;
                    moveInvadersDown();
                }
        
                changeInvaderSprites();
        
                if (invaderRowsMoved > INVADER_ROWS_MOVE) {
                    pause = true;
                    wait(2, () => {
                        go("gameOver", player.score);
                    });
                }
            }
        
            function moveInvadersDown() {
                invaderRowsMoved++;
                const invaders = get("invader");
                for (const invader of invaders) {
                    invader.moveBy(0, BLOCK_HEIGHT);
                }
            }
        });
    });

    scene("gameOver", (score) => {
        // Scene Code
    });

    go("game");
});
