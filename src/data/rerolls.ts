// The rounds are randomized, but curated
// Setting localStorage.llalbum-day-offset = 1 means you will get the next day's round, which allows me to play a day
// ahead, and to check whether it's a good round. If not, it can be rerolled by adding the day to this set
export const rerollDays: { [day: number]: number } = {
    11: 6,
    14: 6,
    15: 3,
    21: 2,
    26: 1,
    28: 8,
    34: 1,
    35: 6,
    39: 4,
    40: 1,
    41: 1,
    43: 2
}