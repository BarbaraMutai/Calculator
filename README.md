# Flask Calculator

A small calculator: HTML/CSS/JavaScript front end, Python (Flask) back end.

## Project structure

```
calculator-app/
├── app.py              # Flask server + /api/calculate endpoint
├── test_app.py         # Automated tests for the API
├── requirements.txt    # Python dependencies
├── templates/index.html
└── static/
    ├── style.css
    └── script.js
```

## Setup

Requires Python 3.9+.

```bash
cd calculator-app

# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # macOS/Linux
venv\Scripts\activate             # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run the app
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## Run the tests

```bash
python -m unittest
```

## API

`POST /api/calculate` with JSON:

```json
{ "a": 6, "b": 7, "operation": "multiply" }
```

Operations: `add`, `subtract`, `multiply`, `divide`.

Success (200): `{ "a": 6.0, "b": 7.0, "operation": "multiply", "result": 42.0 }`
Error (400): `{ "error": "Cannot divide by zero. Change the second number." }`

Try it from a terminal:

```bash
curl -X POST http://127.0.0.1:5000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"a": 10, "b": 4, "operation": "divide"}'
```

## Notes

- `debug=True` in `app.py` is for local development only. Do not use it in production.
- The server validates all input, even though the browser checks too.
