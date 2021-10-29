// Board

let canvas = document.querySelector('canvas');
let c = canvas.getContext('2d');
let startG = document.getElementById('startG');
let optionAl = document.getElementById('option');
let finalScore = document.getElementById('finalScore');
let displayScore = document.getElementById('score')
let displayLevel = document.getElementById('levelNumber')

let audio = new Audio("sound/Austronaut.mp3")



canvas.width = innerWidth;
canvas.height = innerHeight;

// Class : Player - Projectile - Enemy - Particles
class Player {
    constructor(x, y, radius, color, speed) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.speed = speed
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill()
    }

}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity // Vận tốc
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity // Vận tốc
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

// Board action

let player = new Player(
    canvas.width / 2,
    canvas.height - 20,
    25,
    'white',
    15
)

let projectiles = []
let enemies = []
let particles = []
let players = []

function restart() {
    player = new Player(
        canvas.width / 2,
        canvas.height - 20,
        25,
        'white',
        15
    )
    players = []
    enemies = []
    projectiles = []
    particles = []
    score = 0
    displayScore.innerHTML = score
    finalScore.innerHTML = score
    levelNumber = 1
    displayLevel.innerHTML = levelNumber
}

// functions

function getRandomHex() {
    return Math.floor(Math.random() * 255);
}

function getRandomColor() {
    let red = getRandomHex();
    let green = getRandomHex();
    let blue = getRandomHex();
    return "rgb(" + red + "," + blue + "," + green + ")";
}

function spawnEnemies() {
    setInterval(() => {
        let radius = Math.random() * 30 + 10
        let x = canvas.width + radius
        let y = Math.random() * canvas.height
        let color = getRandomColor()

        let angle = Math.atan2(
            player.y - y,
            player.x - x
        )

        let velocity
        if (score < 10000) {
            velocity = {
                x: Math.cos(angle) * 8,
                y: Math.sin(angle) * 8
            }
        } else if (score >= 10000 && score <= 20000) {
            velocity = {
                x: Math.cos(angle) * 20,
                y: Math.sin(angle) * 20
            }
            levelNumber = 2;
            displayLevel.innerHTML = levelNumber
        } else if (score >= 20000 && score <= 50000 ) {
            velocity = {
                x: Math.cos(angle) * 30,
                y: Math.sin(angle) * 30
            }
            levelNumber = 3;
            displayLevel.innerHTML = levelNumber
        } else if (score >= 50000 && score <= 100000 ) {
            velocity = {
                x: Math.cos(angle) * 50,
                y: Math.sin(angle) * 50
            }
            levelNumber = 4;
            displayLevel.innerHTML = levelNumber
        }



        let enemy = new Enemy(x, y, radius, color, velocity)

        enemies.push(enemy)

    }, 800)
}

let animationID
let score = 0;
let levelNumber = 1;

// Main function, everything will happens here
function animate() {
    animationID = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1 )'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()

    // Particles fate-out
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })

    // players.forEach((player, index) => {
    //     keyDown()
    //     // keyUp()
    //     player.update()
    // })


    projectiles.forEach((projectile, index) => {
        projectile.update()
        // remove projectile when out of board
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            projectiles.splice(index, 1)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()

        let dist = Math.hypot(
            player.x - enemy.x,
            player.y - enemy.y
        )
        // When Enemies Touch Player - End the game
        if (dist - player.radius - enemy.radius < 1) {
            cancelAnimationFrame(animationID)
            optionAl.style.display = 'flex'
            finalScore.innerHTML = Math.floor(score)
        }

        projectiles.forEach((projectile, projectileIndex) => {
            let dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            )

            // Projectiles + Enemies Remove When Touch
            // Explosions + Score increase
            if (dist - projectile.radius - enemy.radius < 1) {

                score += enemy.radius + 50
                displayScore.innerHTML = Math.floor(score);

                // Explosion
                for (let i = 0; i < enemy.radius - 5; i++) {
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 5,
                            enemy.color,
                            {
                                x: (Math.random() - 0.5) * 3,
                                y: (Math.random() + 0.5) * 3
                            }
                        )
                    )
                }

                // Removing Enemies
                if (enemy.radius - 10 > 20) {
                    gsap.to(enemy, {
                        radius: enemy.radius - 20
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }

                // Bonus score
                score += enemy.radius + 100
                displayScore.innerHTML = Math.floor(score);
            }
        })
    })

}

// Event handler:

// Move player
document.addEventListener('mousemove', function (e) {
    player.x = e.clientX
    player.y = e.clientY
})


// Shoot
addEventListener('click', (event) => {

    let angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    )

    let velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10
    }

    projectiles.push(new Projectile(
        player.x,
        player.y,
        5,
        'white',
        velocity
    ))
})

// Start - Re Start Game
startG.addEventListener('click', (event) => {
    restart()
    animate()
    spawnEnemies()
    optionAl.style.display = 'none'
    audio.play()
    audio.loop = true;
})






