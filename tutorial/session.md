<step title="The Main Router" file="controllers/router.js" language="js">
## The Main Router
When we configured our Express application earlier in `webapp.js`, we delegated the creation of application-specific routes to this file. This is the best place to start looking through the code which drives the 2FA user experience.

In this section of the tutorial, we'll walk through the server- and client-side code necessary to implement our HTTP session-based authentication system. Let's begin by showing how we declare routes in our Express application. After that, we'll briefly cover how users are created in our application before diving into the login flow.

<chunk highlight="1-8,27" language="js">
### Setting Up Routes
We've set up this module such that the object which is exported is a function that takes an Express web app as its only argument. That app is then extended with all the application-specific routes in our sample, starting with a route for the root URL.

We require all of our custom controllers and middleware first before setting up our routes. The first set of routes we define will be those that manage User-related functionality - let's briefly check those out next.
</chunk>

<chunk highlight="10-15" language="js">
### Creating Users
These routes handle creating new users and displaying information about logged in users.  When a new user is created, we collect their name, phone number, a password, and their contact preference for 2FA:

![New User Form](/tutorial/images/create-user.png)

We care mostly about how login works, though, so we won't spend too much time walking through the routes highlighted here.
</chunk>

<chunk highlight="12">
### Securing Routes
One thing I do want to point out, however, is that we protect one of the routes in our application with our custom `requireLogin` middleware. We want this route to be secured such that only the currently logged in user can see their own "profile page".

We'll dig into that middleware function after we show how the main login flow works.
</chunk>

<chunk highlight="17-26">
### Login Routes
These are the route handlers we'll spend the most time on - these routes power all the steps of the login flow:

* Displaying a login form
* Handling the password verification step and sending a one-time password via Twilio
* Displaying a form to accept the one-time password for validation
* Creating a valid Session for the current User
* Destroying a Session (logging out)

You'll notice that many of the routes contain an `id` parameter - we'll use this to identify which Session the user is trying to modify.

Let's check out the code which powers the password authentication step first.
</chunk>

</step>

<step title="Rendering the Login Form: Controller" file="controllers/session.js" highlight="4-7" language="js">
## Rendering the Login Form: Controller
The first step of authenticating our user is validating the "knowledge" factor - in this case, we'll use the trusty username and password.  

When the `/login` page is requested, we render a Jade template that contains our login form from the `views` directory.
</step>

<step title="Rendering the Login Form: View" file="views/session/create.jade" language="jade">
## A Login Form
This Jade template will render a login form that will prompt the user to enter their username and password. With a little Bootstrap styling, our form will look like this:

![The Login Form](/tutorial/images/login-form.png)

