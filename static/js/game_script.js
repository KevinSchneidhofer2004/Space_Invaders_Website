document.addEventListener("DOMContentLoaded", function () {

    const INVADER_ROWS = 5;
    const INVADER_COLS = 11;
    const BLOCK_HEIGHT = 52;
    const BLOCK_WIDTH = 32;
    const OFFSET_X = 70;
    const OFFSET_Y = 50;

    const INVADER_SPEED = 800;
    const INVADER_STEPS = 28;
    //24
    const INVADER_ROWS_MOVE = 5;

    const PLAYER_MOVE_SPEED = 250;
    const SCREEN_EDGE = 100;

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


        let invaderMap = [];
        function spawnInvaders() {
            for (let row = 0; row < INVADER_ROWS; row++) {
                invaderMap[row] = [];
                let invaderSprite, offsetX = 0, offsetY = 0;
                switch (row) {
                    case 0:
                        invaderSprite = "invader_C1";
                        offsetX = 9;
                        break;
                    case 1:
                    case 2:
                        invaderSprite = "invader_B1";
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
                        invaderSprite,
                        {
                            row: row,
                            col: col,
                        },
                    ]);
                    invaderMap[row][col] = invader;
                }
            }
        }
        spawnInvaders();


        let pause = false;
        onKeyDown("left", () => {
            if (pause) return;
            if (player.pos.x >= SCREEN_EDGE) {
                player.move(-1 * PLAYER_MOVE_SPEED, 0);
            }
        });

        onKeyDown("right", () => {
            if (pause) return;
            if (player.pos.x <= canvas.width - (SCREEN_EDGE * 2)) {
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

            if (invaderMoveTimer >= 1) {
                invaderMoveTimer = 0;

                const invaders = get(["invader_A1", "invader_B1", "invader_C1"]);
                console.log("Invaders found:", invaders.length);
                for (const invader of invaders) {
                    invader.move(invaderDirection * INVADER_SPEED, 0);
                }

                invaderMoveCounter++;

                if (invaderMoveCounter > INVADER_STEPS) {
                    invaderDirection = invaderDirection * -1;
                    invaderMoveCounter = 0;
                    moveInvadersDown();
                }

                if (invaderRowsMoved > INVADER_ROWS_MOVE) {
                    pause = true;
                    wait(2, () => {
                        go("gameOver", player.score);
                    });
                }
            }

            function moveInvadersDown() {
                invaderRowsMoved++;
                const invaders = get(["invader_A1", "invader_B1", "invader_C1"]);
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