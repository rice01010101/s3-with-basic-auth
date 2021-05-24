import base64
import json

def lambda_handler(event, context):
    request = event['Records'][0]['cf']['request']
    headers = request['headers']

    user = 'user'
    password = 'pass'

    basic_user_and_pasword = 'Basic ' + base64.b64encode('{}:{}'.format(user, password).encode('utf-8')).decode('ascii')

    if (headers.get('authorization') == None or headers['authorization'][0]['value'] != basic_user_and_pasword):
        body = 'Unauthorized'
        response = {
            'status': '401',
            'statusDescription': 'Unauthorized',
            'body': body,
            'headers': {
                'www-authenticate': [
                    {
                        'key': 'WWW-Authenticate',
                        'value':'Basic'
                    }
                ]
            }
        }

        return response

    return request