# avaruussota
**avaruussota** is an online multiplayer space shooter.

Once you discover a game instance, simply open the page in a modern
web browser. The game can also be played on mobile.

# Joining
The first thing you should see is a dialog. This dialog allows you to 
set your nickname, which is restricted to 20 characters in length. If you do
not choose a nickname, you will be given a random number.

After setting your name, you can choose an upgrade for your ship. The
upgrade options are:

* *None*
* *Coilgun*: bullets fly faster
* *Rapid Fire*: increased rate of fire
* *Shields*: higher shields
* *Agile*: ship is slightly slower but turns more easily
* *Meteoroid*: damage caused by crashing into planets is halved
* *Turboheal*: your ship's shields will recharge faster
* *Absorber*: you gain some shields every time you hit another player

You can also set the zoom level. 100% will show the entire view area, but
may cause objects to be small. After you have set the settings, press
`play` to join the game.

# In-game
Once you join the game, you will (most likely) begin by spawning on a planet.
While on a planet, you cannot turn around, so accelerate off the surface of the
planet to begin roaming around the playfield.

The top-left corner shows a bar indicating your shields and a counter for the
number of player ships currently active in-game. Your score is indicated in
the middle, while the leaderboard showing the players with the highest scores
is shown in the top-right. Your powerups are also shown on the top-left.

Your target is to shoot and destroy other ships, which you can do by
firing bullets. Once you hit an enemy with enough bullets, their ship will 
be destroyed, and the last to hit that player will earn a point. Bullets have 
a maximum distance beyond which they disappear, and they may only hit a 
single player at a time.

It is also possible to crash into other ships. In case you ram another ship
and your ship survives while the other ship is destroyed, you will also score
a point.

Moving around may take some time to get used to. Your ship will not slow
down on its own and must be slowed down using the brake.

The playfield is filled with many planets, which also cause gravitational
effects to nearby ships and bullets, attracting them towards the planet.
Hitting a planet will cause damage to your ship, but by braking and turning
your ship's back towards the planet, you can land on that planet. Landing
on a planet will slowly recharge your shields as long as you stay on it.
Since damaged ships, or ships with low shields, will emit smoke and fly
slower than ships without any damage, it may be beneficial to refill one's
shields.

The playfield is bordered by a "rubberband" border that pushes players back
within if a player tries to escape the playfield. The size of this border
depends on the number of players, increasing in size to accommodate more
players.

# Controls
There are different control schemes. For desktop players, keyboard-only
controls are:

* W: thrust
* S: brake
* A: turn left
* D: turn right
* Q: use power-up
* Space: fire bullet
* Z: zoom

The mouse can also be used to turn the ship. The left button will fire bullets
while the right button will use a power-up. Note that thrusting and braking
will still require the use of keyboard keys.

For mobile players, touch controls will show up on the bottom half of the
screen. The joystick on the left allows for turning and controlling thrust;
the ship's thrusters will be enabled as long as the joystick is held far
enough out within the red area. There are also buttons for braking, firing
a bullet, and using a power-up. Mobile users cannot control zoom while
in-game.

# Power-ups
Occasionally power-ups will spawn on the stage. They appear as green glowing
orbs, and can be collected by either flying through them or hitting them
with a bullet. The power-up is decided randomly on pick-up, and there are
two principal types:
    
* consumable "item": you can hold at most one consumable at a time, and it is
  used by either pressing Q, the right mouse button or the USE touch button.
  the consumable is shown in the top-left powerup list.
* temporary: these power-ups activate automatically and have a temporary
  effect. the top-left powerup list will show a timer that indicates the
  time remaining of the given effect.

The power-ups are:

* consumable:
  * *laser*: shoots a fast laser beam that causes considerable damage
    and passes through multiple players. needs good aim to be effective.
  * *bomb*: shoots bullets around the ship.
  * *mine*: drops a stationary mine that stays in the game for two whole
    minutes. any ships passing too close to the mine will cause it to explode,
    causing considerable damage to any ships located nearby.
  * *reheal*: instantly refills the ship's shields.
  * *spread*: shoots a low-range barrage of bullets that can cause
    devastating damage point-blank.
  * *[orion](
https://en.wikipedia.org/wiki/Project_Orion_(nuclear_propulsion))*: 
    boosts the ship to maximum velocity and shoots a volley of low-range
    low-damage bullets to behind the ship.
  * *knockout*: shoots a low-range short projectile that, if it hits
    a ship, knocks it around violently.
* temporary:
  * *rubber ship*: the ship will not receive any damage from hitting
    planets or other ships. lasts for 30 seconds.
  * *regen*: the shields are slowly refilled. lasts for 10 seconds.
  * *overdrive*: the acceleration and the rate of fire of the ship are
    greatly increased. lasts for 10 seconds.
