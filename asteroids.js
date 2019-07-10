const FPS = 30; // frames per second
const FRICTION = 0.7; // friction coefficient of space (0 = no friction, 1 = lots of friction)
const LASER_MAX = 10;
const LASER_SPD = 500;
const LASER_DIST = 0.6;
const ROID_JAG = 0.4; // jaggedness of the asteroids (0 = none, 1 = lots)
const ROID_NUM = 3; // starting number of asteroids
const ROID_SIZE = 100; // starting size of asteroids in pixels
const ROID_SPD = 50; // max starting speed of asteroids in pixels per second
const ROID_VERT = 10; // average number of vertices on each asteroid
const SHIP_EXPLODE_DUR = 0.5; // time of explode animation
const SHIP_BLINK_DUR = 0.1; // time of explode animation
const SHIP_INV_DUR = 3; // time of explode animation
const SHIP_SIZE = 30; // ship height in pixels
const SHIP_THRUST = 5; // acceleration of the ship in pixels per second per second
const SHIP_TURN_SPD = 360; // turn speed in degrees per secondcoo
const SHOW_BOUNDING = false; // show or hide bounding box
const SHOW_CENTRE_DOT = false; // show or hide ship's centre dot

/** @type {HTMLCanvasElement} */
var canv = document.getElementById('asteroids');
var ctx = canv.getContext('2d');

// set up the spaceship object
var ship = newShip();

// set up asteroids
var roids = [];
createAsteroidBelt();

// set up event handlers
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

// set up the game loop
setInterval(update, 1000 / FPS);

function createAsteroidBelt() {
  roids = [];
  var x;
  var y;
  for (var i = 0; i < ROID_NUM; i++) {
    // random asteroid location (not touching spaceship)
    do {
      x = Math.floor(Math.random() * canv.width);
      y = Math.floor(Math.random() * canv.height);
    } while (distBetweenPoints(ship.x, ship.y, x, y) < ROID_SIZE * 2 + ship.r);
    roids.push(newAsteroid(x, y));
  }
}

