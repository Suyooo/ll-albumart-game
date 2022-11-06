This is a modified version of the autocompleter module based off of commit `baba200a`.  
https://www.npmjs.com/package/autocompleter  
https://github.com/kraaden/autocomplete

Changes include:
- Accessibility improvements (also submitted in PR #96)
- Always use `input` event instead of `keyup` event to update suggestions, so IMEs work correctly
- Removing some deprecated properties/types to avoid hints polluting svelte-check output
- Expose clear() method to allow closing the dropdown if an autocomplete was picked

In order to match the original author's license, this modification too is licensed under the MIT License (as opposed to
the GPL3 License the rest of this project is under).