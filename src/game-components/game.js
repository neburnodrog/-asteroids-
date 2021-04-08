import { Ship } from './ship';
import { Menu } from './menu';
import { Asteroid } from './asteroid';
import { Star } from './star';
import { Life } from './life';
import { Score } from './score';

export class Game {
    constructor() {
        this.started = false;
        this.menu = new Menu();
        this.gameover = false;
        this.gameoverScreen;
        this.lifes = [];
        this.score = new Score();

        this.stars = [];
        this.ship = new Ship();
        this.asteroids = [];
    }

    setup(p5, shipImage, heartImage) {
        this.ship.image = shipImage;
        for (let i = 0; i < 3; i++) this.lifes.push(new Life(heartImage))
        this.createInitialAsteroids(p5, 10, 'X');
        this.createStars(p5);
    }

    // STARS
    createStars(p5) {
        for (let i = 0; i < 1000; i++) {
            this.stars.push(new Star(p5))
        }
    }

    // ASTEROIDS
    createInitialAsteroids(p5, howMany, size) {
        for (let i = 0; i < howMany; i++) {
            let initialPosition = this.initialAsteroidPosition(p5);
            let initialVelocity = this.initialAsteroidVelocity(1);
            this.asteroids.push(new Asteroid(size, initialPosition, initialVelocity));
        }
    }

    initialAsteroidVelocity(num) {
        return {
            x: num * (Math.random() - Math.random()),
            y: num * (Math.random() - Math.random()),
        }
    }

    initialAsteroidPosition(p5) {
        let x = p5.width * Math.random();
        let y = p5.height * Math.random();
        // while asteroid is overlapping with the ship's initial position:
        while (p5.dist(x, y, p5.width / 2, p5.height / 2) < 2 * 50) {
            x = p5.width * Math.random();
            y = p5.height * Math.random();
        }
        return {
            x: x,
            y: y,
        }
    }

    checkForHits(p5) {
        this.asteroids.forEach(asteroid => {
            this.ship.shots.forEach(shot => {
                let distance = p5.dist(
                    asteroid.position.x,
                    asteroid.position.y,
                    shot.position.x,
                    shot.position.y,
                );

                if (distance < asteroid.radius) {
                    asteroid.exploded = true;
                    shot.hit = true;
                    this.score.value += 100;
                }
            })
        });
    }

    ifExplotionsCreateNewAsteroids() {
        let explodedAsteroids = this.asteroids.filter(asteroid => asteroid.exploded);

        explodedAsteroids.map(explodedAsteroid => {
            let { size, position } = { ...explodedAsteroid };

            if (size === 'X') {
                this.asteroids = this.asteroids.concat([
                    new Asteroid('M', { x: position.x, y: position.y }, this.initialAsteroidVelocity(3)),
                    new Asteroid('M', { x: position.x, y: position.y }, this.initialAsteroidVelocity(3)),
                ]);
            } else if (size === 'M') {
                this.asteroids = this.asteroids.concat([
                    new Asteroid('S', { x: position.x, y: position.y }, this.initialAsteroidVelocity(5)),
                    new Asteroid('S', { x: position.x, y: position.y }, this.initialAsteroidVelocity(5)),
                ]);
            }
        });
    }

    cleanExplodedAsteroids() {
        this.asteroids = this.asteroids.filter(asteroid => !asteroid.exploded)
    }

    checkIfCollisions(p5) {
        this.asteroids.forEach(asteroid => {
            const { x, y } = { ...asteroid.position }
            const distance = p5.dist(x, y, this.ship.position.x, this.ship.position.y);

            if (distance < asteroid.radius + 20) {
                if (this.lifes.length === 0) {
                    this.gameover = true;
                } else {
                    this.lifes.pop();
                }

                this.ship.explosion();
            }
        });
    }

    // DRAW
    draw(p5) {
        this.stars.forEach(star => star.draw(p5));
        this.asteroids.forEach(asteroid => asteroid.draw(p5));
        this.ship.draw(p5);
        this.ship.shots.forEach(shot => shot.draw(p5));

        // collisions (asteroids & ship)
        this.checkIfCollisions(p5);

        // collisions (asteroids & shots)
        this.checkForHits(p5);
        this.ifExplotionsCreateNewAsteroids();
        this.cleanExplodedAsteroids();
        this.ship.filterOldShots(p5);

        // draw lifes && score
        this.lifes.forEach((life, index) => life.draw(p5, index + 1));
        this.score.draw(p5);

    }
}