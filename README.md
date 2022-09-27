# Introduction

This library was created in order to have a simple and reusable authentication service while building REST APIs.

## Install & Setup

The project uses 17 different dependencies. It also uses the redis 3.1.2 ver which doesn't support async/await. The windows version can be downloaded from [here](https://github.com/microsoftarchive/redis/releases/tag/win-3.0.504).

To use the library add it to your project:

```bash
const xauth = require('x-auth-service')

import xauth from 'x-auth-service'
```

## Auth Methods

**login**

The login method is used to check if the user's credentials are found inside our database. If the user is found, then we create JWT access and refresh Tokens that are valid for this user as a response.

```bash
   const result = await xauth.authService.login(req.body);
```

**signup**

The signup method is used to add the credentials of a new user into our backend system. The function would then return the JWT tokens as a response, and an email in order for the user to verify their account.

```bash
const result = await xauth.authService.signup(req.body,req.headers);
```

**logout**

The logout method makes sure to delete and blacklist the refresh from the server side which will in turn make sure that the user is logged out of the app. The tokens must also be deleted from the client side.

```bash
await xauth.authService.logout(req.body);
```

**refreshToken**

This method renews access to the user to the system by checking the validity of the token and sending back two new pairs of JWT.

```bash
const result = await xauth.authService.refreshToken(req.body.refreshToken);
```

**forgotPassword**

This function sends an email with a url that contains a JWT token that is valid only for 10min in order to reset their credentials.

```bash
 const result: any = await xauth.authService.forgotPassword(req.headers);
```

**resetPassword**

Checks the old password and updates the database with the new inserted one.

```bash
const result = await xauth.authService.resetPassword(req.params, req.body, req.headers.authorization);
```

**verifyEmail**

Verifies the that the token in the url matches with the userId.

```bash
 await xauth.authService.verifyEmail(req.headers.authorization);
```

**hashPassword**

Helper function that encrypts the user password using the bcryptjs library

```bash
 const hashedPassword = await hashPassword(req.body.password);
```

**isValidPassword**

A helper function that returns true if the decrypted hash and the plain text password match

```bash
const isMatch = await isValidPassword(req.body.password, hashedPassword);
```

## JWT Methods

**setAccessToken**

Generates a temporary access Token that will be used to give access to users

```bash
const accessToken = xauth.setTokens.setAccessToken(userId);
```

**setRefreshToken**

Generates a refresh Token that will be used to send back 2 pairs of JWT tokens

```bash
const refreshToken = await xauth.setTokens.setRefreshToken(userId);
```

**setResetPasswordToken**

Generates a token valid for 10min that will be used to verify that the url belongs to the user

```bash
 const resetPasswordToken = await xauth.setTokens.setResetPasswordToken(userId);
```

**verifyAccessToken**

Verifies that the token is valid. Usually used as middleware for router protection.

```bash
 router.get('/', xauth.verifyTokens.verifyAccessToken , function)
```

**verifyRefreshToken**

Verifies that the token is valid

```bash
const isValid: any = await xauth.verifyTokens.verifyRefreshToken(token);
```

**verifyResetPasswordToken**

Used inside the resetPassword function ro return userId and make sure it is valid.

```bash
const isValid: any = await xauth.verifyTokens.verifyResetPasswordToken(token);
```
