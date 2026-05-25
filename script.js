function evaluateExpression(expr, x, y) {

    expr = expr
        .replace(/\^/g, '**')
        .replace(/x/g, `(${x})`)
        .replace(/y/g, `(${y})`);

    try {
        const result = Function(
            '"use strict"; return (' + expr + ')'
        )();

        return isFinite(result) ? result : null;

    } catch {
        return null;
    }
}

document.getElementById('calc-btn').addEventListener('click', () => {

    const odeExpr = document.getElementById('ode-input').value;

    const x0 = parseFloat(document.getElementById('x0-input').value);

    const y0 = parseFloat(document.getElementById('y0-input').value);

    const h = parseFloat(document.getElementById('step-input').value);

    const steps = parseInt(document.getElementById('steps-input').value);

    const errorMsg = document.getElementById('error-msg');

    const resultsContainer =
        document.getElementById('results-container');

    if (!odeExpr || isNaN(x0) || isNaN(y0) || isNaN(h) || isNaN(steps)) {

        errorMsg.textContent =
            'Please fill all fields correctly.';

        errorMsg.classList.remove('hidden');

        return;
    }

    errorMsg.classList.add('hidden');

    let x = x0;
    let y = y0;

    const tbody = document.getElementById('results-body');

    tbody.innerHTML = '';

    for (let i = 0; i < steps; i++) {

        const f1 = evaluateExpression(odeExpr, x, y);

        const yTilde = y + h * f1;

        const xNext = x + h;

        const f2 = evaluateExpression(
            odeExpr,
            xNext,
            yTilde
        );

        const yNext =
            y + (h / 2) * (f1 + f2);

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${i}</td>
            <td>${x.toFixed(4)}</td>
            <td>${y.toFixed(6)}</td>
            <td>${f1.toFixed(6)}</td>
            <td>${yTilde.toFixed(6)}</td>
            <td>${f2.toFixed(6)}</td>
            <td>${yNext.toFixed(6)}</td>
        `;

        tbody.appendChild(row);

        x = xNext;
        y = yNext;
    }

    document.getElementById('final-result').textContent =
        `y(${x.toFixed(4)}) ≈ ${y.toFixed(8)}`;

    resultsContainer.classList.remove('hidden');
});


// Safe math expression evaluator
function evaluateExpression(expr, x, y) {
    // Replace ^ with **
    let processed = expr.replace(/\^/g, '**');
    // Replace x and y with their numeric values in parentheses
    processed = processed.replace(/x/g, `(${x})`).replace(/y/g, `(${y})`);
    // Allowed pattern: numbers, operators, parentheses, dots, and common math functions
    const allowed = /^[\d+\-*/().\s,sin|cos|tan|sqrt|exp|log|abs|pi|e**]*$/i;
    if (!allowed.test(processed.replace(/sin|cos|tan|sqrt|exp|log|abs|pi|e/g, ''))) {
        return null;
    }
    try {
        // Use Function constructor for safe evaluation
        const fn = new Function('return (' + processed + ')');
        const result = fn();
        return isFinite(result) ? result : null;
    } catch (e) {
        return null;
    }
}

// Heun's method iteration
function heunStep(f, x, y, h) {
    const f1 = f(x, y);
    if (f1 === null) return null;
    const yTilde = y + h * f1;
    const xNext = x + h;
    const f2 = f(xNext, yTilde);
    if (f2 === null) return null;
    const yNext = y + (h / 2) * (f1 + f2);
    return { xNext, yNext, f1, yTilde, f2 };
}

// Main calculation handler
document.addEventListener('DOMContentLoaded', () => {
    const calcBtn = document.getElementById('calc-btn');
    const odeInput = document.getElementById('ode-input');
    const x0Input = document.getElementById('x0-input');
    const y0Input = document.getElementById('y0-input');
    const stepInput = document.getElementById('step-input');
    const stepsInput = document.getElementById('steps-input');
    const errorMsg = document.getElementById('error-msg');
    const resultsContainer = document.getElementById('results-container');
    const resultsBody = document.getElementById('results-body');
    const finalResultSpan = document.getElementById('final-result');

    calcBtn.addEventListener('click', () => {
        // Hide previous results and error
        resultsContainer.classList.add('hidden');
        errorMsg.classList.add('hidden');

        // Get values
        const odeStr = odeInput.value.trim();
        const x0 = parseFloat(x0Input.value);
        const y0 = parseFloat(y0Input.value);
        const h = parseFloat(stepInput.value);
        const steps = parseInt(stepsInput.value, 10);

        // Validation
        if (!odeStr) {
            errorMsg.textContent = 'Please enter an ODE expression.';
            errorMsg.classList.remove('hidden');
            return;
        }
        if (isNaN(x0) || isNaN(y0) || isNaN(h) || isNaN(steps)) {
            errorMsg.textContent = 'All fields must contain valid numbers.';
            errorMsg.classList.remove('hidden');
            return;
        }
        if (h <= 0) {
            errorMsg.textContent = 'Step size must be positive.';
            errorMsg.classList.remove('hidden');
            return;
        }
        if (steps < 1 || steps > 200) {
            errorMsg.textContent = 'Steps must be between 1 and 200.';
            errorMsg.classList.remove('hidden');
            return;
        }

        // Define f(x,y) evaluator
        const f = (xVal, yVal) => evaluateExpression(odeStr, xVal, yVal);

        // Perform iterations
        let x = x0;
        let y = y0;
        const rows = [];

        for (let i = 0; i < steps; i++) {
            const stepResult = heunStep(f, x, y, h);
            if (stepResult === null) {
                errorMsg.textContent = 'Error evaluating ODE expression. Check syntax (use x, y, +, -, *, /, ^, sin, cos, etc.).';
                errorMsg.classList.remove('hidden');
                return;
            }
            rows.push({
                step: i,
                x: x,
                y: y,
                f1: stepResult.f1,
                yTilde: stepResult.yTilde,
                f2: stepResult.f2,
                yNext: stepResult.yNext,
                xNext: stepResult.xNext
            });
            x = stepResult.xNext;
            y = stepResult.yNext;
        }

        // Render table
        resultsBody.innerHTML = '';
        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.step}</td>
                <td>${row.x.toFixed(6)}</td>
                <td>${row.y.toFixed(8)}</td>
                <td>${row.f1.toFixed(8)}</td>
                <td>${row.yTilde.toFixed(8)}</td>
                <td>${row.f2.toFixed(8)}</td>
                <td>${row.yNext.toFixed(8)}</td>
            `;
            resultsBody.appendChild(tr);
        });

        // Show final result
        finalResultSpan.textContent = `y(${x.toFixed(6)}) ≈ ${y.toFixed(10)}`;
        resultsContainer.classList.remove('hidden');
    });
});