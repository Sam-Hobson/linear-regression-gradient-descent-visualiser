function computeCost(x, y, w, b) {
	const m = x.length
	let cost_sum = 0;

	for (let i = 0; i < m; i++) {
		const f_wb = w * x[i] + b
		const cost = (f_wb - y[i]) ** 2
		cost_sum += cost;
	}

	return (1 / (2 * m)) * cost_sum;
}

function optimalLinearRegression(x, y) {
	// Calculate figures for least squares method to get optimal w and b
	const sumX = x.reduce((a, b) => a + b, 0);
	const sumY = y.reduce((a, b) => a + b, 0);
	const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
	const sumX2 = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
	const m = x.length;

	const w_optimal = (m * sumXY - sumX * sumY) / (m * sumX2 - sumX * sumX);
	const b_optimal = (sumY - w_optimal * sumX) / m;

	return {
		w: w_optimal,
		b: b_optimal
	}
}


class ScatterPlot {
	constructor(x, y, renderFunc) {
		this.x = x;
		this.y = y;
		this.renderFunc = renderFunc;
	}

	setRegressionLine(w, b) {
		const xMin = Math.min(...this.x);
		const xMax = Math.max(...this.x);
		const xRegression = [xMin, xMax];
		const yRegression = [w * xMin + b, w * xMax + b];

		this.regressionLine = {
			x: xRegression,
			y: yRegression,
			mode: 'lines',
			type: 'scatter',
			name: 'Regression Line',
			line: { color: 'red' }
		};
	}

	deleteRegressionLine() {
		this.regressionLine = undefined;
	}

	render() {
		let res = [{
			x: this.x,
			y: this.y,
			mode: 'markers',
			type: 'scatter',
			name: 'Data Points'
		}];

		if (this.regressionLine !== undefined) {
			res.push(this.regressionLine);
		}

		this.renderFunc(this, res, undefined);
	}
}


class CostFunctionPlot {
	constructor(x, y, props, renderFunc) {
		this.x = x;
		this.y = y;

		const optimal_wb = optimalLinearRegression(x, y);
		this.w_optimal = optimal_wb.w;
		this.b_optimal = optimal_wb.b;

		this.props = props;
		this.renderFunc = renderFunc;
		this.gradientDescentPoints = [];
	}

	render() {
		const range = 1;
		const numPoints = 100;
		const w_range = [...Array(numPoints).keys()].map(i => (this.w_optimal - range) + range * (i / (numPoints / 2)));
		const b_range = [...Array(numPoints).keys()].map(i => (this.b_optimal - range) + range * (i / (numPoints / 2)));
		const costValues = w_range.map(w => {
			return b_range.map(b => {
				return computeCost(this.x, this.y, w, b);
			});
		});

		let res = [
			{
				x: w_range,
				y: b_range,
				z: costValues,
				type: 'contour',
				hovertemplate: `w:%{x:.2f} b:%{y:.2f} cost:%{z:.2f}`
			},
		];

		if (this.gradientDescentPoints.length > 0) {
			res.push({
				x: this.gradientDescentPoints.map(c => c.w),
				y: this.gradientDescentPoints.map(c => c.b),
				mode: 'lines+markers',
				type: 'scatter',
				name: 'Gradient Descent Path',
				hovertemplate: `w:%{x:.2f} b:%{y:.2f}`
			});
		}

		const layout = {
			xaxis: {
				title: {
					text: 'w (gradient)'
				}
			},
			yaxis: {
				title: {
					text: 'b (constant)'
				}
			},
		};

		this.renderFunc(this, res, layout);
	}

	placeGradientPoint(w, b) {
		// Add this point to the gradient descent if this is the starting point
		if (this.gradientDescentPoints.length > 0) {
			this.clearGradientPoints();
		}
		this.gradientDescentPoints.push({ w: w, b: b });
		return { w: w, b: b };
	}

	clearGradientPoints() {
		this.gradientDescentPoints = [];
	}

	stepGradientDescent() {
		console.log(`Learning rate: ${this.props().learningRate}`);
		if (this.gradientDescentPoints.length === 0) {
			return undefined;
		}

		const currentPoint = this.gradientDescentPoints[this.gradientDescentPoints.length - 1]
		const m = this.x.length;

		let w_gradient = 0;
		let b_gradient = 0;

		for (let i = 0; i < m; i++) {
			const f_wb = currentPoint.w * this.x[i] + currentPoint.b;
			const error = f_wb - this.y[i];
			w_gradient += error * this.x[i];
			b_gradient += error;
		}

		const newPoint_w = currentPoint.w - (this.props().learningRate / m) * w_gradient;
		const newPoint_b = currentPoint.b - (this.props().learningRate / m) * b_gradient;

		this.gradientDescentPoints.push({
			w: newPoint_w,
			b: newPoint_b,
		})

		return {
			w: newPoint_w,
			b: newPoint_b
		};
	}
}
