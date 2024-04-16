document.addEventListener("DOMContentLoaded", function () {

    const INVADER_ROWS = 5;
    const INVADER_COLS = 11;
    const BLOCK_HEIGHT = 52;
    const BLOCK_WIDTH = 32;
    const OFFSET_X = 70;
    const OFFSET_Y = 50;
    
    const INVADER_STEPS = 24;
    const INVADER_TRAVEL_DISTANCE = 1100;
    //24
    INVADER_ROWS_MOVE = 5;

    const PLAYER_MOVE_SPEED = 250;
    const SCREEN_EDGE = 2;

    const GUN_COOLDOWN_TIME = 1;
    const BULLET_SPEED = 12000;

    const highscoresDiv = document.getElementById("highscores");

    const highscoresDivWidth = highscoresDiv.offsetWidth;

    let score = 0;
    let remainingInvaders = INVADER_ROWS * INVADER_COLS;

    let leftDirectionSteps = INVADER_STEPS;
    let rightDirectionSteps = INVADER_STEPS;

    kaboom({
        background: [17, 17, 17],
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

        INVADER_MOVE_THRESHOLD = 1;

        const player = add([
            sprite("player"),
            scale(2),
            color(238, 238, 238),
            pos(100, 600),
            area(),
            {
                score: 0,
                lives: 3,
            },
            "player",
        ]);

        const scoreLabel = add([
            text("Score: 0", {
                size: 25,
            }),
            pos(12, 12),
            {
                value: score,
            },
            color(238, 238, 238),
        ]);

        let pause = false;
        let bulletOnScreen = false;

        onKeyPress("space", () => {
            if (pause) return;
            if (!bulletOnScreen) {
                const bulletPosition = {
                    x: player.pos.x + 10,
                    y: player.pos.y
                };
                spawnBullet(bulletPosition, -1, "bullet");
                bulletOnScreen = true;
            }
        });

        function spawnBullet(bulletPos, direction, tag) {
            const bullet = add([
                rect(4, 12),
                pos(bulletPos.x + 14, bulletPos.y - 12),
                color(238, 238, 238),
                area(),
                "missile",
                tag,
                {
                    direction,
                    speed: BULLET_SPEED,
                },
            ]);

            bullet.onUpdate(() => {
                bullet.move(0, -2 * bullet.speed * dt());
                if (bullet.pos.y < 0) {
                    destroy(bullet);
                }
            });

            bullet.on("destroy", () => {
                bulletOnScreen = false;
            });

            let shaking = false;

            function resetShake() {
                shaking = false;
                camPos(800, 387.5);
            }

            let totalRows = 4;
            let minimumCols = 0;
            let maximumCols = 10;

            onCollide("bullet", "invader", (bullet, invader) => {
                if (!shaking) {
                    resetShake();
                    shaking = true;
                    shake(4);
                }

                if (!invader.exploded) {
                    destroy(bullet);
                    bulletOnScreen = false;

                    remainingInvaders--;

                    score += 5;
                    scoreLabel.text = "Score: " + score;

                    invader.exploded = true;
                    invader.use(sprite("invader_explosion"));

                    if (checkRowStatus(totalRows) == true) {
                        totalRows--;
                        INVADER_ROWS_MOVE++;
                    }

                    if (checkColumnStatus(minimumCols) == true) {
                        minimumCols++;
                        leftDirectionSteps++;
                    }

                    if (checkColumnStatus(maximumCols) == true) {
                        maximumCols--;
                        rightDirectionSteps++;
                    }
                    

                    wait(0.1, () => {
                        destroy(invader);
                    });
                }
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
            totalRows = 4;
            minimumCols = 0;
            maximumCols = 10;
            leftDirectionSteps = 24;
            rightDirectionSteps = 24;
            INVADER_ROWS_MOVE = 5;

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
                        color(238, 238, 238),
                        "invader",
                        {
                            row: row,
                            col: col,
                            spriteName: invaderSprite,
                        },
                    ]);
                }
            }
        }
        spawnInvaders();

        function checkRowStatus(rowNum) {
            const invadersInRow = get("invader").filter(invader => invader.row === rowNum);
            for (const invader of invadersInRow) {
                if (!invader.exploded) {
                    return false;
                }
            }
            return true;
        }

        function checkColumnStatus(colNum) {
            const invadersInRow = get("invader").filter(invader => invader.col === colNum);
            for (const invader of invadersInRow) {
                if (!invader.exploded) {
                    return false;
                }
            }
            return true;
        }

        onKeyDown("left", () => {
            if (pause) return;
            if (player.pos.x >= SCREEN_EDGE) {
                player.move(-1 * PLAYER_MOVE_SPEED, 0);
            }
        });

        onKeyDown("right", () => {
            if (pause) return;
            if (player.pos.x <= canvas.width - highscoresDivWidth + 168) {
                player.move(PLAYER_MOVE_SPEED, 0);
            }
        });

        let invaderDirection = 1;
        let invaderMoveCounter = 0;
        let invaderRowsMoved = 0;

        let invaderMoveTimer = 0;

        let invader_steps = INVADER_STEPS;

        function moveInvadersDown() {
            invaderRowsMoved++;
            const invaders = get("invader");
            for (const invader of invaders) {
                invader.moveBy(0, BLOCK_HEIGHT);
            }
        }

        onUpdate(() => {
            if (pause) return;
        
            invaderMoveTimer += dt();
        
            if (invaderMoveTimer >= INVADER_MOVE_THRESHOLD) {
                invaderMoveTimer = 0;
        
                const invaders = get("invader");
                for (const invader of invaders) {
                    invader.move(invaderDirection * INVADER_TRAVEL_DISTANCE, 0);
                }

                if (invaderDirection == 1) {
                    invader_steps = rightDirectionSteps;
                    console.log("Rechte Schritte: " + rightDirectionSteps);
                }

                if (invaderDirection == -1) {
                    invader_steps = leftDirectionSteps;
                    console.log("Linke Schritte: " + leftDirectionSteps);
                }

                console.log("Invadersteps are: " + invader_steps);

                if (invaderMoveCounter >= invader_steps) {
                    invaderDirection = invaderDirection * -1;
                    invaderMoveCounter = 0;
                    moveInvadersDown();
                }
        
                invaderMoveCounter++;

                console.log("InvaderMoveCounter ist derzeit: " + invaderMoveCounter);
                console.log("invaderSteps ist derzeit: " + invader_steps);
        
                changeInvaderSprites();
        
                if (invaderRowsMoved > INVADER_ROWS_MOVE) {
                    pause = true;
                    wait(2, () => {
                        go("gameOver", score);
                    });
                }
            }
        
            if (remainingInvaders === 0) {
        
                const invaders = get("invader");
                for (const invader of invaders) {
                    destroy(invader);
                    invaderDirection = 1;
                    invaderMoveCounter = 0;
                    invaderRowsMoved = 0;
                    INVADER_MOVE_THRESHOLD -= 0.2;
                    console.log("THRESHOLD auf " + INVADER_MOVE_THRESHOLD)
                }
        
                spawnInvaders();
        
                remainingInvaders = INVADER_ROWS * INVADER_COLS;
            }
        });
    });

    scene("gameOver", (score) => {
        add([
            text("Game Over", {
                size: 80,
                width: width(),
                textAlign: "center",
                color: rgb(238, 238, 238),
            }),
            pos(canvas.width / 2 - 190, canvas.height / 2 - 80),
        ]);

        add([
            rect(200, 40),
            color(0, 0, 0),
            pos(canvas.width / 2 - 100, canvas.height / 2 + 8),
        ]);

        const retryText = add([
            text("Retry", {
                size: 35,
                textAlign: "center",
                color: rgb(238, 238, 238),
            }),
            pos(canvas.width / 2 - 50, canvas.height / 2 + 10),
            area(),
        ]);

        retryText.onMousePress(() => {
            go("game");
          });

    
        fetch('/save_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ score: score })
        }).then(response => {
            if (response.ok) {
                console.log('Score saved successfully');
            } else {
                console.error('Failed to save score');
            }
        }).catch(error => {
            console.error('Error saving score:', error);
        });
    });

    go("game");
});
