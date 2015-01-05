<step title="Designing Our Domain Model" file="models/User.js" language="js">
## Designing Our Domain Model
To support 2FA in our application, we need to have a login system in place. Authentication is one of those things that's implemented a tiny bit differently in every application on the web, but at a very high level we'll need at least two domain model objects:

* _User_: An individual user of the application that can be uniquely identified
* _Session_: A model representing a User's period of interaction with the application. Creating a session should require a login operation to succeed first.

In our sample application, we've provided model objects that fulfill these two tasks. We won't dive too far into the implementation these model objects (since they only persist information in memory and not to a database), but we will examine their interfaces and features to see how a login system with 2FA might be implemented.
</step>

<step title="The User Model" file="models/User.js" language="js">
## The User Model
Our User model is responsible for storing information about the user (their username, phone number, password, etc.) and testing candidate passwords against (securely hashed in production!) stored passwords.

Let's take a look at how the API for a "User" domain object might be constructed.

<chunk highlight="6-13">
### Defining the User Schema
No matter what persistence framework your application uses, you'll probably define some sort of schema to describe how your domain models are structured.

One module I really like for defining JavaScript obejct schemas independent of a persistence framework is [Joi](https://github.com/hapijs/joi).  With the Joi module you can define data structures and validation logic for arbitrary JavaScript objects. This is super useful if you're building an API that accepts JSON input, but it's also useful for defining business model objects like our User.

Our user has properties like a username, a full (human readable) name, a contact phone number, and a contact preference which can be either `text` or `voice`. This will dictate how we send their 2FA password to them, as we will see later.
</chunk>

<chunk highlight="24-25,28-31,38,40,42-43">
### Saving a User
Our user will need to be able to save its self to the database. How this actually happens will differ between applications, but all I/O operations in a Node.js program should (most of the time) be asynchronous. As such, our `save` method should accept a callback function that will be invoked either with an error object or a positive result of the operation. If you're new to designing async interfaces for Node, [you may want to check out this helpful post](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony).

Before actually executing the save logic, we first use our Joi schema to validate that the User's properties are valid within the constraints of our schema.
</chunk>

<chunk highlight="45-46,65,67">
### Testing a Username / Password Combination
At the "class" level, our User domain model object will need to be able to takle a username/password combination and return a user object for any account that matches those credentials.  We use the same async callback pattern here, calling the passed in callback function with an error object (which is null in the success case) and the user object (which is null if a username/password match was not found).
</chunk>


<chunk highlight="69-70,86,88">
### Finding User Data by Username
Another class-level function we'll need is for querying our data store for users whose username match the one passed in. We have an async interface defined to do this as well.

Now that we know at a high level what our User model does, let's take a look at the Session model.
</chunk>

</step>

<step title="The Session Model" file="models/Session.js" language="js">
## The Session Model
Our Session model is responsible for tracking authenticated user sessions for our application. This model will actually generate the one-time passwords we send to the user via Twilio. We'll dig into how that process works when we step through the login flow later on, but let's look at the high level API for the Session model first.

<chunk highlight="71-75,82">
### Creating a Session
This model has a constructor which associates a User with a new Session. Initally, an instance variable called `verified` is set to false, since the 2FA step has not been completed at the time a new Session is created (after a username/password combo is validated).
</chunk>

<chunk highlight="84-85">
### Saving a Session
As with our User model, we have an async `save` method on the model object.
</chunk>

<chunk highlight="109-110,127-128">
### Finding a Session
We have a pair of "class-level" functions that will allow us to query sessions either by their unique ID or a token string associated with them. We'll see how those ID and token values are used when we examine the login flow later.
</chunk>

<chunk highlight="149-150">
### Destroying a Session
We also have a class-level function that will log out a User by destroying a Session with the given ID.
</chunk>

<chunk highlight="95-107">
### Sending Verification Codes
One instance method we haven't explored yet is this one, which handles sending one-time passcodes to a User associated with the Session. The `sendCode` function is where all the Twilio magic happens - we'll be cracking that nut open when we start exploring the login flow in a moment.
</chunk>

</step>

<step title="The Story So Far" file="models/Session.js" language="js">
## The Story So Far
We've just explored the necessary domain model functions needed to support a 2FA login system. We need a User model to store information about the user (like their full name and phone number), and to compare candidate passwords to stored passwords during the login flow.  We need a Session model, associated with a User model, which can track whether or not it has been validated via 2FA. The Session model is also a logical place to keep code that uses Twilio for outbound communication, code which we will explore at some depth in the next phase of the tutorial.

Now that we understand a domain model that can support 2FA, let's dig into the Express route handlers and front-end code that we use to actually implement the login experience for end users.
</step>