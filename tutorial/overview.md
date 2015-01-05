<step title="Welcome" file="package.json" language="json">
## Building Two-Factor Authentication in Node.js with Express
Adding two-factor authentication (2FA) to your web application can help increase the security of your user's data. [Multi-factor authentication](http://en.wikipedia.org/wiki/Multi-factor_authentication) determines the identity of a user by validating one or more of the following "factors":

* _Knowledge Factors_ (Something a user knows, like a password)
* _Posession Factors_ (Something a user has, like a mobile phone)
* _Inheritance Factors_ (Something a user is, like a person with a unique finger print)

We're about to walk you through a sample application that implements a simple login system with a _knowledge factor_ and a _posession factor_. For the knowledge factor, we will use a standard username/password system. For the possession factor, we will validate that the user has their mobile phone by sending them a one-time passcode in a text message or phone call [sent via Twilio](http://www.twilio.com/). Click on the image below to view a diagram of how this works at a high level:

![How Twilio 2FA Works](/tutorial/images/diagram.png)

### Let's Go!
Let's begin by showing how to run this application locally, after which we'll dive in to the project's structure to understand what's in the box. Click the right arrow button above to move on to the next section of the tutorial.
</step>

<step title="Installing Dependencies" file="package.json">
## Installing Dependencies
We will assume at this point that you have installed [Node.js](http://www.nodejs.org) on your system. The default installer should put both the `node` and `npm` commands on your system path.

After you have downloaded or cloned the source code for this application, you will need to install its dependencies from [npm](http://www.npmjs.org).  Open a terminal window in the directory where you downloaded the code and run:

```bash
npm install
```

This will install the necessary third party dependencies for this application. Let's take a quick look at what those are.

<chunk highlight="18">
### Express Framework
This application uses the [Express](http://expressjs.com) web framework, one of the most popular high-level web frameworks for Node.js. Built atop [Connect](https://github.com/senchalabs/connect), an Express application is essentially a series of [middleware functions](http://expressjs.com/guide/using-middleware.html) that together process and render a response to an HTTP request.
</chunk>

<chunk highlight="15-17,19,22-23">
### Connect Middleware
Express doesn't actually ship with much functionality that helps you process those HTTP requests, however. Most Express applications employ a variety of open source middleware components like these to handle common tasks like parsing POST bodies, adding [CSRF](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_%28CSRF%29_Prevention_Cheat_Sheet) protection tokens for form submissions, and storing data in an HTTP session.
</chunk>

<chunk highlight="25">
### Twilio Module
Of course, we also need the [twilio module for Node.js](http://twilio.github.io/twilio-node/), which makes sending text messages and making phone calls from your Twilio account very easy.

Now let's take a look at the configuration our application needs to run.
</chunk>

</step>

<step title="Configuring the Application" file="config.js" language="js">
## Configuring the Application

We've listed all the configuration our application requires in `config.js` to keep it in a single place, but the actual values for most of these variables are being pulled in from the system environment. This is a good idea for more sensitive information like API keys, so they don't end up being checked in to source control.

Let's take a look at a few key bits of configuration.

<chunk highlight="6-8">
### Secret String
Here we configure a random string which we'll use as a seed to generate other random tokens in our application. You can set this to be anything you like.
</chunk>

<chunk highlight="10-21">
### Twilio Configuration
Here we configure information about our Twilio account, including our account credentials and a phone number we'll use to make outbound calls or send text messages.

Now we have our dependencies and configuration all set - let's see how we would actually run our application.
</chunk>

</step>

<step title="Running the Application" file="index.js" language="js">
## Running the Application

The bootstrap file for our application is `index.js`. This program will `require` an Express web app we've configured in another file.  To start this application on the configured HTTP port, simply execute this program from the terminal with:

```bash
node index.js
```

Let's check out that web application module to see how our Express application is configured.
</step>

<step title="Express Application Configuration" file="webapp.js" language="js">
## Express Application Configuration

In `webapp.js` we create and configure an Express web application object. Here, we configure the order in which middleware functions are executed, mount the route handlers for our application's actual functionality, and configure application middleware that handles 404 and 500 error conditions.

This file is something of a beast - let's dig into exactly what's going on in a few key areas.

<chunk highlight="1-10">
### Dependencies

We begin by requiring our dependencies from core Node.js, third party modules, and our own local project.
</chunk>

<chunk highlight="12-14">
### Creating the Express App

Here, we create the actual Express web app and configure [Jade](http://jade-lang.com/) as the default template engine for generating HTML pages from our application.
</chunk>

<chunk highlight="16-43">
### Third-Party Middleware

Here we configure the third-party middleware we use in our application to handle concerns that aren't core to our application logic. In our case, these include tasks like handling HTTP sessions, parsing POST bodies, and persisting "flash" messages between requests to render in our HTML UI.
</chunk>

<chunk highlight="45-49">
### Application Logic

Here we start adding in logic that is specific to our example application.

First, we have a "user session" middleware that will look for session information that indicates a logged in user, and will automatically add the logged in User's information to an incoming HTTP request so we can use it in our controllers. We'll see how that works in greater depth later.

Next, we `require` a module that defines all of the [route handlers](http://expressjs.com/4x/api.html#app.METHOD) for our application. These routes will display login pages and secure pages that only a logged in user will see. We'll dive into these route definitions a little later on also.
</chunk>

<chunk highlight="51-73">
### Error Handling

Finally, we add handlers for 404 and 500 error conditions in our application. 

In the first middleware function, we assume that because no other middleware or route has handled the request so far, the resource could not be found. We return a 404 response and send a static HTML file in reply to a request for a page that doesn't exist.

In the second function, we handle any error conditions that were not handled further up the middleware stack, like any unhandled exceptions. We have a special check for expired CSRF tokens, but most 500 errors will result in a static 500 error page.
</chunk>

</step>

<step title="The Story So Far" file="webapp.js" language="js">
## The Story So Far

So far, we have explored our application's dependencies, configured it to run, and stepped through how the application is initialized. With those implementation details out of the way, we can take a step back and think about what kind of domain model features we'll need to support 2FA in our application.
</step>