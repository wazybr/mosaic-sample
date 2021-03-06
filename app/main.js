import { Application } from "#mosaic/core/index.js";
import { View } from "#mosaic/core/index.js";
import { ComplexLength } from "#mosaic/layout/index.js";
import { Button, Surface } from "#mosaic/widgets/index.js";
import { Text } from "#mosaic/widgets/index.js";
import { AppBar } from "#mosaic/widgets/index.js";
import { Card } from "#mosaic/widgets/index.js";
import { StrokeStyle, Color, CornerRadius, RectangleShape, StarShape, ShadowStyle } from "#mosaic/drawing/index.js";
import { Theme, ThemeColor } from "#mosaic/resources/index.js";
import { NumberAnimator, AnimationState, Interpolator, BounceInterpolator, DecelerateInterpolator, OvershootInterpolator } from "#mosaic/animation/index.js";
import { Platform } from "#mosaic/platform/index.js";

/** @type {Application} */
let app;
let themes;

function initialize() {
	app = new Application({
		view: new View({
			children: [
				new AppBar(),
	
				new Card({
					id: "card",
					x: 16,
					y: 72,
					width: new ComplexLength(() => app.view.width - 32),
					height: 220,
					focusable: true
				}),
	
				new Text({
					id: "cardText",
					x: 16,
					y: 72,
					width: new ComplexLength(() => app.view.width - 32),
					height: 220,
					padding: 16,
					text: "Recent versions of Mosaic introduced an issue in that performance decreases over time after page load. The issue is present on Chromium for Desktop while DevTools is open and Chrome for Android. Edge for Android is fine, probably because it's still in M77. The issue is being investigated."
				}),
	
				new Button({
					id: "btn1",
					x: 16,
					y: 308,
					width: 94,
					height: 36
				}),
	
				new Button({
					id: "btn2",
					x: 120,
					y: 308,
					width: 96,
					height: 36,
					background: Color.transparent,
					stroke: new StrokeStyle(new ThemeColor("primary", Color.royalBlue), 2),
					shadow: null,
					shape: new RectangleShape(new CornerRadius(0, 16, 0, 16))
				}),
	
				new Surface({
					id: "star1",
					x: 232,
					y: 308,
					width: 36,
					height: 36,
					shape: new StarShape(7),
					background: Color.transparent,
					stroke: new StrokeStyle(new ThemeColor("primary", Color.royalBlue), 2)
				}),
	
				new Surface({
					id: "star2",
					x: 280,
					y: 308,
					width: 36,
					height: 36,
					shape: new StarShape(),
					background: new ThemeColor("primary", Color.royalBlue),
					shadow: new ShadowStyle(0, 2, 4, Color.fromRgb(0, 0, 0, .25))
				})
			]
		})
	});

	setupThemes();
	setupBtn1();
	setupBtn2();
	setupStar1();
	setupStar2();
	setTheme(themes.light);

	// Put app on global scope for debugging
	window.app = app;
	return app;
}

function setTheme(theme) {
	app.theme = theme;
	
	if ("themeColor" in Platform) {
		Platform.themeColor = app.theme.getColor("appBarBackground");
	}
}

function setupThemes() {
	themes = {
		light: new Theme({
			colors: {
				text: Color.fromHex("#000000d0"),
				background: Color.white,
				backgroundAlt: Color.whiteSmoke,
				primary: Color.royalBlue,
				appBarBackground: "primary",
				cardBackground: "background",
			}
		}),
			
		dark: new Theme({
			colors: {
				text: Color.fromHex("#ffffffd0"),
				background: Color.fromHex("#111"),
				backgroundAlt: Color.fromHex("#222"),
				primary: Color.fromHex("#849fff"),
				appBarBackground: "backgroundAlt",
				cardBackground: "backgroundAlt"
			}
		})
	};
}

function setupBtn1() {
	const btn1 = app.findById("btn1");
	
	btn1.onClick.add(() => {
		setTheme(app.theme === themes.light ? themes.dark : themes.light);
		return true;
	});
}

function setupBtn2() {
	const btn2 = app.findById("btn2");
	const y0 = btn2.y;
	const y1 = y0 + btn2.height + 16;

	let forwards = true;

	const animator = new NumberAnimator({
		duration: 450,
		interpolator: new OvershootInterpolator(3),
		callback(y) {
			btn2.y = y;
		}
	});

	btn2.onClick.add(() => {
		if (animator.state === AnimationState.stopped) {
			if (forwards) {
				animator.from = y0;
				animator.to = y1;
			} else {
				animator.from = y1;
				animator.to = y0;
			}
			
			animator.start();
			forwards = !forwards;
		}
	});
}

function setupStar1() {
	const star1 = app.findById("star1");
	
	new NumberAnimator({
		from: star1.y,
		to: star1.y - star1.height,
		duration: 800,
		iterations: Infinity,

		interpolator: new class extends Interpolator {
			interpolate(progress) {
				return -1 * (progress * 2 - 1) ** 2 + 1;
			}
		}(),

		callback(y) {
			star1.y = y;
		}
	}).start();
}

function setupStar2() {
	const star2 = app.findById("star2");
	const y0 = star2.y;
	const y1 = star2.y - 50;

	const jumpAnimator = new NumberAnimator({
		from: y0,
		to: y1,
		duration: 300,
		interpolator: new DecelerateInterpolator(),

		callback(y) {
			star2.y = y;
		},

		endCallback() {
			fallAnimator.start();
		}
	});

	const fallAnimator = new NumberAnimator({
		from: y1,
		to: y0,
		duration: 1200,
		interpolator: new BounceInterpolator(),

		callback(y) {
			star2.y = y;
		},

		endCallback() {
			setTimeout(() => jumpAnimator.start(), 500);
		}
	});

	jumpAnimator.start();
}

initialize();