import colors from "tailwindcss/colors.js";
import { createThemes } from "tw-colors";

const primary = {
    DEFAULT: "#DE0A82",
    50: "#FFBCD7",
    100: "#FF91CF",
    200: "#F76CBB",
    300: "#EF49A7",
    400: "#E62994",
    500: "#DE0A82",
    600: "#AF176D",
    700: "#801C55",
    800: "#511939",
    900: "#220E19",
};
const correct = "#22c55e";
const wrong = "#dc2626";

/** @type {import('tailwindcss').Config} */
export default {
    content: ["index.html", "./src/**/*.{html,js,svelte,ts}"],
    darkMode: "class",
    theme: {
        extend: {
            minHeight: {
                8: "2rem",
            },
        },
    },
    plugins: [
        createThemes(
            ({ light, dark }) => ({
                light: light({
                    background: colors.stone[200] /* remember to change this in index.html too */,
                    text: colors.stone[900],
                    subtle: colors.stone[400],
                    accent: primary[400],
                    "accent-text": primary[600],
                    outline: primary[500],
                    link: {
                        DEFAULT: primary[600],
                        hover: primary[500],
                        active: primary[400],
                    },
                    button: {
                        fill: primary[200],
                        hover: primary[100],
                        active: primary[50],
                        "active-label": colors.black,
                        label: colors.black,
                        disabled: colors.stone[400],
                    },
                    header: {
                        label: colors.stone[900],
                        button: {
                            label: colors.stone[500],
                            "hover-label": colors.stone[400],
                            active: primary[100],
                            "active-label": colors.black,
                        },
                    },
                    input: {
                        background: colors.stone[100],
                        placeholder: colors.stone[500],
                        border: colors.stone[800],
                        highlight: primary[200],
                        hover: primary[50],
                        dropdown: colors.stone[300],
                        listsep: colors.stone[500],
                    },
                    guess: {
                        correct,
                        wrong,
                        skipped: colors.stone[500],
                        current: colors.stone[800],
                        unused: colors.stone[300],
                    },
                }),
                dark: dark({
                    background: colors.stone[800] /* remember to change this in index.html too */,
                    text: colors.stone[100],
                    subtle: colors.stone[400],
                    accent: primary[500],
                    "accent-text": primary[300],
                    outline: primary[100],
                    link: {
                        DEFAULT: primary[100],
                        hover: primary[50],
                        active: colors.white,
                    },
                    button: {
                        fill: primary[500],
                        hover: primary[300],
                        active: primary[100],
                        "active-label": colors.black,
                        label: colors.white,
                        disabled: colors.stone[700],
                    },
                    header: {
                        label: colors.white,
                        button: {
                            label: colors.stone[400],
                            "hover-label": colors.white,
                            active: primary[100],
                            "active-label": colors.black,
                        },
                    },
                    input: {
                        background: colors.stone[700],
                        placeholder: colors.stone[400],
                        border: colors.white,
                        highlight: primary[700],
                        hover: primary[800],
                        dropdown: colors.stone[800],
                        listsep: colors.stone[700],
                    },
                    guess: {
                        correct,
                        wrong,
                        skipped: colors.stone[700],
                        current: colors.stone[500],
                        unused: colors.stone[300],
                    },
                }),
            }),
            {
                defaultTheme: "dark",
            }
        ),
    ],
};
