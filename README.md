Shopify Intro App 
---
Welcome! This is a sample shopify app that's using:
- NextJS for the app dashboard
- NodeJS on the backend
- Mongo as a DB

The app archtitecture consists of the following 3 parts
1. App admin dashboard 
2. Storefront widget (React) - bundled with webpack
3. Server


🏁Start here
---

Quick Start Guide - Don't start without going over these bullets, they'll save your time.
1. Git clone the repo: `git clone https://github.com/magicaldev3000/cvsnbear-intro-app.git`
2. Create your own dev branch and `yarn install` - install all the dependencies
3. Create your own .env file using the .env.sample file included in the repo. In your .env file fill in **your** shopify api key and secret key. Also include your ngrok tunnel url. See [Shopify node app tutorial](https://github.com/Shopify/shopify-demo-app-node-react) on how to obtain these
4. `brew services start mongodb` then run `mongo` to stat the mongo shell, mongo will run at mongodb://127.0.0.1:27017.
5. `yarn run dev` - to run the project locally
6. Run `yarn run build:widget` to build the storefront widget component
7. Run `ngrok http 3000` - this starts a tunnel from port 3000 to ngrok. Go to [ngrok](https://ngrok.com/) and install the CLI. This allows you to expose a public URL for the app. 
8. IMPORTANT: Go to the app setup console [at the shopify partners center](https://partners.shopify.com/1018339/apps/2988825/edit) and change the app url and the redirection url to the ngrok link: app url should be: `<ngrok-url>`, whitelisted redirect url should be `<ngrok-url>/auth/callback`. **Both must be served over https**. In order to run the app you must create a shopify app and go through the shopify auth flow. For more details see: [Shopify node app tutorial repo](https://github.com/Shopify/shopify-demo-app-node-react) and [Shopify node app tutoria](https://developers.shopify.com/tutorials/build-a-shopify-app-with-node-and-react)
9. Change the tunnel url in the .env file to the new ngrok url. Make sure that it ends with a `/` and that its https.
10. Install the app on a shopify development store and you'll see the app settings panel running inside the shopify admin dashboard.
11. Enable the app by clicking 'Enable' in the app settings, then visit your store url to see the sticky button app on one of the stores product pages.

When you're done developing the feature:
---
1. Do your thing and make sure the project runs without any additional logs or errors
3. Make sure you test your feature on mobile(first)! and then desktop
4. When you're done push your code to a **separate** branch
5. If the code quality is OK and the feature matches the spec we'll ask you to make a PR one of our branches, when you make a PR make sure that you commit ONLY the relevant files that you changed. Make sure to not include build artifacts, local files and other files that are irrelvant to the feature