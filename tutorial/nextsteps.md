<step title="Making It Better" file="models/User.js" language="js">
## Making It Better
This tutorial should have oriented you on the basic steps necesssary to implement 2FA in your application, but there's more that you'll want to do with this code before it's truly ready for prime time. Let's call out a few of those TODO items.
</step>

<step title="Persistent User Accounts" file="models/User.js" language="js">
## Persistent User Accounts
We didn't introduce persistent user accounts in this tutorial, as we wanted to keep the focus on the 2FA flow rather than a database or login system. But if you're starting from scratch and looking to build an authentication system in Node with Express, here are a few options:

### Passport
[Passport](http://passportjs.org/) is an authentication middleware framework that works well with Express. It supports login schemes for GitHub, Facebook, local username/passwords, and more. If you're looking for more features out of the box, Passport might eb a good option for you.

### Mongoose
If you'd prefer to create your own user models, you might check out [Mongoose](http://mongoosejs.com/), an object modeling framework for [MongoDB](http://www.mongodb.org/). The model objects in this tutorial were based very heavily on how you might implement those models using a framework like Mongoose.

There are [a few](http://miamicoder.com/2014/using-mongodb-and-mongoose-for-user-registration-login-and-logout-in-a-mobile-application/) handy [tutorials](http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt) on how you might set up a User/Session model with Mongoose, on top of which you might consider adding 2FA.

### LoopBack
If you'd like to try a higher-level framework than Express, you might try [LoopBack](http://loopback.io/), which is built on top of it. It has a baked-in concept of a User model - you can [check out an example of it here](https://github.com/strongloop/loopback-example-access-control).

Every application's login needs are a little different, but the 2FA steps should be about the same no matter which solution you choose.
</step>

<step title="Don't Require 2FA Every Time" file="controllers/session.js" language="js">
## Don't Require 2FA Every Time
Requiring a 2FA step on every login may not be the best choice for your application. You'll probably, at least for a given computer, want to only require 2FA every few weeks, or when the user is logging in from a new computer. The way that you would accomplish something like this is using cookies associated with a user of the application.

We are already using it in this application, but the [session](https://github.com/expressjs/session#reqsessioncookie) middleware's cookie functionality should give you the tools you need to remember how and where your users have logged in. 
</step>

<step title="User Account Verification" file="controllers/user.js" language="js">
## User Account Verification
The same techniques you use for 2FA can also be used to verify new user accounts. You can send a one-time code to new users when they sign up to prove that they are human. This can increase the quality of your signups and lead to fewer wasted resources. Expect a tutorial on this topic very soon as well.
</step>

<step title="Let Us Help!" file="controllers/user.js" language="js">
## Let Us Help!
If you'd like to implement 2FA in your application and need a little assistance, we've got your back! Send a note to [help@twilio.com](mailto:help@twilio.com) and let us know what your needs are. We'd love to help you get up and running.

Thanks for checking out this tutorial!
</step>