function distBetweenPoints(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function explodeShip() {
  ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
}

function keyDown(/** @type {KeyboardEvent} */ ev) {
  switch (ev.keyCode) {
    case 32: // space bar(shoot laser)
      shootLaser();
      break;
    case 37: // left arrow (rotate ship left)
      ship.rot = SHIP_TURN_SPD / 180 * Math.PI / FPS;
      break;
    case 38: // up arrow (thrust the ship forward)
      ship.thrusting = true;
      break;
    case 39: // right arrow (rotate ship right)
      ship.rot = -SHIP_TURN_SPD / 180 * Math.PI / FPS;
      break;
  }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
  switch (ev.keyCode) {
    case 32: // spacebar (allow shooting)
      ship.canShoot = true;
      break;
    case 37: // left arrow (stop rotating left)
      ship.rot = 0;
      break;
    case 38: // up arrow (stop thrusting)
      ship.thrusting = false;
      break;
    case 39: // right arrow (stop rotating right)
      ship.rot = 0;
      break;
  }
}

function newAsteroid(x, y) {
  var roid = {
        a: Math.random() * Math.PI * 2, // in radians
        offs: [],
        r: ROID_SIZE / 2,
        vert: Math.floor(Math.random() * (ROID_VERT + 1) + ROID_VERT / 2),
        x: x,
        y: y,
        xv: Math.random() * ROID_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROID_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
      };

  // populate the offsets array
  for (var i = 0; i < roid.vert; i++) {
    roid.offs.push(Math.random() * ROID_JAG * 2 + 1 - ROID_JAG);
  }

  return roid;
}

function newShip() {
  return {
      x: canv.width / 2,
      y: canv.height / 2,
      r: SHIP_SIZE / 2,
      a: 90 / 180 * Math.PI, // convert to radians
      blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
      blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
      rot: 0,
      explodeTime: 0,
      canShoot: true,
      lasers: [],
      thrusting: false,
      thrust: {
          x: 0,
          y: 0,
        },
    };
}

function shootLaser() {
  // create laser
  if (ship.canShoot && ship.lasers.length < LASER_MAX) {
    ship.lasers.push({
      x:    ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
      y:    ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
      xv: LASER_SPD * Math.cos(ship.a) / FPS,
      yv: -LASER_SPD * Math.sin(ship.a) / FPS,
      dist: 0,

    });

  }
}

function update() {
  var blinkOn = ship.blinkNum % 2 == 0;
  var exploding = ship.explodeTime > 0;

  // draw space
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canv.width, canv.height);

  // thrust the ship
  if (ship.thrusting) {
    ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
    ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

    // draw the thruster
    if (!exploding) {
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = SHIP_SIZE / 10;
      ctx.beginPath();
      ctx.moveTo(// rear left
          ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
          ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
      );
      ctx.lineTo(// rear centre (behind the ship)
          ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
          ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
      );
      ctx.lineTo(// rear right
          ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
          ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // apply friction (slow the ship down when not thrusting)
      ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
      ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }
  }

  // draw the triangular ship
  if (!exploding) {
    if (blinkOn) {
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(// nose of the ship
      ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
      ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
  );
    ctx.lineTo(// rear left
      ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
      ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
  );
    ctx.lineTo(// rear right
      ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
      ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
  );
    ctx.closePath();
    ctx.stroke();
    }

   if (ship.blinkNum > 0) {
     ship.blinkTime--;

     if (ship.blinkTime == 0) {
       ship.blinkTime  = Math.ceil(SHIP_BLINK_DUR * FPS);
       ship.blinkNum--;
     }
   }
  } else {
    ctx.fillStyle = 'darkred';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.2, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.7, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.3, 0, Math.PI * 2, false);
    ctx.fill();

  }

  if (SHOW_BOUNDING) {
    ctx.strokeStyle = 'lime';
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  // draw the asteroids
  var a;
  var r;
  var x;
  var y;
  var offs;
  var vert;
  for (var i = 0; i < roids.length; i++) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = SHIP_SIZE / 20;

    // get the asteroid properties
    a = roids[i].a;
    r = roids[i].r;
    x = roids[i].x;
    y = roids[i].y;
    offs = roids[i].offs;
    vert = roids[i].vert;

    // draw the path
    ctx.beginPath();
    ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        );

    // draw the polygon
    for (var j = 1; j < vert; j++) {
      ctx.lineTo(
        x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
        y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
      );
    }

    ctx.closePath();
    ctx.stroke();

    if (SHOW_BOUNDING) {
      ctx.strokeStyle = 'lime';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.stroke();
    }

    // move the asteroid
    for (let i = 0; i < roids.length; i++) {
      roids[i].x += roids[i].xv;
      roids[i].y += roids[i].yv;

      // handle asteroid edge of screen
      if (roids[i].x < 0 - roids[i].r) {
        roids[i].x = canv.width + roids[i].r;
      } else if (roids[i].x > canv.width + roids[i].r) {
        roids[i].x = 0 - roids[i].r;
      }

      if (roids[i].y < 0 - roids[i].r) {
        roids[i].y = canv.height + roids[i].r;
      } else if (roids[i].y > canv.height + roids[i].r) {
        roids[i].y = 0 - roids[i].r;
      }
    }
  }

  // centre dot
  if (SHOW_CENTRE_DOT) {
    ctx.fillStyle = 'red';
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
  }

  for (var k = 0; k < ship.lasers.length; k++) {
    ctx.fillStyle = 'lime',
    ctx.beginPath();
    ctx.arc(ship.lasers[k].x, ship.lasers[k].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
    ctx.fill();
  }

  //detect laser hit on asteroids
  var ax;
  var ay;
  var ar;
  var lx;
  var ly;

  for (let i = roids.length - 1; i >= 0; i--) {
    ax = roids[i].x;
    ay = roids[i].y;
    ar = roids[i].r;
  }

  for (let j = ship.lasers.length - 1; j >= 0; j--) {

    lx = ship.lasers[j].x;
    ly = ship.lasers[j].y;

    if (distBetweenPoints(ax, ay, lx, ly) < ar) {
      ship.lasers.splice(j, 1);
    }

    roids.splice(i, 1);

    break;
  }

  //check for asteroid collision
  if (!exploding) {
    if (ship.blinkNum == 0) {
      for (let i = 0; i < roids.length; i++) {
        if (distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r)
        explodeShip();
      }
    }

    // rotate the ship
    ship.a += ship.rot;

    // move the ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
  } else {
    ship.explodeTime--;

    if (ship.explodeTime === 0) {
      ship = newShip();
    }
  }


  for (let i = ship.lasers.length - 1; i >= 0; i--) {
    if (ship.lasers[i].dist > LASER_DIST * canv.width) {
      ship.lasers.splice(i, 1);
      continue;
    }
    // move laser
    ship.lasers[i].x += ship.lasers[i].xv;
    ship.lasers[i].y += ship.lasers[i].yv;

    //calculate distance traveled
    ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2)
      + Math.pow(ship.lasers[i].yv, 2));

    if (ship.lasers[i].x < 0) {
      ship.lasers[i].x = canv.width;
    } else if (ship.lasers[i].x > canv.width) {
      ship.lasers[i].x = 0;
    }

    if (ship.lasers[i].y < 0) {
      ship.lasers[i].y = canv.height;
    } else if (ship.lasers[i].y > canv.height) {
      ship.lasers[i].y = 0;
    }

  }

  // handle edge of screen
  if (ship.x < 0 - ship.r) {
    ship.x = canv.width + ship.r;
  } else if (ship.x > canv.width + ship.r) {
    ship.x = 0 - ship.r;
  }

  if (ship.y < 0 - ship.r) {
    ship.y = canv.height + ship.r;
  } else if (ship.y > canv.height + ship.r) {
    ship.y = 0 - ship.r;
  }
}
