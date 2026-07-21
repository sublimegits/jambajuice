createCanvas();

world.gravity.y = 10;

// basic variables
let jumpDB = 0;
let hunting = false;
let round = 0;

// variables for the welding tool
let joints = [];
let b1 = null;
let b2 = null;

// variable for the freezing tool
let lastFroze = null;

const textures = [
	loadImage('images/health-panel.png'),
	loadImage('images/player.png'),
	loadImage('images/enemy.png'),
	loadImage('images/block.png'),
	loadImage('images/block1.png'),
	loadImage('images/bullet.png')
];

const sounds = [
	loadSound("sounds/jingle1.wav"),
	loadSound("sounds/jingle2.wav"),
	loadSound("sounds/jingle3.wav"),
	loadSound("sounds/short1.wav"),
	loadSound("sounds/gunshot.mp3"),
	loadSound("sounds/death.wav")
]

enemies = new Group();
spawnedBlocks = new Group();
bullets = new Group();

let ground = new Sprite();
ground.x = 0;
ground.y = 500;
ground.width = 5000;
ground.height = 2000;
ground.physics = STATIC;
ground.color = color(25, 150, 15, 255);
ground.stroke = color(15, 140, 5, 255);
ground.strokeWeight = 10;

let wall1 = new Sprite();
wall1.x = 2500;
wall1.y = 0;
wall1.width = 500;
wall1.height = 6000;
wall1.physics = STATIC;
wall1.color = color(50, 50, 50)
wall1.strokeWeight = 0;

let wall2 = new Sprite();
wall2.x = -2500;
wall2.y = 0;
wall2.width = 500;
wall2.height = 6000;
wall2.physics = STATIC;
wall2.color = color(50, 50, 50)
wall2.strokeWeight = 0;

let plr = new Sprite();
plr.x = 0;
plr.y = -200;
plr.diameter = 30;
plr.img = textures[1];
plr.bounciness = 0.5;
plr.mass = 50;
plr.health = 100;

function newEnemy(x, y) {
	let enemy = new Sprite();
	enemy.x = x;
	enemy.y = y;
	enemy.diameter = 35;
	enemy.img = textures[2];
	enemy.life = 1500;
	enemies.add(enemy);
}

