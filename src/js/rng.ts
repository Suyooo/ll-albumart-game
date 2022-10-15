const rand_a: number = 1736762321;
const rand_c: number = 11;

/**
 * Linear congruential generator, returns number between 0.0 (inclusive) and 1.0 (exclusive)
 * @param seed Seed for LCG
 * @return Function to get the next pseudo-random number
 */
export function seededRNG(seed: number): () => number {
    let rand_z: number = seed;
    const func = () => {
        rand_z = (rand_z * rand_a + rand_c);
        return rand_z / 4294967296;
    }
    // Roll a bit after seeding for improved randomness
    func();
    func();
    return func;
}