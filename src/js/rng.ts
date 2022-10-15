let rand_z: number = 0;
const rand_a: number = 1736762321;
const rand_c: number = 11;

/**
 * Seed for linear congruential generator
 * @param i
 */
export function prngSeed(i: number): void {
    rand_z = i;
    // Roll a bit after seeding for improved randomness
    prngRandom();
    prngRandom();
}

/**
 * Linear congruential generator, returns number between 0.0 (inclusive) and 1.0 (exclusive)
  */
export function prngRandom(): number {
    rand_z = (rand_z * rand_a + rand_c)
    return rand_z / 4294967296;
}