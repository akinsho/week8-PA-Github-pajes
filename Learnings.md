# What we have learnt

### Executing a shell script

We used Rory's script in his solution to set up our config.env with our base url, github client id and client secret. It also set up our keys.

The command to run the file in your terminal is: `chmod +x /path/to/yourscript.sh`

Then run the file: `./fileName.sh`

### Init script:
```sh
openssl genrsa -out key.pem 2048
openssl req -new -key key.pem -out csr.pem -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost"
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
mkdir keys
mv cert.pem keys/cert.pem
mv key.pem keys/key.pem


echo 'Enter client_id and press [ENTER]'
read client_id

echo 'Enter client_secret and press [ENTER]'
read client_secret

echo 'Enter secret (can use anything) and press [ENTER]'
read secret

echo "BASE_URL=https://localhost:3000
CLIENT_ID=$client_id
CLIENT_SECRET=$client_secret
SECRET=$secret" > config.env
```

## Issues with forms

When redirecting in routes using a form and a button, we need to make sure the method matches the action in the route. We had an issue where our method from last week was 'post' which meant that when we clicked 'login', it was only taking us to github on refreshing the page.

````html
<form class="header__form" action="/logged-in" method="post">
```
