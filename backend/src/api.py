from dotenv import load_dotenv
import os
from flask import Flask, request, jsonify, abort
from sqlalchemy import exc
import json
from flask_cors import CORS

from .database.models import db_drop_and_create_all, setup_db, Drink, db
from .auth.auth import AuthError, requires_auth
from sqlalchemy.exc import SQLAlchemyError


load_dotenv()
database_path = os.environ.get('DATABASE_URL')

app = Flask(__name__)
setup_db(app)
CORS(app, resources={r"/*": {"origins": "*"}})

'''
@DONE uncomment the following line to initialize the datbase
!! NOTE THIS WILL DROP ALL RECORDS AND START YOUR DB FROM SCRATCH
!! NOTE THIS MUST BE UNCOMMENTED ON FIRST RUN
!! Running this funciton will add one
'''
with app.app_context():
    db_drop_and_create_all()

# ROUTES
'''
@TODO implement endpoint
    GET /drinks
        it should be a public endpoint
        it should contain only the drink.short() data representation
        returns status code 200 and json {"success": True, "drinks": drinks}
        where drinks is the list of drinks
        or appropriate status code indicating reason for failure
'''


@app.route('/drinks', methods=['GET', 'POST'])
def drinks():
    if request.method == 'GET':
        try:
            drinks = Drink.query.all()
            formatted_drinks = [drink.short() for drink in drinks]
            return jsonify({
                'success': True,
                'drinks': formatted_drinks
            }), 200
        except Exception as e:
            print(f"An error occurred: {e}")
            abort(500)

    elif request.method == 'POST':
        return create_drink()

@requires_auth('post:drinks')
def create_drink(payload):
    print("Inside create_drink function")
    try:
        data = request.get_json()
        print(f"Received data: {data}")

        title = data.get('title')
        recipe = data.get('recipe')

        if title is None:
            abort(
                400,
                description="Title must be provided (can be empty\
                string)"
                )

        if not isinstance(recipe, list):
            abort(400, description="Recipe must be a list")

        if not isinstance(recipe, list):
            abort(400, description="Recipe must be a list")

        valid_recipe = [
            ing for ing in recipe
            if ing.get('name') or ing.get('color') != 'white' or ing.get('parts') != 1
        ]

        if not valid_recipe and recipe:
            valid_recipe = [recipe[0]]

        recipe_json = json.dumps(valid_recipe)

        new_drink = Drink(title=title, recipe=recipe_json)

        db.session.add(new_drink)
        db.session.commit()

        return jsonify({
            'success': True,
            'drinks': [new_drink.long()]
        }), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f'Database error occurred: {e}')
        abort(500, description="An error occurred while creating the drink")

    except Exception as e:
        print(f'An error occurred: {e}')
        abort(400, description=str(e))


'''
@DONE implement endpoint
    GET /drinks-detail
        it should require the 'get:drinks-detail' permission
        it should contain the drink.long() data representation
        returns status code 200 and json {"success": True, "drinks": drinks}
        where drinks is the list of drinks
        or appropriate status code indicating reason for failure
'''


@app.route('/drinks-detail', methods=['GET'])
@requires_auth('get:drinks-detail')
def get_drinks_details(payload):
    try:
        print(f"Payload received: {payload}")
        drinks = Drink.query.all()
        formatted_drinks = [drink.long() for drink in drinks]
        print(f"Formatted drinks: {formatted_drinks}")
        return jsonify({
            'success': True,
            'drinks': formatted_drinks
        }), 200
    except Exception as e:
        print(f"An error occurred: {e}")
        abort(500)


'''
@TODO implement endpoint
    POST /drinks
        it should create a new row in the drinks table
        it should require the 'post:drinks' permission
        it should contain the drink.long() data representation
        returns status code 200 and json {"success": True, "drinks": drink}
        where drink an array containing only the newly created drink
        or appropriate status code indicating reason for failure
'''


'''
@TODO implement endpoint
    PATCH /drinks/<id>
        where <id> is the existing model id
        it should respond with a 404 error if <id> is not found
        it should update the corresponding row for <id>
        it should require the 'patch:drinks' permission
        it should contain the drink.long() data representation
        returns status code 200 and json {"success": True, "drinks": drink}
        where drink an array containing only the updated drink
        or appropriate status code indicating reason for failure
'''


'''
@TODO implement endpoint
    DELETE /drinks/<id>
        where <id> is the existing model id
        it should respond with a 404 error if <id> is not found
        it should delete the corresponding row for <id>
        it should require the 'delete:drinks' permission
    returns status code 200 and json {"success": True, "delete": id} where id is the id of the deleted record
        or appropriate status code indicating reason for failure
'''


# Error Handling
'''
Example error handling for unprocessable entity
'''


@app.errorhandler(422)
def unprocessable(error):
    return jsonify({
        "success": False,
        "error": 422,
        "message": "unprocessable"
    }), 422


'''
@TODO implement error handlers using the @app.errorhandler(error) decorator
    each error handler should return (with approprate messages):
             jsonify({
                    "success": False,
                    "error": 404,
                    "message": "resource not found"
                    }), 404

'''

'''
@TODO implement error handler for 404
    error handler should conform to general task above
'''


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": 404,
        "message": "resource not found"
    }), 404


'''
@TODO implement error handler for AuthError
    error handler should conform to general task above
'''


@app.errorhandler(AuthError)
def handle_auth_error(ex):
    response = jsonify(ex.error)
    response.status_code = ex.status_code
    return response


if __name__ == '__main__':
    app.run(debug=True)
