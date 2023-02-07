![DeSo Logo](src/assets/deso/camelcase_logo.svg)

# About DeSo

DeSo is a L1 blockchain built from the ground up to support a fully-featured
social network. Its architecture is similar to Bitcoin, only it supports complex
social network data like profiles, posts, follows, creator coin transactions, and
more.

[Read about the vision](https://docs.deso.org/#the-ultimate-vision)

# Online development setup

1. Open frontend repo in Gitpod

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/desolabs-org/frontend)

You can use any repo / branch URL and just prepend `https://gitpod.io/#` to it.

2. If needed, login to your github account

3. Set the correct `lastLocalNodeV2` to `"https://node.desolabs.org"` in your browser Local Storage for the gitpod preview URL

4. Create a new branch to start working

To commit / submit a pull request from gitpod, you will need to give gitpod additional permissions to your github account: `public_repo, read:org, read:user, repo, user:email, workflow` which you can do on the [GitPod Integrations page](https://gitpod.io/integrations).

# Local development setup

1. Clone the repo, install dependencies and run at localhost:
```
git clone git@github.com:desolabs-org/frontend.git
cd frontend
npm install
npm start -- --disable-host-check
```

2. Get a SSL cert for `*.dev.desolabs.org`:
```
openssl genpkey -out dev-desolabs.key -algorithm RSA -pkeyopt rsa_keygen_bits:2048
openssl req -new -key dev-desolabs.key -out dev-desolabs.csr
openssl x509 -req -days 3650 -in dev-desolabs.csr -signkey dev-desolabs.key -out dev-desolabs.crt
```

3. Get a local proxy providing ssl `https://frontend.dev.desolabs.org`
* Nginx configuration example
```
upstream desolabs_frontend {
    server localhost:4200;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    ssl_certificate ssl-local/dev.desolabs.org/dev-desolabs.crt;
    ssl_certificate_key ssl-local/dev.desolabs.org/dev-desolabs.key;

    server_name frontend.dev.desolabs.org;

    try_files $uri /index.html =404;

    location / {
        proxy_pass http://desolabs_frontend;
    }

    location /api/ { 
        proxy_pass https://node.desolabs.org/;
        proxy_redirect off;
    }
}
```

4. Update `/etc/hosts` with `127.0.0.1 frontend.dev.desolabs.org`

5. Accept the self-signed certificate in browser