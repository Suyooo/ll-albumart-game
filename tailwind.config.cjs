/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');

module.exports = {
    content: ['./src/**/*.{html,js,svelte,ts}'],
    theme: {
        minHeight: {
            '10': '2.5rem',
        }, extend: {
            colors: {
                primary: {
                    DEFAULT: "#DE0A82",
                    100: "#FF91CF",
                    200: "#F76CBB",
                    300: "#EF49A7",
                    400: "#E62994",
                    500: "#DE0A82",
                    600: "#AF176D",
                    700: "#801C55",
                    800: "#511939",
                    900: "#220E19"
                },
                gray: colors.stone,
                correct: "#22c55e",
                wrong: "#dc2626",
                skipped: colors.stone[300],
                current: colors.stone[500],
                unused: colors.stone[700]
            }
        }
    },
    plugins: [],
}
