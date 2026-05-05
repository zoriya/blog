import catppuccinLatte from "@shikijs/themes/catppuccin-latte";

const catppuccinLatteCustom = {
	...catppuccinLatte,
	name: "catppuccin-latte-custom",
	colors: {
		...catppuccinLatte.colors,
		"editor.background": "#e6e9ef",
	},
};

export default catppuccinLatteCustom;
