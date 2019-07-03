console.log('webpack works!')
// message types (server -> client):
//      you SHIP
//      collision_sound
//      kill_ship SHIP_ID
//      remove_bullet BULLET_ID
//      nearby [LIST_OF_SHIPS, LIST_OF_BULLETS]
// message types (client -> server):
//      accel_on
//      accel_off
//      brake_on
//      brake_off
//      turn NEW_ORIENTATION
//      fire
//      special_weapon