<chunk highlight="8">
### A Form Tag Helper
Here we use a [mixin](http://jade-lang.com/reference/mixins/) called `+formFor` to generate an HTML `form` tag. This handles setting the form action and method on the form tag its self, and embedding a CSRF protection token as a hidden field in the form.
</chunk>

<chunk highlight="11,15">
### Login Fields
We'll submit both the `username` and `password` fields to the server to validate a username and password. Let's take a look at that server-side code next.
</chunk>
</step>

<step title="Processing the Username and Password" file="controllers/session.js" language="js" highlight="9-50">
## Processing the Username and Password
After the form is submitted in the browser, this controller function will process the resulting HTTP POST request.

<chunk highlight="11-13">
### Form Fields
First, we get the username and password the user submitted through the form.
</chunk>

<chunk highlight="15-16,49">
### Testing the Password
Next, we asynchronously test the candidate username and password using the class-level function we saw previously on the `User` model.
</chunk>

<chunk highlight="17,44-48">
### Did it Work?
Inside the callback, we test whether or not the login was successful by checking for an error and validating that a user model does indeed exist with the given username and password.

If not, we set a "flash" message with an error that will be displayed in the HTML we send back with feedback to the user on what went wrong.
</chunk>

<chunk highlight="18-43">
### Creating a New, Unverified Session
If the username and password were correct, the user has cleared the first barrier in logging into the application. We will now create a `Session` object for them that needs to be verified with a one-time password we will send to their mobile phone via voice call or text message.
</chunk>

<chunk highlight="28-41">
### The Verification Code
If the session is saved successfully, we call the `sendVerification` instance method on the session object.  If the message is sent successfully, we render a new form which will allow them to enter the verification code they were sent.  Let's dive into the `Session` model again to see how the notification is actually sent using Twilio.
</chunk>

</step>

<step title="Sending The Verification Code" file="models/Session.js" language="js" highlight="95-107">
## Sending The Verification Code
Our Session model does most of the heavy lifting where the 2FA step is concerned. Let's see how we generate the one-time password the user will enter into our web form to validate the "possession" factor of our authentication scheme.

<chunk highlight="99-102">
### Generating a One-Time Password
Here, we use the [speakeasy](https://www.npmjs.com/package/speakeasy) module to generate a disposable [time-based one-time password](http://en.wikipedia.org/wiki/Time-based_One-time_Password_Algorithm) that we can send to a user's mobile phone. We assign the code to a property on the current Session model so that we can compare the code later when the user enters it.
</chunk>

<chunk highlight="104-106">
### Invoke the Twilio Bits
Using the generated code and information about the user associated with the Session (their phone number and contact preference), we can use Twilio to send them the code via voice or SMS. Let's see how that works now.
</chunk>

<chunk highlight="2-3,8-9">
### Creating a REST API Client
When the Session model module is loaded, we create an authenticated [REST API client](http://twilio.github.io/twilio-node/#restapi) using the `twilio` module and our [Twilio account information](https://www.twilio.com/user/account/voice-messaging). We'll re-use this client in every call to `sendCode`.
</chunk>

<chunk highlight="15-31">
### Sending the Code The Right Way
Depending on the user's contact preference, we will use the Twilio REST client to send them the generated one-time password.
</chunk>

<chunk highlight="25-29">
### Via Text Message
If the user chose to receive their verification code via text message, our job is pretty easy - just send them the code in a text message and you're done!
</chunk>

<chunk highlight="19-23">
### Via Voice Call
If the user chose to receive the code in a voice call, we have a little more work to do. We need to provide a [TwiML-generating URL on the public internet](https://www.twilio.com/docs/api/twiml) that contains instructions on how to read the verification code back to the user.

We could set up this endpoint on our own server, but Twilio provides a handy service (suitable for development and testing) that will simply [echo back any TwiML embedded in the URL](https://www.twilio.com/labs/twimlets/echo). All we need to do in our `Session` model is build a TwiML (XML) string that contains all the right instructions to read back the code.  We have a helper function that uses the `twilio` module to do just that - let's check out how that works.
</chunk>

<chunk highlight="33-69">
### Using the TwiML Helper
The `twilio` module has a [helper object that makes it easy to generate valid TwiML XML strings](http://twilio.github.io/twilio-node/#twimlResponse). We use that helper class in this function to build up TwiML instructions that will read back the verification code during a voice call, repeating the code three times.
</chunk>

<chunk highlight="35-47">
### Reading Back the Code
We begin by splitting the verification code string into an array of six number strings.  We then use the [Say](https://www.twilio.com/docs/api/twiml/say) verb to initiate the message to the user.

Using the `appendCode` function, we speak each number of the code back to the user one at a time.
</chunk>

<chunk highlight="49-63">
### Repeating the Code
The user might not get the code 100% the first time. We repeat it back to them twice, so they hear it a total of three times.
</chunk>

<chunk highlight="65-68">
### Rendering the TwiML XML String
Finally, we convert the TwiML helper object to an XML representation of the TwiML response we just built programmatically.

Now the verification code should be on its way! In the text message use case, the end user will receive the verification code in a message that looks like this:

![a verification code on iPhone](/tutorial/images/code.jpg)

Now, let's hop back out to the controller and see how we render the form that the user will enter their one-time password into.
</chunk>

</step>

<step title="Rendering the Verification Form: Controller" file="controllers/session.js" language="js" highlight="52-64">
## Rendering the Verification Form: Controller
After a successful login, this controller method is called to render a form that allows the user to enter in the verification code that was sent to their mobile phone.

<chunk highlight="54-55,59-63">
### Finding the Session
Using the URL parameter for the session ID, we locate the session object the user is trying to modify in their browser. If one exists, we display the validation form, otherwise we return a 404 error.
</chunk>

<chunk highlight="56-58">
### Rendering the Form
With a valid session found, we render a Jade template, passing in the ID of the session we're trying to validate. Let's take a look at that template next.
</chunk>

</step>

<step title="Rendering the Verification Form: View" file="views/session/verify.jade" language="jade">
## Rendering the Verification Form: View
On this form, the user can enter in their verification code from their mobile device, or request that a new code be sent to them. It should look a little something like this:

![A form for validating the one-time password](/tutorial/images/confirm.png)

<chunk highlight="13-20">
### The Form
This form has a single field - the verification code that was sent to the user. This will send an HTTP POST to the server to potentially complete the login process.
</chunk>

<chunk highlight="22-26">
### Client-Side JavaScript
There was a second button on the form as well. When clicked, JavaScript will execute on the page to resend a new code to the user. Let's take a quick look at that script also.
</chunk>

</step>

<step title="Rendering the Verification Form: JS" file="public/resend.js" language="js">
## Resending Codes
We want to allow our users to request a new validation code in case they didn't initially have cell coverage when they got the call, or missed the message for some reason. This script will enable that with a bit of AJAX.

<chunk highlight="9-12,25">
### Handling the Button Click
We use [jQuery](http://jquery.com/) to handle the click event for the second button on our form and disable the button until the resend request is complete.
</chunk>

<chunk highlight="14-24">
### Requesting a New Code
We send an AJAX request to our server to generate a new code for this session. We won't go into the code that does this on the server-side - it just re-uses the same `sendVerification` instance function on the `Session` object we've seen already, and returns a JSON response indicating a success or failure.  We use that data here to pop up an alert indicating that a new code has been sent.

Now, let's head back to the server side to see how we complete the login process.
</chunk>

</step>

<step title="Completing the Login Process" file="controllers/session.js" language="js" highlight="66-97">
## Completing the Login Process
In our session controller, our next job is to validate the one-time code our user entered to complete the login process.

<chunk highlight="70-91">
### Validating the Code
We start by comparing the entered code to the one we stored on the session model earlier - if they match up, we can finally validate their session!
</chunk>

<chunk highlight="73-74,86">
### Updating the Session
Here, we flip the bit on the user's session and save it - this session can now be used to make authenticated requests against our application.
</chunk>

<chunk highlight="81">
### Saving the Session Token
In order to authenticate future requests, we save a unique token string in the HTTP Session (via cookie storage), where our security middleware can access it. This will indicate that an incoming HTTP request has session state associated with it.
</chunk>

<chunk highlight="80-84">
### Rendering the User Profile Page
Finally, we redirect to the secure user profile page:

![A secure user profile page](/tutorial/images/success.png)

Awesome! Our user is now logged into the application.

Now that the user is logged in, how can we tell elsewhere in our application? On every request, we have configured middleware that will look for a session token on the incoming request to see if there is an authenticated user.  If there is, subsequent controllers can access our User's information and secure resources based on who is logged in.  Let's take a look at that middleware next.
</chunk>

</step>

<step title="Session Middleware" file="middleware/session.js" language="js">
## Session Middleware
Our session middleware allows us to detect whether or not HTTP requests to our app have an authenticated session associated with them.  We also have a middleware function that will automatically return a 403 Forbidden response if an unauthenticated user tries to access a protected URL.  Let's see how these middleware functions work.

<chunk highlight="4-21">
### Getting the User for a Session
On each request, we look for a session token in the request object. If we have a valid `Session` associated with that token, we automatically fetch the `User` associated with it and make that data available on the request object so subsquent route controllers can access it.
</chunk>

<chunk highlight="23-34">
### Requiring Login for Routes
This middleware function automates the process of restricting individual routes to logged in users.  We saw one example of this earlier, but if I wanted to ensure a visitor was logged in before executing my controller function, I could do the following:

<pre><code>var sess = require("./middleware/session');

function handler(request, response) {
    response.send('you are logged in already!');
}

app.get('/sumpm/secure', sess.requireLogin(), handler);
</code></pre>
</chunk>

</step>

<step title="The Story So Far" language="js">
## The Story So Far
With that, we've managed to implement 2FA in our Express application! This is, of course, far from a battle-ready login system, but these will be the basic steps necessary to integrate 2FA into your existing login system.

Now that we understand the basics of implementing 2FA, let's explore a few more resources that will help you as you move 2FA into production.
</step>