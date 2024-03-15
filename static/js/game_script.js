document.addEventListener("DOMContentLoaded", function () {

    const INVADER_ROWS = 5;
    const INVADER_COLS = 11;
    const BLOCK_HEIGHT = 52;
    const BLOCK_WIDTH = 35;
    const OFFSET_X = 100;
    const OFFSET_Y = 50;

    const INVADER_SPEED = 400;
    const INVADER_STEPS = 80;
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

    // Calculate canvas dimensions based on window size
    function calculateCanvasSize() {
        const canvas = document.getElementById('game-canvas');
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const windowHeight = window.innerHeight;
        const canvasHeight = windowHeight - navbarHeight;
        const canvasWidth = canvasHeight * (16 / 9); // 16:9 aspect ratio
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
    }

    // Call function initially and on window resize
    calculateCanvasSize();
    window.addEventListener('resize', calculateCanvasSize);

    loadRoot("static/res/sprites")
    loadSprite("player", "/invaders/space__0006_Player.png")
    loadSprite("invader_1", "/invaders/space__0004_C1.png")

    // Load root scene
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
                for (let col = 0; col < INVADER_COLS; col++) {
                    const x = col * BLOCK_WIDTH * 2 + OFFSET_X;
                    const y = row * BLOCK_HEIGHT + OFFSET_Y;
                    const invader = add([
                        pos(x, y),
                        sprite("invader_1"),
                        area(),
                        scale(2),
                        "invader_1",
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


        let invaderMoveTimer = 0; // Variable to keep track of time

        onUpdate(() => {
            if (pause) return;

            // Increment the timer by the time elapsed since the last frame
            invaderMoveTimer += dt();

            // Check if one second has elapsed
            if (invaderMoveTimer >= 1) {
                // Reset the timer
                invaderMoveTimer = 0;

                // Move the invaders
                const invaders = get("invader_1");
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
                const invaders = get("invader_1"); // Get all entities with the "invader_1" tag
                for (const invader of invaders) {
                    invader.moveBy(0, BLOCK_HEIGHT); // Move each invader downwards by BLOCK_HEIGHT pixels
                }
            }

            // Your existing code here...
        });




    });

    scene("gameOver", (score) => {
        // Add scene code here
    });

    go("game");
});