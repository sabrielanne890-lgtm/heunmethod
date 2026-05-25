from flask import Flask, render_template

app = Flask(__name__)

# Home Page
@app.route("/")
def home():
    return render_template("index.html")

# Calculator Page
@app.route("/calculator")
def calculator():
    return render_template("calculator.html")

# Optional Custom 404 Page
@app.errorhandler(404)
def not_found(error):
    return render_template("index.html"), 404

# For local development
if __name__ == "__main__":
    app.run(debug=True)

# Required for Vercel deployment
app = app