function draw() {

	// math for the sun


	let d = new Vector((mouse.x - plr.x), (mouse.y - plr.y));

	mouse.cursor = "default";

	if (hunting == false) {
		background(10, 200, 255);
		image(textures[5], (Math.sin((-(frameCount + 1800) / 3600) * Math.PI) * halfWidth) + halfWidth - 60, (Math.cos((-(frameCount + 1800) / 3600) * Math.PI) * halfHeight * 0.75) + halfHeight - 60, (Math.sin(frameCount / 1200) * 180) + 60, (Math.sin(frameCount / 1200) * 180) + 60); // this is the sun
	} else {
		background(25, 0, 50);
		if (Math.random() < 0.01) {
			newEnemy(plr.x, -1000);
		}
		if (enemies.length > 0) {
			for (let s of enemies) {
				s.attractTo(plr, round / 2);
				if (Math.abs(plr.x - s.x) < 35 && Math.abs(plr.y - s.y) < 35) {
					if (frameCount % 5 == 0 && plr.health > 0) {
						plr.health -= 1;
					}
				}

			}
		}
	}

	if (plr.health <= 0) {
		if (plr.opacity == 1) {
			sounds[5].play();
		}
		plr.opacity = 0;
		plr.physics = STATIC;
		setTimeout(function() {
			frameCount = 0;
			enemies.deleteAll();
			plr.physics = DYNAMIC;
			plr.opacity = 1;
			plr.x = 0;
			plr.y = -500;
			plr.health = 100;

			hunting = false;
			round = 0;

			for (let i = 0; i < joints.length; i++) {
				joints[i].delete();
			}
		}, 10000);
	}

	// routine checks

	if (frameCount % 3600 == 0) {
		hunting = !hunting;
		if (hunting == true) {
			round++;
		}
	}

	if (frameCount % 7200 == 0) {
		for (let i of joints) {
			i.delete();
		}
	}

	if (Math.abs(plr.y) > 5000 || Math.abs(plr.x) > 10000) {
		plr.health -= 1;
	}

	camera.x = lerp(camera.x, plr.x, 0.25);
	camera.y = lerp(camera.y, plr.y, 0.25);
	camera.zoom = 2

	jumpDB += 1;

	// this provides a way to hold your horses
	if (kb.pressed('down')) {
		plr.vel = new Vector(0, 0);
		plr.rotationSpeed = 0;
	}

	if (kb.pressed('up') && jumpDB > 50) {
		plr.vel.y = -5;
		jumpDB = 0;
	}
	if (kb.pressing('right')) {
		plr.velocity.x += 0.1;
	}
	if (kb.pressing('left')) {
		plr.velocity.x += -0.1;
	}
	if (kb.pressing('e')) {
		mouse.cursor = "grab";
	}
	if (mouse.pressed("left")) {
		if (kb.pressing("t")) {
			let crate = new Sprite();
			crate.x = plr.x + (d.normalize().x * 20);
			crate.y = plr.y + (d.normalize().y * 20);
			crate.velocity = d.mult(4);
			crate.width = 30;
			crate.height = 30;
			crate.mass = 50 / (round + 1);
			crate.img = textures[3];
			crate.life = 10000 / (round + 1)
			spawnedBlocks.add(crate);

			sounds[3].stop();
			sounds[3].play();
		} else if (kb.pressing('e')) {
			sounds[3].play();
		} else if (kb.pressing('q')) {
			let projectile = new Sprite();
			projectile.x = plr.x + (d.normalize().x * 20);
			projectile.y = plr.y + (d.normalize().y * 20);
			projectile.velocity = d.mult(20);
			projectile.diameter = 10;
			projectile.mass = 10000000 / (round + 1);
			projectile.img = textures[5];
			projectile.life = 500 / (round + 1);
			bullets.add(projectile);

			// do NOT stop the sound, it could be a little better if they overlap
			sounds[4].play();
		} else if (kb.pressing('r')) {
			if (b1 instanceof Sprite && b2 === null) {
				for (let i of spawnedBlocks) {
					if (i.mouse.hovering() && (i.y <= plr.y || Math.abs(i.x - plr.x) > 10)) {
						b2 = i;
					}
				}

				if (b2 instanceof Sprite) {
					if (b2 == b1) {
						b2 = null;
					} else {
						let newJoint = new GlueJoint(b1, b2);						
						joints.push(newJoint);
					}
				}
			}
			if (b1 === null && b2 === null) {
				for (let i of spawnedBlocks) {
					if (i.mouse.hovering() && (i.y <= plr.y || Math.abs(i.x - plr.x) > 10)) {
						b1 = i;
					}
				}
			}
			if (b1 instanceof Sprite && b2 instanceof Sprite) {
				b1 = null;
				b2 = null;
			}
		}
	}
	if (mouse.pressing("left")) {
		if (kb.pressing('e')) {
			mouse.cursor = "grabbing";
			for (let i of spawnedBlocks) {
				if (i.mouse.dragging() && (i.y <= plr.y || Math.abs(i.x - plr.x) > 10)) {
					i.moveTowards(
						mouse.x + i.mouse.x,
						mouse.y + i.mouse.y,
						1 / (round + 1)
					);
				}
			}
		}
	}
	if (mouse.pressed("right")) {
		for (let i of spawnedBlocks) {
			if (i.mouse.hovering()) {
				if (i.physics == DYNAMIC) {
					if (lastFroze != null) {
						lastFroze.physics = DYNAMIC;
					}
					i.physics = STATIC;
					lastFroze = i;
				}
			}
		}
	}
}

function postProcess() {
	textSize(80);

	image(textures[0], 15, 15, 240, 240);
	fill('white');
	textFont("Helvetica");
	text(plr.health, 65, 170);

	if (hunting == true) {
		fill('black');
		text("Run, or go inside your hut and hide!", 10, canvas.height - 10);
	} else {
		fill('white');
		text("Build a hut!", 10, canvas.height - 10);
	}

	let time = new Temporal.PlainTime(((frameCount / 300) + 6) % 24, ((frameCount / 300) % 1) * 60, (frameCount * 12) % 60);

	text("The time is ".concat(time.toString()), 10, canvas.height - 100);

	if (plr.health <= 0) {
		background(color(0, 0, 0));
		fill('white');
		text("YOU ARE DEAD.", 10, canvas.height - 10);
	}
}
