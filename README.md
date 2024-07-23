# Simple Planning Poker

Simple Planning Poker was created thinking about people who form agile teams that just seek to budget user stories, without complications or charges.

This is a completely free and open source service. However, there are costs associated with the availability of the service. If you like this initiative, consider buying me a coffee.

Contributions are welcome.

## Available Resources

- Creation of multiple rooms.
- Entry into a certain room using the generated code.
- The first user to enter the room is defined as the moderator.
- The moderator can register and remove user stories (click on a story to remove it).
- The moderator can start voting.
- The moderator can reveal and reset the votes.
- The moderator can move to the next story or go back to the previous one.
- The moderator can pass the role to another participant.
- If the moderator leaves the room, another participant is defined as the new moderator.

## Local Development

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Server

The Simple Planning Poker server runs on the Websocket protocol for real-time client-server communication. There are two http endpoints to help create rooms and connect users to existing rooms.

The application is capable of handling different rooms independently. Rooms have their own states and automatically close after all users leave or after a predefined time of inactivity.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory to build the Angular application.

The server is ready to run with Node.js. Run `npm install build` to download packages and `node ./server.js` to run the server.
