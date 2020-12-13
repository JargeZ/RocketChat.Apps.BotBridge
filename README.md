# Apps.BotBridge
Provides a small api for creating bots with interactive elements such as buttons.
You can use the api in its raw form as you like, or a [ready-made python library](https://github.com/JargeZ/RocketChat-Simple-AppBot) with a decorator interface.

### Installation steps:

 1. Clone this repo and Change Directory: </br>
 `git clone https://github.com/JargeZ/RocketChat.Apps.BotBridge.git && cd RocketChat.Apps.BotBridge/`

 2. Install the required packages from *package.json*: </br>
	 `npm install`

 3. Deploy Rocket.Chat app: </br>
    `rc-apps deploy --url http://localhost:3000 --username user_username --password user_password`
    Where:
    - `http://localhost:3000` is your local server URL (if you are running in another port, change the 3000 to the appropriate port)
    - `user_username` is the username of your admin user.
    - `user_password` is the password of your admin user.

 4. Go to the admin settings -> applications -> BotBridge. There are two main settings here.
    - `POST webhook` - address to which requests can be sent to send a message.
    - `Backend url` - address where the rocket chat server will send POST requests with new messages.\
    It has to be rocket reachable. Usually this will be either the localhost address for installation on one server. And dns name of the service in docker compose or kubernetes
    - `Controlled bots` - the usernames of the accounts that the application should listen to. By default, it works on an account that will be created for the application automatically.

## Api refference:
Will be here in the future
