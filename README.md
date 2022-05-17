<img src="https://user-images.githubusercontent.com/97472180/168814638-00789627-8b0a-461d-ae49-f50bb47c2384.png" width="500" height="250" alt="GET-ALL"/>  


## *Requirements:*
* Node.js & Express
* MongoDB
* Download the code or clone it to your local repository.
* `npm install` all dependencies from `package.json`.
* Add `APP_ID` and `APP_SECRET` to access Oauth for Google and Facebook Login
* Run `app.js` on a local node server (default PORT number: 3000).  

## Changing PORT number:
On the bottom of `app.js` there's a const called `PORT`.  
Inside the declaration of that const there's the default port number - 3000.  
To change the port number, simply remove the default port number and insert your preferred one instead.
``` diff
- const PORT = process.env.PORT || 3000;
+ const PORT = process.env.PORT || YourPortNumber;
```
<br>   

## **Go back to previous commits to check for various authentication methods:**  
* Database Encryption
* Hashing
* Salting (using bcrypt)
* Cookies and sessions
* Oauth 2.0
<br>

## *Screenshots :*

Login Screen:  

<img src="https://user-images.githubusercontent.com/97472180/168814641-7b04749c-ea93-4597-9918-bb720e9063cf.PNG" alt="Login-Screen" width="480" height="170"/>  
  
All Secrets (visible only after being logged in):  

<img src="https://user-images.githubusercontent.com/97472180/168814635-893d3f1c-04f8-4bab-b293-9b924f05e3c0.PNG" alt="All-Secrets" width="500" height="280"/>  
  
Add new secret:  

<img src="https://user-images.githubusercontent.com/97472180/168814646-3d09e97b-8130-4143-b1f5-99833f8cbf20.png" alt="New-Secret" width="500" height="190"/>
  
All Secrets Screen - on mobile:  
  
<img src="https://user-images.githubusercontent.com/97472180/168814642-1aafed74-faa2-4459-b169-056ef345e2ec.PNG" alt="Mobile" width="190" height="370"/>  
