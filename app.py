"""Simple calculator back end built with Flask.

Routes:
    GET  /               -> serves the web page
    POST /api/calculate  -> JSON in, JSON out
"""
import math

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


class CalculationError(Exception):
    """Raised when the request is invalid. Carries a message for the user."""


def divide(a, b):
    if b == 0:
        raise CalculationError("Cannot divide by zero. Change the second number.")
    return a / b


# Maps each supported operation name to the function that performs it.
OPERATIONS = {
    "add": lambda a, b: a + b,
    "subtract": lambda a, b: a - b,
    "multiply": lambda a, b: a * b,
    "divide": divide,
}


def parse_number(value, label):
    """Convert a value to a finite float, or raise a clear error."""
    # bool is a subclass of int in Python, so reject it explicitly.
    if value is None or isinstance(value, bool) or str(value).strip() == "":
        raise CalculationError(f"Enter a number for the {label} field.")
    try:
        number = float(value)
    except (TypeError, ValueError):
        raise CalculationError(f"The {label} value is not a valid number.")
    if not math.isfinite(number):  # blocks "nan", "inf", "-inf"
        raise CalculationError(f"The {label} value must be a finite number.")
    return number


@app.get("/")
def index():
    return render_template("index.html")


@app.post("/api/calculate")
def calculate():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify(error="Send a JSON body with a, b and operation."), 400

    try:
        a = parse_number(data.get("a"), "first number")
        b = parse_number(data.get("b"), "second number")

        operation = data.get("operation")
        if operation not in OPERATIONS:
            supported = ", ".join(OPERATIONS)
            raise CalculationError(
                f"Unsupported operation '{operation}'. Use one of: {supported}."
            )

        result = OPERATIONS[operation](a, b)
        if not math.isfinite(result):  # e.g. 1e308 * 10 overflows to infinity
            raise CalculationError("The result is too large to display.")
    except CalculationError as err:
        return jsonify(error=str(err)), 400

    return jsonify(result=result, operation=operation, a=a, b=b)


if __name__ == "__main__":
    # debug=True reloads on code changes. Turn it off in production.
    app.run(debug=True)